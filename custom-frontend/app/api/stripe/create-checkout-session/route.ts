import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const pricingMap: Record<string, { monthly: number; yearly: number }> = {
  starter: { monthly: 50, yearly: 40 },
  pro: { monthly: 100, yearly: 80 },
  business: { monthly: 150, yearly: 120 }
};

const planNames: Record<string, string> = {
  starter: "Starter Inventory",
  pro: "Pro Inventory", 
  business: "Business Intelligence"
};

export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle, subscriptionId } = await request.json();

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const pricing = pricingMap[planId];
    const planName = planNames[planId];

    if (!pricing || !planName) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const price = billingCycle === 'yearly' ? pricing.yearly : pricing.monthly;
    const interval = billingCycle === 'yearly' ? 'year' : 'month';

    // Create or retrieve Stripe product
    let product;
    try {
      // Try to find existing product
      const products = await stripe.products.list({
        limit: 100,
      });
      product = products.data.find(p => p.metadata.plan_id === planId);
      
      if (!product) {
        // Create new product if it doesn't exist
        product = await stripe.products.create({
          name: planName,
          description: `${planName} subscription plan`,
          metadata: {
            plan_id: planId,
          },
        });
      }
    } catch (error) {
      console.error('Error managing product:', error);
      return NextResponse.json(
        { error: 'Error setting up product' },
        { status: 500 }
      );
    }

    // Create or retrieve price
    let stripePrice;
    try {
      // Try to find existing price
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 100,
      });
      
      stripePrice = prices.data.find(p => 
        p.unit_amount === price * 100 && 
        p.recurring?.interval === interval
      );
      
      if (!stripePrice) {
        // Create new price if it doesn't exist
        stripePrice = await stripe.prices.create({
          product: product.id,
          unit_amount: price * 100, // Convert to cents
          currency: 'usd',
          recurring: {
            interval: interval as 'month' | 'year',
          },
          metadata: {
            plan_id: planId,
            billing_cycle: billingCycle,
          },
        });
      }
    } catch (error) {
      console.error('Error managing price:', error);
      return NextResponse.json(
        { error: 'Error setting up pricing' },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/payment/cancelled`,
      metadata: {
        plan_id: planId,
        billing_cycle: billingCycle,
        subscription_id: subscriptionId || '',
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
          billing_cycle: billingCycle,
          internal_subscription_id: subscriptionId || '',
        },
      },
      customer_creation: 'always',
      billing_address_collection: 'required',
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}