import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Apple OAuth requires complex private key setup
  // For now, return a message indicating it's not yet implemented
  return NextResponse.json(
    { error: 'Apple OAuth is not yet implemented. Please use Google, Microsoft, or Facebook.' },
    { status: 501 }
  );
}