"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "./container";
import { Button } from "./elements/button";

export const ResetPassword = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success notification
    setShowSuccess(true);
    
    // Redirect to login after 4 seconds
    setTimeout(() => {
      router.push("/sign-in");
    }, 4000);
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

  return (
    <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-5xl font-bold my-4 text-center">
        Reset Your Password
      </h1>
      <p className="text-neutral-400 text-center mb-6 text-lg">
        Enter your new password below
      </p>

      <form className="w-full my-4" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          required
          className="h-10 pl-4 w-full mb-4 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
        />
        
        <input
          type="password"
          placeholder="Confirm New Password"
          required
          className="h-10 pl-4 w-full mb-6 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
        />
        
        <Button variant="muted" type="submit" className="w-full py-3">
          <span className="text-sm">Update Password</span>
        </Button>
      </form>
    </Container>
  );
};