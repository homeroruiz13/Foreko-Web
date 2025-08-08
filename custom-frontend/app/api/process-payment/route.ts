import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';
import { SubscriptionModel } from '@/lib/models/subscription';
import { CompanyModel } from '@/lib/models/company';
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
        // For free plans, just save the payment method if requested
        if (save_payment_method) {
          const setupIntent = await stripe.setupIntents.create({
            customer: undefined, // You'd want to create/retrieve a Stripe customer here
            payment_method: payment_method_id,
            confirm: true,
            usage: 'off_session',
          });

          if (setupIntent.status === 'requires_action') {
            return NextResponse.json({
              requires_action: true,
              client_secret: setupIntent.client_secret,
            });
          }

          if (setupIntent.status !== 'succeeded') {
            return NextResponse.json(
              { error: 'Failed to save payment method' },
              { status: 400 }
            );
          }
        }

        // Update subscription status for free plan
        await SubscriptionModel.updateStatus(subscription.id, 'active');

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
        return NextResponse.json(
          { error: 'Payment failed' },
          { status: 400 }
        );
      }

      // Payment succeeded, update subscription
      await SubscriptionModel.updateStatus(subscription.id, 'active');

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        payment_intent_id: paymentIntent.id,
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
