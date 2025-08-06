"use client";
import React from "react";
import Link from "next/link";
import { Container } from "./container";
import { Button } from "./elements/button";

export const ForgotPassword = () => {
  return (
    <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-5xl font-bold my-4 text-center">
        Forgot your password?
      </h1>
      <p className="text-neutral-400 text-center mb-6 text-lg">
        Enter your email and we will send you a reset link
      </p>

      <form className="w-full my-4">
        <input
          type="email"
          placeholder="Email Address"
          className="h-10 pl-4 w-full mb-6 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
        />
        
        <Button variant="muted" type="submit" className="w-full py-3 mb-4">
          <span className="text-sm">Reset Password</span>
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