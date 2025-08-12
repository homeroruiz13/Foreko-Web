import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { createUserSession, getClientIP } from '@/lib/auth-session';
import { SecurityUtils } from '@/lib/utils/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await UserModel.authenticateUser({ email, password });
    const ipAddress = getClientIP(request);
    
    if (!user) {
      // Log failed login attempt
      await SecurityUtils.logSecurityEvent(
        null, null,
        SecurityUtils.SecurityEvents.LOGIN_FAILURE,
        { email, reason: 'invalid_credentials' },
        ipAddress
      );
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      // Log suspended account login attempt
      await SecurityUtils.logSecurityEvent(
        user.id, null,
        SecurityUtils.SecurityEvents.LOGIN_FAILURE,
        { email, reason: 'account_suspended' },
        ipAddress
      );
      
      return NextResponse.json(
        { error: 'Account is suspended' },
        { status: 403 }
      );
    }

    if (user.status === 'pending') {
      // Log pending account login attempt
      await SecurityUtils.logSecurityEvent(
        user.id, null,
        SecurityUtils.SecurityEvents.LOGIN_FAILURE,
        { email, reason: 'email_not_verified' },
        ipAddress
      );
      
      return NextResponse.json(
        { error: 'Please verify your email address before signing in' },
        { status: 403 }
      );
    }

    // Log successful login
    await SecurityUtils.logSecurityEvent(
      user.id, null,
      SecurityUtils.SecurityEvents.LOGIN_SUCCESS,
      { 
        email, 
        rememberMe,
        userAgent: request.headers.get('user-agent')
      },
      ipAddress
    );

    // Create user session with different expiration based on remember me
    const sessionExpiryDays = rememberMe ? 30 : 1;
    const session = await createUserSession(user.id, request, sessionExpiryDays);
    const jwtToken = UserModel.generateToken(user);

    // Set both JWT and session cookies
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status
        },
        sessionInfo: {
          id: session.id,
          expiresAt: session.expires_at
        }
      },
      { status: 200 }
    );

    // Set different expiration times based on remember me preference
    const jwtMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 1; // 30 days or 1 day
    const sessionMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 1; // 30 days or 1 day

    // Set JWT token (for backward compatibility)
    response.cookies.set('auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: jwtMaxAge
    });

    // Set session token (primary authentication method)
    response.cookies.set('session-token', session.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sessionMaxAge
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}