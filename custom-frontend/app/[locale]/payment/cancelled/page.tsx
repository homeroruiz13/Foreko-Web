"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { Button } from "@/components/elements/button";
import { AmbientColor } from "@/components/decorations/ambient-color";
import StarBackground from "@/components/decorations/star-background";
import ShootingStars from "@/components/decorations/shooting-star";
import { IconX, IconArrowLeft, IconCreditCard } from "@tabler/icons-react";

export default function PaymentCancelledPage() {
  const router = useRouter();

  const handleRetryPayment = () => {
    router.back(); // Go back to payment page
  };

  const handleBackToPlans = () => {
    router.push('/subscription');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-charcoal z-50 overflow-hidden">
      <AmbientColor />
      <StarBackground />
      <ShootingStars />
      
      <Container className="relative h-screen max-w-4xl mx-auto flex flex-col items-center justify-center px-8 z-10">
        <div className="mb-8">
          <Logo />
        </div>
        
        <div className="text-center max-w-lg">
          {/* Cancelled Icon */}
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconX className="h-10 w-10 text-orange-400 stroke-[3px]" />
          </div>
          
          {/* Cancelled Message */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Payment Cancelled
          </h1>
          
          <p className="text-lg text-neutral-300 mb-4">
            Your payment was cancelled and no charges were made.
          </p>
          
          <p className="text-neutral-400 mb-8">
            You can try again or choose a different plan at any time.
          </p>
          
          {/* Information Box */}
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-3 mb-4">
              <IconCreditCard className="h-5 w-5 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-medium mb-1">What happened?</h3>
                <p className="text-sm text-neutral-400">
                  The payment process was interrupted or cancelled before completion. No payment was processed.
                </p>
              </div>
            </div>
            
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm mb-2">Next steps:</h4>
              <ul className="text-xs text-neutral-300 space-y-1">
                <li>• Try the payment process again</li>
                <li>• Choose a different payment method</li>
                <li>• Select a different subscription plan</li>
                <li>• Contact support if you&apos;re experiencing issues</li>
              </ul>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleRetryPayment}
              className="w-full bg-white hover:bg-neutral-100 text-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <IconCreditCard className="h-4 w-4" />
                Try Payment Again
              </span>
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleBackToPlans}
                variant="outline"
                className="border-neutral-600 text-white hover:bg-neutral-800"
              >
                <span className="flex items-center justify-center gap-2">
                  <IconArrowLeft className="h-4 w-4" />
                  Back to Plans
                </span>
              </Button>
              
              <Button
                onClick={handleGoToDashboard}
                variant="outline"
                className="border-neutral-600 text-white hover:bg-neutral-800"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-neutral-500 mt-6">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@foreko.app" className="text-neutral-300 hover:text-white transition-colors">
              support@foreko.app
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}