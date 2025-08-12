import { NextRequest, NextResponse } from 'next/server';
import { AuthCleanupService } from '@/lib/cleanup';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check for admin users only
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CLEANUP_API_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await AuthCleanupService.cleanupExpiredTokens();
    
    if (result.success) {
      return NextResponse.json(
        { message: 'Cleanup completed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Cleanup failed', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}