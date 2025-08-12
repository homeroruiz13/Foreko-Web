import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { PasswordResetModel } from '@/lib/models/password-reset';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);
    
    // Always return success to prevent email enumeration attacks
    const successMessage = 'If an account with that email exists, we have sent a password reset link.';
    
    if (!user) {
      return NextResponse.json(
        { message: successMessage },
        { status: 200 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { message: successMessage },
        { status: 200 }
      );
    }

    // Create password reset token
    const reset = await PasswordResetModel.create(user.id);
    
    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      reset.token
    );

    if (!emailSent) {
      console.error('Failed to send password reset email to:', email);
    }

    return NextResponse.json(
      { 
        message: successMessage,
        emailSent
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}