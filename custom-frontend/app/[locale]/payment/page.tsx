"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { Button } from "@/components/elements/button";
import { AmbientColor } from "@/components/decorations/ambient-color";
import StarBackground from "@/components/decorations/star-background";
import ShootingStars from "@/components/decorations/shooting-star";
import { IconCheck, IconCreditCard, IconLock, IconShield, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

interface PaymentFormData {
  cardholderName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  makeDefault: boolean;
}

interface PaymentFormProps {
  plan: PlanDetails;
  onSuccess: () => void;
}

// Payment form component that uses Stripe Elements
function PaymentForm({ plan, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    cardholderName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    makeDefault: true
  });

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: formData.cardholderName,
          address: {
            line1: formData.addressLine1,
            line2: formData.addressLine2 || undefined,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
            country: formData.country,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'An error occurred');
        return;
      }

      // Process payment with our backend
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: plan.billing === 'yearly' ? plan.price * 12 : plan.price,
          payment_method_id: paymentMethod.id,
          cardholder_name: formData.cardholderName,
          billing_address: {
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
            country: formData.country,
          },
          save_payment_method: true,
          set_as_default: formData.makeDefault,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else if (result.requires_action && result.client_secret) {
        // Handle additional authentication for both Payment Intent and Setup Intent
        let confirmError;
        if (plan.price === 0) {
          // For free plans, use Setup Intent confirmation
          const { error } = await stripe.confirmCardSetup(result.client_secret);
          confirmError = error;
        } else {
          // For paid plans, use Payment Intent confirmation
          const { error } = await stripe.confirmCardPayment(result.client_secret);
          confirmError = error;
        }
        
        if (confirmError) {
          setError(confirmError.message || 'Payment confirmation failed');
        } else {
          onSuccess();
        }
      } else {
        setError(result.error || 'Payment failed');
      }

    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <IconX className="h-5 w-5 text-red-400 flex-shrink-0" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Cardholder Name *
        </label>
        <input
          type="text"
          value={formData.cardholderName}
          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
          className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-neutral-400 focus:outline-none transition-colors"
          placeholder="John Doe"
          required
        />
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Card Information *
        </label>
        <div className="p-4 bg-neutral-800/50 border border-neutral-600 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Billing Address</h3>
        
        {/* Address Line 1 */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={formData.addressLine1}
            onChange={(e) => handleInputChange('addressLine1', e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-neutral-400 focus:outline-none transition-colors"
            placeholder="123 Main Street"
            required
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Address Line 2 <span className="text-neutral-400">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => handleInputChange('addressLine2', e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-neutral-400 focus:outline-none transition-colors"
            placeholder="Apartment, suite, etc."
          />
        </div>

        {/* City, State, Zip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-neutral-400 focus:outline-none transition-colors"
              placeholder="New York"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              State *
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-neutral-400 focus:outline-none transition-colors"
              placeholder="NY"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Zip Code *
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-neutral-400 focus:outline-none transition-colors"
              placeholder="10001"
              required
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Country *
          </label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white focus:border-neutral-400 focus:outline-none transition-colors"
            required
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="JP">Japan</option>
          </select>
        </div>
      </div>

      {/* Default Payment Method Checkbox */}
      <div className="flex items-center gap-3 mt-6">
        <input
          type="checkbox"
          id="makeDefault"
          checked={formData.makeDefault}
          onChange={(e) => handleInputChange('makeDefault', e.target.checked)}
          className="w-5 h-5 bg-neutral-800/50 border border-neutral-600 rounded text-white focus:ring-2 focus:ring-neutral-400"
        />
        <label htmlFor="makeDefault" className="text-sm text-white cursor-pointer">
          Make this my default payment method
        </label>
      </div>

      {/* Security badges */}
      <div className="flex items-center gap-4 pt-6 text-sm text-neutral-400 border-t border-neutral-700">
        <div className="flex items-center gap-2">
          <IconShield className="h-4 w-4" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center gap-2">
          <IconLock className="h-4 w-4" />
          <span>256-bit Encryption</span>
        </div>
      </div>

      {/* Payment button */}
      <Button
        type="submit"
        disabled={!stripe || loading}
        className={cn(
          "w-full px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300",
          "bg-white hover:bg-neutral-100 text-black shadow-lg hover:shadow-xl transform hover:scale-105",
          (loading || !stripe) && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <IconCreditCard className="h-4 w-4" />
              Pay ${plan.billing === 'yearly' ? plan.price * 12 : plan.price}
              {plan.billing === 'yearly' ? '/year' : '/month'}
            </>
          )}
        </span>
      </Button>
    </form>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handlePaymentSuccess = () => {
    setShowSuccess(true);
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (!plan) {
    return (
      <div className="fixed inset-0 bg-charcoal z-50 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="fixed inset-0 bg-charcoal z-50 overflow-hidden">
        <AmbientColor />
        <StarBackground />
        <ShootingStars />

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center">
            <div className="bg-neutral-900/90 border border-neutral-700 rounded-2xl p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconCheck className="h-8 w-8 text-green-400 stroke-[3px]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-neutral-300 mb-4">
                Thank you for your payment. You&apos;re being redirected to your dashboard...
              </p>
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}
        
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
              You&apos;re just one step away from unlocking
            </p>
            <p className="text-lg text-neutral-300 mb-6">
              powerful inventory management tools
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-neutral-400 to-neutral-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full max-w-7xl">
            {/* Payment Form - Left Side (Large) */}
            <div className="lg:col-span-3">
              <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Payment Information</h2>
                <PaymentForm plan={plan} onSuccess={handlePaymentSuccess} />
              </div>
            </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${plan.price}</div>
                    <div className="text-xs text-neutral-400">per month</div>
                    {plan.billing === 'yearly' && (
                      <div className="text-xs text-green-400">Billed yearly - 20% off</div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-neutral-700 pt-3">
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
                <h4 className="font-semibold text-white text-sm mb-4">What&apos;s included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <IconCheck className="h-2.5 w-2.5 text-green-400 stroke-[3px]" />
                    </div>
                    <span className="text-sm text-neutral-300 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Stripe info */}
              <div className="bg-neutral-800/50 rounded-lg p-4 mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <IconCreditCard className="h-5 w-5 text-white" />
                  <div>
                    <h3 className="text-base font-semibold text-white">Secure Payment</h3>
                    <p className="text-xs text-neutral-400">Powered by Stripe</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Your payment information is processed securely by Stripe, a PCI-compliant payment processor trusted by millions of businesses worldwide.
                </p>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 text-center">
                <p className="text-xs text-neutral-500 mb-1">
                  30-day money-back guarantee • Cancel anytime
                </p>
                <p className="text-xs text-neutral-500">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
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
    </Elements>
  );
}