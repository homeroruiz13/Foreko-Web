import { NextRequest, NextResponse } from 'next/server';
import { InvoiceModel } from '@/lib/models/invoice';
import { BillingEventModel } from '@/lib/models/billing-events';
import { SubscriptionModel } from '@/lib/models/subscription';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
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
    const subscriptionId = session.metadata?.subscription_id;

    // Create invoice and billing event if this is a successful payment and we have the required metadata
    if (session.payment_status === 'paid' && subscriptionId && session.amount_total && session.amount_total > 0) {
      try {
        // Find the subscription to get company_id
        const localSubscription = await SubscriptionModel.findById(subscriptionId);
        
        if (localSubscription) {
          // Check if we already have an invoice for this session
          let invoice = await InvoiceModel.findByStripeInvoiceId(session.id);
          
          if (!invoice) {
            // Create invoice record
            const amountInDollars = session.amount_total / 100;
            invoice = await InvoiceModel.create({
              company_id: localSubscription.company_id,
              stripe_invoice_id: session.id,
              amount_due: amountInDollars,
              amount_paid: amountInDollars,
              status: 'paid',
              billing_period_start: new Date(),
              billing_period_end: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
            });

            // Create billing event
            await BillingEventModel.create({
              stripe_event_id: session.id,
              event_type: 'checkout.session.completed',
              payload: {
                company_id: localSubscription.company_id,
                subscription_id: subscriptionId,
                invoice_id: invoice.id,
                amount: session.amount_total / 100,
                currency: session.currency || 'usd',
                description: 'Checkout session completed successfully',
                metadata: session.metadata,
                raw_event_data: session
              }
            });

            console.log('Created invoice and billing event for session:', session.id);
          }
        }
      } catch (error) {
        console.error('Error creating invoice/billing event for session:', session.id, error);
        // Don't fail the response, just log the error
      }
    }

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