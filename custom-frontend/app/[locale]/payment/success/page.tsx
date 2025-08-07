"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { Button } from "@/components/elements/button";
import { AmbientColor } from "@/components/decorations/ambient-color";
import StarBackground from "@/components/decorations/star-background";
import ShootingStars from "@/components/decorations/shooting-star";
import { IconCheck, IconArrowRight } from "@tabler/icons-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      router.push('/subscription');
      return;
    }

    // Verify the payment session
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setSessionData(data);
        }
      } catch (error) {
        console.error('Error verifying session:', error);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, router]);

  const handleContinue = () => {
    // Redirect to dashboard or company setup
    router.push('/company-setup');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-charcoal z-50 flex items-center justify-center">
        <div className="text-white">Verifying payment...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal z-50 overflow-hidden">
      <AmbientColor />
      <StarBackground />
      <ShootingStars />
      
      <Container className="relative h-screen max-w-3xl mx-auto flex flex-col items-center justify-center px-8 z-10 text-center">
        <div className="mb-8">
          <Logo />
        </div>
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-8">
          <IconCheck className="w-10 h-10 text-white stroke-[3px]" />
        </div>
        
        {/* Success Message */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
          Payment Successful!
        </h1>
        
        <p className="text-lg text-neutral-300 mb-2">
          Welcome to Foreko! Your subscription has been activated.
        </p>
        <p className="text-lg text-neutral-300 mb-8">
          You're ready to start managing your inventory with AI.
        </p>

        {/* Plan Details */}
        {sessionData && (
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8 mb-8 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Subscription Details</h3>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-400">Plan:</span>
                <span className="text-white">{sessionData.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Amount:</span>
                <span className="text-white">${sessionData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Billing:</span>
                <span className="text-white capitalize">{sessionData.billing}</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8 mb-8 max-w-md w-full">
          <h3 className="text-xl font-semibold text-white mb-4">What's Next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-sm font-bold">1</span>
              </div>
              <span className="text-sm text-neutral-300">Complete your company setup</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-neutral-400 text-sm font-bold">2</span>
              </div>
              <span className="text-sm text-neutral-300">Import your inventory data</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-neutral-400 text-sm font-bold">3</span>
              </div>
              <span className="text-sm text-neutral-300">Start tracking with AI insights</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="px-8 py-4 text-lg font-semibold rounded-lg bg-white hover:bg-neutral-100 text-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            Get Started
            <IconArrowRight className="w-5 h-5" />
          </span>
        </Button>

        {/* Support */}
        <p className="text-neutral-500 text-sm mt-8">
          Need help getting started? Contact our support team anytime.
        </p>
      </Container>
    </div>
  );
}