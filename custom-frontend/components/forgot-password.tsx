"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Container } from "./container";
import { Button } from "./elements/button";

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setEmail(''); // Clear form
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-5xl font-bold my-4 text-center">
        Forgot your password?
      </h1>
      <p className="text-neutral-400 text-center mb-6 text-lg">
        Enter your email and we will send you a reset link
      </p>

      {error && (
        <div className="w-full mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {success && (
        <div className="w-full mb-4 p-3 bg-green-900/20 border border-green-500 rounded-md">
          <p className="text-green-400 text-sm text-center">{success}</p>
        </div>
      )}

      <form className="w-full my-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="h-10 pl-4 w-full mb-6 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800 disabled:opacity-50"
        />
        
        <Button variant="muted" type="submit" className="w-full py-3 mb-4" disabled={loading}>
          <span className="text-sm">{loading ? 'Sending...' : 'Reset Password'}</span>
        </Button>
        
        <Link 
          href="/sign-in" 
          className="w-full text-center text-sm text-neutral-400 hover:text-white transition duration-200 block"
        >
          ← Back to Log in
        </Link>
      </form>
    </Container>
  );
};