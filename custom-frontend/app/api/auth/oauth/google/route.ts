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

    const state = OAuthHelper.generateState();
    const authUrl = OAuthHelper.generateAuthUrl('google', state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 }
    );
  }
}