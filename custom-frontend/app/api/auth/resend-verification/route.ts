import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { EmailVerificationModel } from '@/lib/models/email-verification';
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

    // Find user by email
    const user = await UserModel.findByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.status === 'active' && user.email_verified_at) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Create new email verification
    const verification = await EmailVerificationModel.create(user.id);
    
    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verification.token
    );

    if (!emailSent) {
      console.error('Failed to send verification email to:', email);
    }

    return NextResponse.json(
      { 
        message: 'Verification email sent successfully. Please check your email.',
        emailSent: emailSent,
        token: emailSent ? undefined : verification.token // Include token for testing when email fails
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}