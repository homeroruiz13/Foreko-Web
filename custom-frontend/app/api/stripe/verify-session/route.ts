import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const planNames: Record<string, string> = {
  starter: "Starter Inventory",
  pro: "Pro Inventory", 
  business: "Business Intelligence"
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get subscription details
    const subscription = session.subscription 
      ? await stripe.subscriptions.retrieve(session.subscription as string)
      : null;

    const planId = session.metadata?.plan_id || '';
    const billingCycle = session.metadata?.billing_cycle || 'monthly';
    const planName = planNames[planId] || 'Unknown Plan';

    return NextResponse.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      planId,
      planName,
      billing: billingCycle,
      amount: session.amount_total ? (session.amount_total / 100).toString() : '0',
      currency: session.currency || 'usd',
      customerEmail: session.customer_details?.email,
      subscriptionId: subscription?.id,
      subscriptionStatus: subscription?.status,
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Error verifying payment session' },
      { status: 500 }
    );
  }
}