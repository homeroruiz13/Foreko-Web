"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { Button } from "@/components/elements/button";
import { AmbientColor } from "@/components/decorations/ambient-color";
import StarBackground from "@/components/decorations/star-background";
import ShootingStars from "@/components/decorations/shooting-star";
import { IconCheck, IconCreditCard, IconArrowRight } from "@tabler/icons-react";

interface PaymentDetails {
  sessionId: string;
  paymentStatus: string;
  planId: string;
  planName: string;
  billing: string;
  amount: string;
  currency: string;
  customerEmail: string;
  subscriptionId: string;
  subscriptionStatus: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // Verify the payment session
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`, {
          credentials: 'include'
        });

        const data = await response.json();
        
        if (response.ok) {
          setPaymentDetails(data);
        } else {
          setError(data.error || 'Failed to verify payment');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment session');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-charcoal z-50 overflow-hidden">
        <AmbientColor />
        <StarBackground />
        <ShootingStars />
        
        <Container className="relative h-screen max-w-4xl mx-auto flex flex-col items-center justify-center px-8 z-10">
          <div className="mb-8">
            <Logo />
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h1>
            <p className="text-neutral-300">Please wait while we confirm your payment.</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-charcoal z-50 overflow-hidden">
        <AmbientColor />
        <StarBackground />
        <ShootingStars />
        
        <Container className="relative h-screen max-w-4xl mx-auto flex flex-col items-center justify-center px-8 z-10">
          <div className="mb-8">
            <Logo />
          </div>
          
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <IconCreditCard className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Payment Verification Failed</h1>
            <p className="text-neutral-300 mb-8">{error}</p>
            
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/subscription')}
                className="w-full bg-white hover:bg-neutral-100 text-black"
              >
                Back to Plans
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full border-neutral-600 text-white hover:bg-neutral-800"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

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
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconCheck className="h-10 w-10 text-green-400 stroke-[3px]" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-neutral-300 mb-8">
            Thank you for your payment. Your {paymentDetails?.planName} subscription has been activated.
          </p>
          
          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Plan:</span>
                  <span className="text-white font-medium">{paymentDetails.planName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-400">Billing:</span>
                  <span className="text-white font-medium capitalize">{paymentDetails.billing}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-400">Amount:</span>
                  <span className="text-white font-medium">
                    ${paymentDetails.amount} {paymentDetails.currency.toUpperCase()}
                  </span>
                </div>
                
                {paymentDetails.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Email:</span>
                    <span className="text-white font-medium">{paymentDetails.customerEmail}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-neutral-400">Status:</span>
                  <span className="text-green-400 font-medium capitalize">
                    {paymentDetails.paymentStatus}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-400">Transaction ID:</span>
                  <span className="text-white font-mono text-xs">{paymentDetails.sessionId}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="w-full bg-white hover:bg-neutral-100 text-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              Continue to Dashboard
              <IconArrowRight className="h-4 w-4" />
            </span>
          </Button>
          
          <p className="text-xs text-neutral-500 mt-4">
            A receipt has been sent to your email address.
          </p>
        </div>
      </Container>
    </div>
  );
}