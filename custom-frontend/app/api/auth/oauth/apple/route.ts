import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from '../../../../../lib/oauth-simple';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!OAuthHelper.isProviderConfigured('apple')) {
      return NextResponse.json(
        { error: 'Apple OAuth not configured' },
        { status: 500 }
      );
    }

    const state = OAuthHelper.generateState();
    const authUrl = OAuthHelper.generateAuthUrl('apple', state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Apple OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 }
    );
  }
}