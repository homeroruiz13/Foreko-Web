import { NextRequest, NextResponse } from 'next/server';
import { revokeUserSession, revokeAllUserSessions, getSessionTokenFromRequest, getClientIP } from '@/lib/auth-session';
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
    
    // Get session token and revoke all user sessions to prevent any lingering auth
    const sessionToken = getSessionTokenFromRequest(request);
    if (sessionToken && userId) {
      // Revoke all sessions for this user to prevent auth loops
      await revokeAllUserSessions(userId);
    } else if (sessionToken) {
      // Fallback to single session revoke
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

    // Clear both auth tokens more thoroughly
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
      expires: new Date(0) // Set explicit past expiry date
    });

    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
      expires: new Date(0) // Set explicit past expiry date
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
      path: '/',
      maxAge: 0,
      expires: new Date(0)
    });

    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0)
    });

    return response;
  }
}