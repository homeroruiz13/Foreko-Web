"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "./container";
import { Button } from "./elements/button";
import { IconMail, IconCheck, IconX, IconRefresh } from "@tabler/icons-react";

export const EmailVerification = () => {
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error' | 'resending'>('pending');
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (email) {
      setUserEmail(decodeURIComponent(email));
    } else {
      // Try to get email from localStorage (might be set during signup)
      const storedEmail = localStorage.getItem('pendingVerificationEmail');
      if (storedEmail) {
        setUserEmail(storedEmail);
      } else if (token) {
        // If we have a token but no email, fetch the user's email from the backend
        fetchUserEmailFromToken(token);
      }
    }
  }, [email, token]);

  const fetchUserEmailFromToken = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}&info=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.email) {
          setUserEmail(data.email);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user email:', error);
    }
  };

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus('verifying');
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        // Clear the stored email since verification is successful
        localStorage.removeItem('pendingVerificationEmail');
        setTimeout(() => {
          router.push('/company-setup');
        }, 3000);
      } else {
        setStatus('error');
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setError('Network error. Please try again.');
    }
  }, [router]);

  // Handle email verification when token is present
  useEffect(() => {
    if (token) {
      console.log('Token found in URL:', token);
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const resendVerification = async () => {
    if (!userEmail || resendCooldown > 0) return;

    setStatus('resending');
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('pending');
        setResendCooldown(60); // 60 second cooldown
      } else {
        setStatus('error');
        setError(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setStatus('error');
      setError('Network error. Please try again.');
    }
  };

  // Success state
  if (status === 'success') {
    return (
      <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
            <IconCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-green-400">
            Email Verified!
          </h1>
          <p className="text-neutral-400 text-lg mb-6">
            Your email has been successfully verified. Redirecting you to complete your company setup...
          </p>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <span className="ml-2 text-sm text-neutral-400">Redirecting...</span>
          </div>
        </div>
      </Container>
    );
  }

  // Verifying state
  if (status === 'verifying') {
    return (
      <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            Verifying Your Email...
          </h1>
          <p className="text-neutral-400 text-lg">
            Please wait while we verify your email address.
          </p>
        </div>
      </Container>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
            <IconX className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-red-400">
            Verification Failed
          </h1>
          <p className="text-neutral-400 text-lg mb-6">
            {error}
          </p>
          {userEmail && (
            <Button 
              variant="muted" 
              onClick={resendVerification}
              disabled={resendCooldown > 0}
              className="px-6 py-3 mb-4"
            >
              <IconRefresh className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
              </span>
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => router.push('/sign-up')}
            className="px-6 py-3"
          >
            <span className="text-sm">Back to Sign Up</span>
          </Button>
        </div>
      </Container>
    );
  }

  // Pending state (waiting for user to check email)
  return (
    <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center">
          <IconMail className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold mb-4">
          Check Your Email
        </h1>
        <p className="text-neutral-400 text-lg mb-2">
          We&apos;ve sent a verification link to:
        </p>
        <p className="text-white font-medium text-lg mb-6">
          {userEmail || 'the email address you registered with'}
        </p>
        <p className="text-neutral-400 text-sm mb-8">
          Click the link in the email to verify your account and continue to company setup.
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {userEmail && (
            <Button 
              variant="muted" 
              onClick={resendVerification}
              disabled={resendCooldown > 0 || status === 'resending'}
              className="w-full py-3"
            >
              <IconRefresh className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {status === 'resending' 
                  ? 'Resending...' 
                  : resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Verification Email'
                }
              </span>
            </Button>
          )}
          
          <div className="text-center">
            <p className="text-neutral-400 text-sm">
              Wrong email address?{" "}
              <button 
                onClick={() => router.push('/sign-up')}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Sign up again
              </button>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};