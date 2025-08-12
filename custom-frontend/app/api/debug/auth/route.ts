import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    // Get all cookies for debugging
    const allCookies = request.cookies.getAll();
    const authToken = request.cookies.get('auth-token');
    const sessionToken = request.cookies.get('session-token');
    
    let user = null;
    let tokenValid = false;
    
    if (token) {
      user = await getUserFromToken(token);
      tokenValid = !!user;
    }
    
    return NextResponse.json({
      debug: true,
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 20)}...` : null,
      tokenValid,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status
      } : null,
      cookies: {
        authToken: authToken ? `${authToken.value.substring(0, 20)}...` : null,
        sessionToken: sessionToken ? `${sessionToken.value.substring(0, 20)}...` : null,
        allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
      },
      headers: {
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      }
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      debug: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasToken: false,
      tokenValid: false
    });
  }
}