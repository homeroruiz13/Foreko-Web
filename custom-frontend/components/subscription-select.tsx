"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "./container";
import { Logo } from "./logo";
import { Button } from "./elements/button";
import { AmbientColor } from "./decorations/ambient-color";
import StarBackground from "./decorations/star-background";
import ShootingStars from "./decorations/shooting-star";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  perks: string[];
  featured?: boolean;
}

const plans: Plan[] = [
  {
    id: "test",
    name: "Test Plan",
    monthlyPrice: 0.01,
    yearlyPrice: 0.01,
    perks: [
      "Only 1¢ - Real Stripe testing",
      "Track up to 10 inventory items",
      "Basic dashboard access",
      "Email support",
      "Test all features",
      "Perfect for development testing"
    ]
  },
  {
    id: "starter",
    name: "Starter Inventory",
    monthlyPrice: 50,
    yearlyPrice: 40, // 20% discount
    perks: [
      "Track up to 500 inventory items",
      "Basic AI Reorder Alerts", 
      "Standard Analytics Dashboard",
      "Email Support",
      "Essential Inventory Reports"
    ]
  },
  {
    id: "pro",
    name: "Pro Inventory", 
    monthlyPrice: 100,
    yearlyPrice: 80, // 20% discount
    perks: [
      "Track up to 5,000 inventory items",
      "Advanced AI Demand Forecasting",
      "Advanced Analytics Dashboard", 
      "Advanced inventory analytics",
      "Priority Support",
      "Multi-location inventory tracking"
    ]
  },
  {
    id: "business",
    name: "Business Intelligence",
    monthlyPrice: 150,
    yearlyPrice: 120, // 20% discount
    featured: true,
    perks: [
      "Track up to 50,000 inventory items",
      "Collaborative AI Control Dashboard",
      "High-Speed Data Processing",
      "Advanced analytics and reporting",
      "Priority Support", 
      "Team collaboration tools",
      "Custom integrations and workflows"
    ]
  }
];

export const SubscriptionSelect = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinueToPayment = async () => {
    if (!selectedPlan || loading) return; // Prevent double submission
    
    console.log('Starting payment process with plan:', selectedPlan);
    setLoading(true);
    
    try {
      console.log('Making API call to /api/subscription/select');
      const response = await fetch('/api/subscription/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle: isYearly ? 'yearly' : 'monthly'
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Subscription selection successful, redirect to payment page
        console.log('Redirecting to payment page...');
        const paymentUrl = `/en/payment?subscription=${data.subscription.id}&plan=${selectedPlan}&billing=${isYearly ? 'yearly' : 'monthly'}`;
        console.log('Payment URL:', paymentUrl);
        router.push(paymentUrl);
      } else {
        console.error('Subscription selection failed:', data.error);
        // Show error message to the user
        alert(data.error || 'Failed to select subscription plan');
        setLoading(false); // Re-enable the button on error
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
      setLoading(false); // Re-enable the button on error
    }
    // Note: Don't setLoading(false) in finally for successful case to prevent double-clicks during redirect
  };

  return (
    <div className="fixed inset-0 bg-charcoal z-50 overflow-hidden">
      <AmbientColor />
      <StarBackground />
      <ShootingStars />
      
      <Container className="relative h-screen max-w-6xl mx-auto flex flex-col items-center justify-center px-8 z-10">
        <div className="mb-8">
          <Logo />
        </div>
        
        {/* Welcome section */}
        <div className="text-center mb-12 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-neutral-300 mb-2">
            Select the perfect inventory management solution
          </p>
          <p className="text-lg text-neutral-300 mb-6">
            for your business needs and budget
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-neutral-400 to-neutral-600 mx-auto rounded-full"></div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-2 flex items-center gap-2">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200",
                !isYearly 
                  ? "bg-white text-black shadow-lg" 
                  : "text-neutral-300 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 relative",
                isYearly 
                  ? "bg-white text-black shadow-lg" 
                  : "text-neutral-300 hover:text-white"
              )}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className={cn(
                "cursor-pointer transition-all duration-300 transform hover:scale-105",
                "p-6 rounded-2xl border-2 bg-neutral-900/50 backdrop-blur-sm",
                selectedPlan === plan.id 
                  ? "border-white bg-neutral-800/50 shadow-2xl" 
                  : "border-neutral-700 hover:border-neutral-600",
                plan.featured && selectedPlan !== plan.id && "border-neutral-500"
              )}
            >
              {/* Plan Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                {plan.featured && (
                  <div className="bg-white text-black text-xs px-3 py-1 rounded-full font-medium">
                    Featured
                  </div>
                )}
                {selectedPlan === plan.id && (
                  <div className="bg-white text-black text-xs px-3 py-1 rounded-full font-medium">
                    Selected
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-neutral-400">$</span>
                  <span className="text-4xl font-bold text-white">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-lg text-neutral-400">
                    / {isYearly ? 'month' : 'month'}
                  </span>
                </div>
                {isYearly && (
                  <div className="mt-2 text-sm text-green-400">
                    Billed yearly (${plan.yearlyPrice * 12}/year)
                  </div>
                )}
                {!isYearly && (
                  <div className="mt-2 text-sm text-neutral-500">
                    Billed monthly
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                {plan.perks.map((perk, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconCheck className="h-3 w-3 text-neutral-300 stroke-[3px]" />
                    </div>
                    <span className="text-sm text-neutral-300 leading-relaxed">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinueToPayment}
          disabled={!selectedPlan || loading}
          className={cn(
            "px-12 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105",
            selectedPlan 
              ? "bg-white hover:bg-neutral-100 text-black shadow-lg hover:shadow-xl" 
              : "bg-neutral-700 text-neutral-400 cursor-not-allowed",
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
                Continue to Payment
                <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
        </Button>

        {/* Footer message */}
        <p className="text-neutral-500 text-center mt-8 text-sm">
          You can upgrade or downgrade your plan at any time
        </p>
      </Container>
    </div>
  );
};