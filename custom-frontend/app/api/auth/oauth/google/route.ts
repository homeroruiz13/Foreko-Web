import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from '../../../../../lib/oauth-simple';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!OAuthHelper.isProviderConfigured('google')) {
      return NextResponse.json(
        { error: 'Google OAuth not configured' },
        { status: 500 }
      );
    }

    // If accessed from Vercel preview URL, redirect to main domain for OAuth
    const host = request.headers.get('host');
    if (host && host.includes('vercel.app')) {
      return NextResponse.redirect('https://www.foreko.app/api/auth/oauth/google');
    }

    // Always use main domain for OAuth callback to avoid dynamic URI issues
    const customRedirectUri = 'https://www.foreko.app/api/auth/oauth/google/callback';

    const state = OAuthHelper.generateState();
    const authUrl = OAuthHelper.generateAuthUrl('google', state, customRedirectUri);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 }
    );
  }
}