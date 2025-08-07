"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { Button } from "@/components/elements/button";
import { AmbientColor } from "@/components/decorations/ambient-color";
import StarBackground from "@/components/decorations/star-background";
import ShootingStars from "@/components/decorations/shooting-star";
import { IconX, IconArrowLeft, IconRefresh } from "@tabler/icons-react";

export default function PaymentCancelledPage() {
  const router = useRouter();

  const handleBackToPlans = () => {
    router.push('/subscription');
  };

  const handleTryAgain = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 bg-charcoal z-50 overflow-hidden">
      <AmbientColor />
      <StarBackground />
      <ShootingStars />
      
      <Container className="relative h-screen max-w-3xl mx-auto flex flex-col items-center justify-center px-8 z-10 text-center">
        <div className="mb-8">
          <Logo />
        </div>
        
        {/* Cancelled Icon */}
        <div className="w-20 h-20 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mb-8">
          <IconX className="w-10 h-10 text-red-400 stroke-[2px]" />
        </div>
        
        {/* Cancelled Message */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
          Payment Cancelled
        </h1>
        
        <p className="text-lg text-neutral-300 mb-2">
          No worries! Your payment was not processed.
        </p>
        <p className="text-lg text-neutral-300 mb-8">
          You can try again anytime or choose a different plan.
        </p>

        {/* Information Card */}
        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8 mb-8 max-w-md w-full">
          <h3 className="text-xl font-semibold text-white mb-4">What happened?</h3>
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            You cancelled the payment process before completion. No charges were made to your payment method.
          </p>
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <p className="text-xs text-neutral-400">
              💡 <strong>Tip:</strong> All our plans come with a 30-day money-back guarantee, so you can subscribe with confidence.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button
            onClick={handleTryAgain}
            className="flex-1 px-6 py-4 text-lg font-semibold rounded-lg bg-white hover:bg-neutral-100 text-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              <IconRefresh className="w-5 h-5" />
              Try Again
            </span>
          </Button>
          
          <Button
            onClick={handleBackToPlans}
            className="flex-1 px-6 py-4 text-lg font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              <IconArrowLeft className="w-5 h-5" />
              Back to Plans
            </span>
          </Button>
        </div>

        {/* Support */}
        <div className="mt-12">
          <p className="text-neutral-500 text-sm mb-2">
            Having trouble with payment? We're here to help.
          </p>
          <button 
            onClick={() => window.open('mailto:support@foreko.com', '_blank')}
            className="text-white hover:text-neutral-300 transition-colors duration-200 text-sm underline"
          >
            Contact Support
          </button>
        </div>
      </Container>
    </div>
  );
}