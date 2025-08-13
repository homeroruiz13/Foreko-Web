import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetModel } from '@/lib/models/password-reset';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // Validation
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate reset token
    const tokenValidation = await PasswordResetModel.validateToken(token);
    
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error },
        { status: 400 }
      );
    }

    const userId = tokenValidation.userId!;

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await query(
      'UPDATE auth.users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );

    // Mark reset token as used
    await PasswordResetModel.markAsUsed(token);

    // Invalidate all other reset tokens for this user
    await PasswordResetModel.invalidateAllForUser(userId);

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
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

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    // Validate reset token
    const tokenValidation = await PasswordResetModel.validateToken(token);
    
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error, valid: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Token is valid', valid: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    );
  }
}