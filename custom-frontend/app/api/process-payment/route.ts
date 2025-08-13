import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';
import { SubscriptionModel } from '@/lib/models/subscription';
import { CompanyModel } from '@/lib/models/company';
import { InvoiceModel } from '@/lib/models/invoice';
import { BillingEventModel } from '@/lib/models/billing-events';
import { PaymentMethodModel } from '@/lib/models/payment-methods';
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
        // Activate the subscription
        await SubscriptionModel.updateStatus(subscription.id, 'active');

        // Save payment method if provided (for future billing)
        let savedPaymentMethodId = null;
        if (save_payment_method && payment_method_id) {
          try {
            const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);
            
            // Check if payment method already exists
            const existingPaymentMethod = await PaymentMethodModel.findByStripePaymentMethodId(paymentMethod.id);
            if (!existingPaymentMethod) {
              const createdPM = await PaymentMethodModel.create({
                company_id: company.id,
                stripe_payment_method_id: paymentMethod.id,
                type: paymentMethod.type,
                last4: paymentMethod.card?.last4,
                brand: paymentMethod.card?.brand,
                exp_month: paymentMethod.card?.exp_month,
                exp_year: paymentMethod.card?.exp_year,
                is_default: set_as_default || true, // First payment method is default
                cardholder_name: cardholder_name || paymentMethod.billing_details?.name || undefined,
                billing_address_line1: billing_address?.line1 || paymentMethod.billing_details?.address?.line1 || undefined,
                billing_address_line2: billing_address?.line2 || paymentMethod.billing_details?.address?.line2 || undefined,
                billing_city: billing_address?.city || paymentMethod.billing_details?.address?.city || undefined,
                billing_state: billing_address?.state || paymentMethod.billing_details?.address?.state || undefined,
                billing_postal_code: billing_address?.postal_code || paymentMethod.billing_details?.address?.postal_code || undefined,
                billing_country: billing_address?.country || paymentMethod.billing_details?.address?.country || undefined
              });
              
              savedPaymentMethodId = createdPM.id;
              console.log('Saved payment method for free plan:', paymentMethod.id);
            }
          } catch (error) {
            console.error('Error saving payment method for free plan:', error);
            // Don't fail the free plan activation if payment method saving fails
          }
        }

        // Create a $0 invoice record for the free plan
        const invoice = await InvoiceModel.create({
          company_id: company.id,
          subscription_id: subscription.id,
          stripe_invoice_id: `free_plan_${subscription.id}_${Date.now()}`,
          amount: 0,
          subtotal: 0,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: 0,
          currency: 'USD',
          status: 'paid',
          billing_period_start: new Date(),
          billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          paid_at: new Date(),
          line_items_count: 0,
          description: 'Free plan activation'
        });

        // Create a billing event for free plan activation
        await BillingEventModel.create({
          stripe_event_id: `free_plan_${subscription.id}_${Date.now()}`,
          event_type: 'checkout.session.completed',
          payload: {
            plan_type: 'free',
            user_id: user.id,
            company_id: company.id,
            subscription_id: subscription.id,
            invoice_id: invoice.id,
            payment_method_id: savedPaymentMethodId,
            amount: 0,
            currency: 'usd',
            description: 'Free plan activated'
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Free plan activated successfully',
          invoice_id: invoice.id,
          payment_method_saved: !!savedPaymentMethodId
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

      // Save payment method data from Stripe if save_payment_method is true
      if (save_payment_method && paymentIntent.payment_method) {
        try {
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
          
          // Check if payment method already exists
          const existingPaymentMethod = await PaymentMethodModel.findByStripePaymentMethodId(paymentMethod.id);
          if (!existingPaymentMethod) {
            await PaymentMethodModel.create({
              company_id: company.id,
              stripe_payment_method_id: paymentMethod.id,
              type: paymentMethod.type,
              last4: paymentMethod.card?.last4,
              brand: paymentMethod.card?.brand,
              exp_month: paymentMethod.card?.exp_month,
              exp_year: paymentMethod.card?.exp_year,
              is_default: set_as_default || false,
              cardholder_name: cardholder_name || paymentMethod.billing_details?.name || undefined,
              billing_address_line1: billing_address?.line1 || paymentMethod.billing_details?.address?.line1 || undefined,
              billing_address_line2: billing_address?.line2 || paymentMethod.billing_details?.address?.line2 || undefined,
              billing_city: billing_address?.city || paymentMethod.billing_details?.address?.city || undefined,
              billing_state: billing_address?.state || paymentMethod.billing_details?.address?.state || undefined,
              billing_postal_code: billing_address?.postal_code || paymentMethod.billing_details?.address?.postal_code || undefined,
              billing_country: billing_address?.country || paymentMethod.billing_details?.address?.country || undefined
            });
            
            console.log('Saved payment method:', paymentMethod.id);
          }
        } catch (error) {
          console.error('Error saving payment method:', error);
          // Don't fail the payment if payment method saving fails
        }
      }

      // Create invoice record
      const invoice = await InvoiceModel.create({
        company_id: company.id,
        subscription_id: subscription.id,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_invoice_id: paymentIntent.id,
        amount: amount,
        subtotal: amount,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: amount,
        currency: 'USD',
        status: 'paid',
        billing_period_start: new Date(),
        billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paid_at: new Date(),
        line_items_count: 1,
        description: 'Subscription payment'
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
