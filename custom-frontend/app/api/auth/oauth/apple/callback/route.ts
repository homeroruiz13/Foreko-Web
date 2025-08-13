import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from '../../../../../../lib/oauth-simple';
import { UserSessionModel } from '../../../../../../lib/models/user-session';
import { UserModel } from '../../../../../../lib/models/user';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Apple OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_cancelled`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_failed`);
    }

    return await handleAppleCallback(request, code);
  } catch (error) {
    console.error('Apple OAuth GET callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_failed`);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const error = formData.get('error') as string;
    const idToken = formData.get('id_token') as string;

    if (error) {
      console.error('Apple OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_cancelled`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_failed`);
    }

    return await handleAppleCallback(request, code, idToken);
  } catch (error) {
    console.error('Apple OAuth POST callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_failed`);
  }
}

async function handleAppleCallback(request: NextRequest, code: string, idToken?: string): Promise<NextResponse> {
  // Get the client IP and User-Agent
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || '';

  // Handle OAuth callback
  const user = await OAuthHelper.handleOAuthCallback('apple', code, idToken);

  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_failed`);
  }

  // Create user session
  const session = await UserSessionModel.create({
    userId: user.id,
    ipAddress: ip,
    userAgent: userAgent
  });

  // Set session cookie
  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  
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
}