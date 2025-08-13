import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from '../../../../../lib/oauth-simple';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!OAuthHelper.isProviderConfigured('microsoft')) {
      return NextResponse.json(
        { error: 'Microsoft OAuth not configured' },
        { status: 500 }
      );
    }

    const state = OAuthHelper.generateState();
    const authUrl = OAuthHelper.generateAuthUrl('microsoft', state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Microsoft OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 }
    );
  }
}