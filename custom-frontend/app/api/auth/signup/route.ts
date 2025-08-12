import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { EmailVerificationModel } from '@/lib/models/email-verification';
import { emailService } from '@/lib/email';
import { SecurityUtils } from '@/lib/utils/security';
import { getClientIP } from '@/lib/auth-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Create user
    const user = await UserModel.createUser({ name, email, password });
    
    // Log user signup
    const ipAddress = getClientIP(request);
    await SecurityUtils.logSecurityEvent(
      user.id, null,
      'user_signup',
      { 
        email,
        name,
        userAgent: request.headers.get('user-agent')
      },
      ipAddress
    );
    
    // Create email verification
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
        message: 'User created successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status
        },
        emailSent
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof Error && error.message === 'User with this email already exists') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}