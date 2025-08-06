"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "./container";
import {
  IconBrandGoogleFilled,
} from "@tabler/icons-react";
import { Button } from "./elements/button";

export const Login = () => {
  return (
    <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-5xl font-bold my-4 text-center">
        Log in
      </h1>
      <p className="text-neutral-400 text-center mb-4 text-lg">
        Continue to Foreko
      </p>

      <form className="w-full my-4">
        <input
          type="email"
          placeholder="Email Address"
          className="h-10 pl-4 w-full mb-4 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
        />
        <input
          type="password"
          placeholder="Password"
          className="h-10 pl-4 w-full mb-4 rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
        />
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center space-x-2 text-sm text-neutral-400">
            <input type="checkbox" className="rounded border-neutral-800 bg-charcoal" />
            <span>Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
            Forgot password?
          </Link>
        </div>
        <Button variant="muted" type="submit" className="w-full py-3">
          <span className="text-sm">Log in</span>
        </Button>
      </form>

      <Divider />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset]">
          <Image src="/images/apple.png" alt="Apple" width={16} height={16} />
          <span className="text-sm">Login with Apple</span>
        </button>
        <button className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset]">
          <Image src="/images/facebook.png" alt="Facebook" width={16} height={16} />
          <span className="text-sm">Login with Facebook</span>
        </button>
        <button className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset]">
          <Image src="/images/microsoft.png" alt="Microsoft" width={16} height={16} />
          <span className="text-sm">Login with Microsoft</span>
        </button>
        <button className="flex justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset]">
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