"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "./container";
import { Button } from "./elements/button";

export const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token');
        setCheckingToken(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          setError(data.error || 'Invalid or expired reset token');
        }
      } catch (error) {
        setError('Error validating reset token');
      } finally {
        setCheckingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/sign-in");
        }, 4000);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-center">
            Password Updated!
          </h1>
          <p className="text-neutral-400 text-center text-lg">
            Your password has been successfully changed. Redirecting to login...
          </p>
        </div>
      </Container>
    );
  }

  if (checkingToken) {
    return (
      <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            Validating Reset Link...
          </h1>
          <p className="text-neutral-400">Please wait while we verify your reset token.</p>
        </div>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-red-400">
            Invalid Reset Link
          </h1>
          <p className="text-neutral-400 mb-6">{error}</p>
          <Button 
            variant="muted" 
            onClick={() => router.push('/forgot-password')}
            className="px-6 py-3"
          >
            <span className="text-sm">Request New Reset Link</span>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-5xl font-bold my-4 text-center">
        Reset Your Password
      </h1>
      <p className="text-neutral-400 text-center mb-6 text-lg">
        Enter your new password below
      </p>

      {error && (
        <div className="w-full mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <form className="w-full my-4" onSubmit={handleSubmit}>
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="h-10 pl-4 w-full mb-4 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800 disabled:opacity-50"
        />
        
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="h-10 pl-4 w-full mb-6 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800 disabled:opacity-50"
        />
        
        <Button variant="muted" type="submit" className="w-full py-3" disabled={loading}>
          <span className="text-sm">{loading ? 'Updating...' : 'Update Password'}</span>
        </Button>
      </form>
    </Container>
  );
};