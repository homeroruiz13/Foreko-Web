import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';
import { SubscriptionModel } from '@/lib/models/subscription';
import { CompanyModel } from '@/lib/models/company';
import { InvoiceModel } from '@/lib/models/invoice';
import { BillingEventModel } from '@/lib/models/billing-events';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      amount, 
      payment_method_id, 
      cardholder_name, 
      billing_address,
      save_payment_method,
      set_as_default
    } = body;

    // Validation
    if (!payment_method_id) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Get user's company
    const userCompanies = await CompanyModel.findByUserId(user.id);
    if (userCompanies.length === 0) {
      return NextResponse.json(
        { error: 'No company found for user' },
        { status: 400 }
      );
    }

    const company = userCompanies[0];

    // Get the user's latest subscription
    const subscription = await SubscriptionModel.findByCompanyId(company.id);
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found for company' },
        { status: 400 }
      );
    }

    try {
      // Handle free plans (amount = 0)
      if (amount === 0) {
        // For free plans, we can skip payment method saving for test plans
        // and just activate the subscription directly
        await SubscriptionModel.updateStatus(subscription.id, 'active');

        // Create a billing event for free plan activation
        await BillingEventModel.create({
          stripe_event_id: `free_plan_${subscription.id}_${Date.now()}`,
          event_type: 'checkout.session.completed',
          payload: {
            plan_type: 'free',
            user_id: user.id,
            company_id: company.id,
            subscription_id: subscription.id,
            amount: 0,
            currency: 'usd',
            description: 'Free plan activated'
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Free plan activated successfully',
        });
      }

      // For paid plans, create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: payment_method_id,
        confirm: true,
        return_url: `${request.nextUrl.origin}/payment/success`,
        metadata: {
          subscription_id: subscription.id,
          company_id: company.id,
          user_id: user.id,
        },
      });

      if (paymentIntent.status === 'requires_action') {
        return NextResponse.json({
          requires_action: true,
          client_secret: paymentIntent.client_secret,
        });
      }

      if (paymentIntent.status !== 'succeeded') {
        // Create a billing event for failed payment
        await BillingEventModel.create({
          stripe_event_id: paymentIntent.id,
          event_type: 'payment_intent.payment_failed',
          payload: {
            company_id: company.id,
            subscription_id: subscription.id,
            payment_intent_id: paymentIntent.id,
            amount: amount,
            currency: 'usd',
            status: paymentIntent.status,
            description: 'Payment failed',
            error_message: `Payment intent status: ${paymentIntent.status}`,
            user_id: user.id
          }
        });

        return NextResponse.json(
          { error: 'Payment failed' },
          { status: 400 }
        );
      }

      // Payment succeeded, update subscription
      await SubscriptionModel.updateStatus(subscription.id, 'active');

      // Create invoice record
      const invoice = await InvoiceModel.create({
        company_id: company.id,
        stripe_invoice_id: paymentIntent.id,
        amount_due: amount,
        amount_paid: amount,
        status: 'paid',
        billing_period_start: new Date(),
        billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      // Create billing event for successful payment
      await BillingEventModel.create({
        stripe_event_id: paymentIntent.id,
        event_type: 'payment_intent.succeeded',
        payload: {
          company_id: company.id,
          subscription_id: subscription.id,
          invoice_id: invoice.id,
          payment_intent_id: paymentIntent.id,
          amount: amount,
          currency: 'usd',
          status: paymentIntent.status,
          description: 'Payment successfully processed',
          user_id: user.id
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        payment_intent_id: paymentIntent.id,
        invoice_id: invoice.id,
      });

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      return NextResponse.json(
        { error: stripeError.message || 'Payment processing failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Process payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
