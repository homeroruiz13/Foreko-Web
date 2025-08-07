"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { Button } from "@/components/elements/button";
import { AmbientColor } from "@/components/decorations/ambient-color";
import StarBackground from "@/components/decorations/star-background";
import ShootingStars from "@/components/decorations/shooting-star";
import { IconCheck, IconCreditCard, IconLock, IconShield } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  billing: "monthly" | "yearly";
  features: string[];
}

const planDetails: Record<string, { name: string; features: string[] }> = {
  "00000000-0000-0000-0000-000000000000": {
    name: "Test Plan",
    features: [
      "Track up to 10 inventory items",
      "Basic dashboard access",
      "Email support",
      "Test all features",
      "Perfect for development testing"
    ]
  },
  starter: {
    name: "Starter Inventory",
    features: [
      "Track up to 500 inventory items",
      "Basic AI Reorder Alerts", 
      "Standard Analytics Dashboard",
      "Email Support",
      "Essential Inventory Reports"
    ]
  },
  pro: {
    name: "Pro Inventory",
    features: [
      "Track up to 5,000 inventory items",
      "Advanced AI Demand Forecasting",
      "Advanced Analytics Dashboard", 
      "Advanced inventory analytics",
      "Priority Support",
      "Multi-location inventory tracking"
    ]
  },
  business: {
    name: "Business Intelligence",
    features: [
      "Track up to 50,000 inventory items",
      "Collaborative AI Control Dashboard",
      "High-Speed Data Processing",
      "Advanced analytics and reporting",
      "Priority Support", 
      "Team collaboration tools",
      "Custom integrations and workflows"
    ]
  }
};

const pricingMap: Record<string, { monthly: number; yearly: number }> = {
  "00000000-0000-0000-0000-000000000000": { monthly: 0, yearly: 0 },
  starter: { monthly: 50, yearly: 40 },
  pro: { monthly: 100, yearly: 80 },
  business: { monthly: 150, yearly: 120 }
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanDetails | null>(null);

  useEffect(() => {
    const planId = searchParams.get('plan');
    const billing = searchParams.get('billing') as 'monthly' | 'yearly';
    
    if (!planId || !billing) {
      router.push('/subscription');
      return;
    }

    const planInfo = planDetails[planId];
    const pricing = pricingMap[planId];
    
    if (!planInfo || !pricing) {
      router.push('/subscription');
      return;
    }

    setPlan({
      id: planId,
      name: planInfo.name,
      price: billing === 'yearly' ? pricing.yearly : pricing.monthly,
      billing,
      features: planInfo.features
    });
  }, [searchParams, router]);

  const handlePayment = async () => {
    if (!plan) return;

    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: plan.billing,
          subscriptionId: searchParams.get('subscription')
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        console.error('Error creating checkout session:', error);
        alert(error);
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Error redirecting to checkout:', error);
          alert(error.message);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="fixed inset-0 bg-charcoal z-50 flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Complete Your Purchase
          </h1>
          <p className="text-lg text-neutral-300 mb-2">
            You're just one step away from unlocking
          </p>
          <p className="text-lg text-neutral-300 mb-6">
            powerful inventory management tools
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-neutral-400 to-neutral-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Plan Summary */}
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${plan.price}</div>
                  <div className="text-sm text-neutral-400">per month</div>
                  {plan.billing === 'yearly' && (
                    <div className="text-sm text-green-400">Billed yearly - 20% off</div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-neutral-700 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">
                    ${plan.billing === 'yearly' ? plan.price * 12 : plan.price}
                    {plan.billing === 'yearly' ? '/year' : '/month'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white mb-3">What's included:</h4>
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconCheck className="h-3 w-3 text-green-400 stroke-[3px]" />
                  </div>
                  <span className="text-sm text-neutral-300 leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Payment Details</h2>
            
            {/* Security badges */}
            <div className="flex items-center gap-4 mb-8 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <IconShield className="h-4 w-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <IconLock className="h-4 w-4" />
                <span>256-bit Encryption</span>
              </div>
            </div>

            {/* Stripe info */}
            <div className="bg-neutral-800/50 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <IconCreditCard className="h-6 w-6 text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Secure Payment</h3>
                  <p className="text-sm text-neutral-400">Powered by Stripe</p>
                </div>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Your payment information is processed securely by Stripe, a PCI-compliant payment processor trusted by millions of businesses worldwide.
              </p>
            </div>

            {/* Payment button */}
            <Button
              onClick={handlePayment}
              disabled={loading}
              className={cn(
                "w-full px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300",
                "bg-white hover:bg-neutral-100 text-black shadow-lg hover:shadow-xl transform hover:scale-105",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <IconCreditCard className="h-5 w-5" />
                    Pay ${plan.billing === 'yearly' ? plan.price * 12 : plan.price}
                    {plan.billing === 'yearly' ? '/year' : '/month'}
                  </>
                )}
              </span>
            </Button>

            {/* Trust indicators */}
            <div className="mt-6 text-center">
              <p className="text-xs text-neutral-500 mb-2">
                30-day money-back guarantee • Cancel anytime
              </p>
              <p className="text-xs text-neutral-500">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mt-8 text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
        >
          ← Back to plans
        </button>
      </Container>
    </div>
  );
}