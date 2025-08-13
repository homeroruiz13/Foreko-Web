import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from '../../../../../../lib/oauth-simple';
import { UserSessionModel } from '../../../../../../lib/models/user-session';
import { UserModel } from '../../../../../../lib/models/user';

// Force dynamic rendering for OAuth callbacks
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 
         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.foreko.app');
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const baseUrl = getBaseUrl();

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=oauth_cancelled`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=oauth_failed`);
    }

    // Get the client IP and User-Agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Handle OAuth callback
    const user = await OAuthHelper.handleOAuthCallback('google', code);

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=oauth_failed`);
    }

    // Create user session
    const session = await UserSessionModel.create({
      userId: user.id,
      ipAddress: ip,
      userAgent: userAgent
    });

    // Set session cookie
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    
    // Set secure session cookie
    response.cookies.set('session_token', session.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    // Also set JWT for backward compatibility
    const token = UserModel.generateToken(user.id);
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${getBaseUrl()}/auth/signin?error=oauth_failed`);
  }
}