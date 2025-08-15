"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "./container";
import {
  IconBrandGoogleFilled,
} from "@tabler/icons-react";
import { Button } from "./elements/button";

export const Login = ({ forceLogout = false }: { forceLogout?: boolean }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Force redirect to sign-in with logout flag to bypass middleware auth check
      window.location.href = '/en/sign-in?force=true';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to clear client state
      window.location.href = '/en/sign-in?force=true';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('Remember me value:', formData.rememberMe);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      };
      console.log('Sending payload:', payload);

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Get the auth token/session info to pass to dashboard
        const authData = {
          userId: data.user.id,
          email: data.user.email,
          name: data.user.name,
          sessionId: data.sessionInfo.id,
          expiresAt: data.sessionInfo.expiresAt
        };
        
        // Encode auth data for URL
        const authString = btoa(JSON.stringify(authData));
        // Get current locale from pathname or default to 'en'
        const currentLocale = window.location.pathname.split('/')[1] || 'en';
        const redirectUrl = `/${currentLocale}/dashboard/data-import?auth=${authString}`;
        
        setSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1500);
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
        Log in
      </h1>
      <p className="text-neutral-400 text-center mb-4 text-lg">
        Continue to Foreko
      </p>

      {error && (
        <div className="w-full mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {forceLogout && (
        <div className="w-full mb-4 p-3 bg-blue-900/20 border border-blue-500 rounded-md">
          <p className="text-blue-400 text-sm text-center">You have been logged out successfully. Please sign in again.</p>
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
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="h-10 pl-4 w-full mb-4 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800 disabled:opacity-50"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="h-10 pl-4 w-full mb-4 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800 disabled:opacity-50"
        />
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center space-x-2 text-sm text-neutral-400 cursor-pointer">
            <input 
              type="checkbox" 
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={loading}
              className="w-4 h-4 rounded border-2 border-neutral-600 bg-charcoal text-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 disabled:opacity-50" 
            />
            <span>Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
            Forgot password?
          </Link>
        </div>
        <Button variant="muted" type="submit" className="w-full py-3" disabled={loading}>
          <span className="text-sm">{loading ? 'Logging in...' : 'Log in'}</span>
        </Button>
      </form>

      <div className="text-center mb-4">
        <p className="text-neutral-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-blue-400 hover:text-blue-300">
            Create one here
          </Link>
        </p>
      </div>

      <Divider />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button 
          onClick={() => window.location.href = '/api/auth/oauth/apple'}
          disabled={loading}
          className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image src="/images/apple.png" alt="Apple" width={16} height={16} />
          <span className="text-sm">Login with Apple</span>
        </button>
        <button 
          onClick={() => window.location.href = '/api/auth/oauth/facebook'}
          disabled={loading}
          className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image src="/images/facebook.png" alt="Facebook" width={16} height={16} />
          <span className="text-sm">Login with Facebook</span>
        </button>
        <button 
          onClick={() => window.location.href = '/api/auth/oauth/microsoft'}
          disabled={loading}
          className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image src="/images/microsoft.png" alt="Microsoft" width={16} height={16} />
          <span className="text-sm">Login with Microsoft</span>
        </button>
        <button 
          onClick={() => window.location.href = '/api/auth/oauth/google'}
          disabled={loading}
          className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconBrandGoogleFilled className="h-4 w-4 text-black" />
          <span className="text-sm">Login with Google</span>
        </button>
      </div>
    </Container>
  );
};

const Divider = () => {
  return (
    <div className="relative w-full py-8">
      <div className="w-full h-px bg-neutral-700 rounded-tr-xl rounded-tl-xl" />
      <div className="w-full h-px bg-neutral-800 rounded-br-xl rounded-bl-xl" />
      <div className="absolute inset-0 h-5 w-5 m-auto rounded-md px-3 py-0.5 text-xs bg-neutral-800 shadow-[0px_-1px_0px_0px_var(--neutral-700)] flex items-center justify-center">
        OR
      </div>
    </div>
  );
}; 