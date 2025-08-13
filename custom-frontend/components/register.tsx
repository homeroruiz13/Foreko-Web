"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "./container";
import { Logo } from "./logo";
import {
  IconBrandGoogleFilled,
} from "@tabler/icons-react";
import { Button } from "./elements/button";

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Check your email to verify your account.');
        // Store email in localStorage as backup for verification page
        localStorage.setItem('pendingVerificationEmail', formData.email);
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
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
        Create a Foreko Account
      </h1>
      <p className="text-neutral-400 text-center mb-4">
        Create your account to start your free trial
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
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="h-10 pl-4 w-full mb-4 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800 disabled:opacity-50"
        />
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="h-10 pl-4 w-full mb-4 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800 disabled:opacity-50"
        />
        <Button variant="muted" type="submit" className="w-full py-3" disabled={loading}>
          <span className="text-sm">{loading ? 'Creating Account...' : 'Create Account'}</span>
        </Button>
      </form>

      <div className="text-center mb-4">
        <p className="text-neutral-400 text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-400 hover:text-blue-300">
            Sign in here
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
          <span className="text-sm">Sign up with Apple</span>
        </button>
        <button 
          onClick={() => window.location.href = '/api/auth/oauth/facebook'}
          disabled={loading}
          className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image src="/images/facebook.png" alt="Facebook" width={16} height={16} />
          <span className="text-sm">Sign up with Facebook</span>
        </button>
        <button 
          onClick={() => window.location.href = '/api/auth/oauth/microsoft'}
          disabled={loading}
          className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image src="/images/microsoft.png" alt="Microsoft" width={16} height={16} />
          <span className="text-sm">Sign up with Microsoft</span>
        </button>
        <button 
          onClick={() => window.location.href = '/api/auth/oauth/google'}
          disabled={loading}
          className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconBrandGoogleFilled className="h-4 w-4 text-black" />
          <span className="text-sm">Sign up with Google</span>
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
