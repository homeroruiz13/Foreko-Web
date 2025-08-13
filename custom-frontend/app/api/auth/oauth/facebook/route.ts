import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from '../../../../../lib/oauth-simple';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!OAuthHelper.isProviderConfigured('facebook')) {
      return NextResponse.json(
        { error: 'Facebook OAuth not configured' },
        { status: 500 }
      );
    }

    const state = OAuthHelper.generateState();
    const authUrl = OAuthHelper.generateAuthUrl('facebook', state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Facebook OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 }
    );
  }
}