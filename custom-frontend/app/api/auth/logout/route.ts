import { NextRequest, NextResponse } from 'next/server';
import { revokeUserSession, getSessionTokenFromRequest, getClientIP } from '@/lib/auth-session';
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth';
import { SecurityUtils } from '@/lib/utils/security';

export async function POST(request: NextRequest) {
  try {
    // Get user info before logout for security logging
    const token = getTokenFromRequest(request);
    let userId: string | undefined;
    
    if (token) {
      const user = await getUserFromToken(token);
      userId = user?.id;
    }
    
    // Get session token and revoke it
    const sessionToken = getSessionTokenFromRequest(request);
    if (sessionToken) {
      await revokeUserSession(sessionToken);
    }
    
    // Log logout event
    if (userId) {
      const ipAddress = getClientIP(request);
      await SecurityUtils.logSecurityEvent(
        userId, null,
        SecurityUtils.SecurityEvents.LOGOUT,
        { userAgent: request.headers.get('user-agent') },
        ipAddress
      );
    }

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear both auth tokens
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    });

    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if session revocation fails, clear cookies
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    return response;
  }
}