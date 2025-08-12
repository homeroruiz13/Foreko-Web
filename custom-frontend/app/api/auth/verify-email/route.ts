import { NextRequest, NextResponse } from 'next/server';
import { EmailVerificationModel } from '@/lib/models/email-verification';
import { UserModel } from '@/lib/models/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const result = await EmailVerificationModel.verifyToken(token);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Get the updated user
    const user = await UserModel.findById(result.userId!);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate JWT token for the verified user
    const jwtToken = UserModel.generateToken(user);

    // Set httpOnly cookie
    const response = NextResponse.json(
      { 
        message: 'Email verified successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          email_verified_at: user.email_verified_at
        }
      },
      { status: 200 }
    );

    response.cookies.set('session-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const infoOnly = searchParams.get('info') === 'true';

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    if (infoOnly) {
      // Just return user info without verifying
      const tokenRecord = await EmailVerificationModel.findByToken(token);
      
      if (!tokenRecord) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 404 }
        );
      }

      if (new Date() > tokenRecord.expires_at) {
        return NextResponse.json(
          { error: 'Token has expired' },
          { status: 400 }
        );
      }

      const user = await UserModel.findById(tokenRecord.user_id);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        email: user.email,
        name: user.name,
        status: user.status,
        tokenValid: !tokenRecord.is_used && new Date() <= tokenRecord.expires_at
      });
    }

    // Normal verification flow
    const result = await EmailVerificationModel.verifyToken(token);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Get the updated user
    const user = await UserModel.findById(result.userId!);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate JWT token for the verified user
    const jwtToken = UserModel.generateToken(user);

    // Set httpOnly cookie
    const response = NextResponse.json(
      { 
        message: 'Email verified successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          email_verified_at: user.email_verified_at
        }
      },
      { status: 200 }
    );

    response.cookies.set('session-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}