import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { InvoiceModel } from '@/lib/models/invoice';
import { BillingEventModel } from '@/lib/models/billing-events';
import { SubscriptionModel } from '@/lib/models/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature || !webhookSecret) {
    console.error('Missing stripe signature or webhook secret');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Processing Stripe webhook event:', event.type, event.id);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log('Processing payment intent succeeded:', paymentIntent.id);

  const subscriptionId = paymentIntent.metadata?.subscription_id;
  const companyId = paymentIntent.metadata?.company_id;

  if (!subscriptionId || !companyId) {
    console.warn('Missing subscription_id or company_id in payment intent metadata');
    return;
  }

  // Check if we already have an invoice for this payment intent
  let invoice = await InvoiceModel.findByStripeInvoiceId(paymentIntent.id);

  if (!invoice) {
    // Create new invoice
    invoice = await InvoiceModel.create({
      company_id: companyId,
      stripe_invoice_id: paymentIntent.id,
      amount_due: paymentIntent.amount / 100,
      amount_paid: paymentIntent.amount / 100,
      status: 'paid',
      billing_period_start: new Date(),
      billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  } else if (invoice.status !== 'paid') {
    // Update existing invoice
    await InvoiceModel.updateStatus(invoice.id!, 'paid', paymentIntent.amount / 100);
  }

  // Create billing event if it doesn't exist
  const existingEvent = await BillingEventModel.findByStripeEventId(event.id);
  if (!existingEvent) {
    await BillingEventModel.create({
      stripe_event_id: event.id,
      event_type: 'payment_intent.succeeded',
      payload: {
        company_id: companyId,
        subscription_id: subscriptionId,
        invoice_id: invoice.id!,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        description: 'Payment intent succeeded',
        metadata: paymentIntent.metadata,
        raw_event_data: paymentIntent
      }
    });
  }

  // Update subscription status if needed
  const subscription = await SubscriptionModel.findById(subscriptionId);
  if (subscription && subscription.status !== 'active') {
    await SubscriptionModel.updateStatus(subscriptionId, 'active');
  }
}

async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log('Processing payment intent failed:', paymentIntent.id);

  const subscriptionId = paymentIntent.metadata?.subscription_id;
  const companyId = paymentIntent.metadata?.company_id;

  if (!subscriptionId || !companyId) {
    console.warn('Missing subscription_id or company_id in payment intent metadata');
    return;
  }

  // Create billing event
  await BillingEventModel.create({
    stripe_event_id: event.id,
    event_type: 'payment_intent.payment_failed',
    payload: {
      company_id: companyId,
      subscription_id: subscriptionId,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      description: 'Payment intent failed',
      error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
      metadata: paymentIntent.metadata,
      raw_event_data: paymentIntent
    }
  });
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  console.log('Processing invoice payment succeeded:', invoice.id);

  const subscriptionId = (invoice as any).subscription as string;
  const companyId = invoice.metadata?.company_id;

  if (!subscriptionId || !companyId) {
    console.warn('Missing subscription or company_id in invoice');
    return;
  }

  // Create or update invoice
  let localInvoice = await InvoiceModel.findByStripeInvoiceId(invoice.id!);

  if (!localInvoice) {
    localInvoice = await InvoiceModel.create({
      company_id: companyId,
      stripe_invoice_id: invoice.id!,
      amount_due: (invoice.amount_due || 0) / 100,
      amount_paid: (invoice.amount_paid || 0) / 100,
      status: 'paid',
      hosted_invoice_url: invoice.hosted_invoice_url || undefined,
      invoice_pdf_url: invoice.invoice_pdf || undefined,
      billing_period_start: invoice.period_start ? new Date(invoice.period_start * 1000) : new Date(),
      billing_period_end: invoice.period_end ? new Date(invoice.period_end * 1000) : new Date()
    });
  }

  // Create billing event
  await BillingEventModel.create({
    stripe_event_id: event.id,
    event_type: 'invoice.payment_succeeded',
    payload: {
      company_id: companyId,
      subscription_id: subscriptionId,
      invoice_id: localInvoice.id,
      stripe_invoice_id: invoice.id!,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency || 'usd',
      description: 'Invoice payment succeeded',
      metadata: invoice.metadata,
      raw_event_data: invoice
    }
  });
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  console.log('Processing invoice payment failed:', invoice.id);

  const subscriptionId = (invoice as any).subscription as string;
  const companyId = invoice.metadata?.company_id;

  if (!subscriptionId || !companyId) {
    console.warn('Missing subscription or company_id in invoice');
    return;
  }

  // Create billing event
  await BillingEventModel.create({
    stripe_event_id: event.id,
    event_type: 'invoice.payment_failed',
    payload: {
      company_id: companyId,
      subscription_id: subscriptionId,
      stripe_invoice_id: invoice.id!,
      amount: (invoice.amount_due || 0) / 100,
      currency: invoice.currency || 'usd',
      description: 'Invoice payment failed',
      error_message: 'Invoice payment failed',
      metadata: invoice.metadata,
      raw_event_data: invoice
    }
  });
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log('Processing subscription created:', subscription.id);

  const companyId = subscription.metadata?.company_id;
  if (!companyId) {
    console.warn('Missing company_id in subscription metadata');
    return;
  }

  // Create billing event
  await BillingEventModel.create({
    stripe_event_id: event.id,
    event_type: 'customer.subscription.created',
    payload: {
      company_id: companyId,
      stripe_subscription_id: subscription.id,
      description: 'Subscription created',
      metadata: subscription.metadata,
      raw_event_data: subscription
    }
  });
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log('Processing subscription updated:', subscription.id);

  const companyId = subscription.metadata?.company_id;
  if (!companyId) {
    console.warn('Missing company_id in subscription metadata');
    return;
  }

  // Create billing event
  await BillingEventModel.create({
    stripe_event_id: event.id,
    event_type: 'customer.subscription.updated',
    payload: {
      company_id: companyId,
      stripe_subscription_id: subscription.id,
      description: 'Subscription updated',
      metadata: subscription.metadata,
      raw_event_data: subscription
    }
  });
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log('Processing subscription deleted:', subscription.id);

  const companyId = subscription.metadata?.company_id;
  if (!companyId) {
    console.warn('Missing company_id in subscription metadata');
    return;
  }

  // Create billing event
  await BillingEventModel.create({
    stripe_event_id: event.id,
    event_type: 'customer.subscription.deleted',
    payload: {
      company_id: companyId,
      stripe_subscription_id: subscription.id,
      description: 'Subscription cancelled',
      metadata: subscription.metadata,
      raw_event_data: subscription
    }
  });
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  console.log('Processing checkout session completed:', session.id);

  const subscriptionId = session.metadata?.subscription_id;
  const companyId = session.metadata?.company_id;

  if (!subscriptionId || !companyId) {
    console.warn('Missing subscription_id or company_id in checkout session metadata');
    return;
  }

  // Create billing event
  await BillingEventModel.create({
    stripe_event_id: event.id,
    event_type: 'checkout.session.completed',
    payload: {
      company_id: companyId,
      subscription_id: subscriptionId,
      session_id: session.id,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      description: 'Checkout session completed',
      metadata: session.metadata,
      raw_event_data: session
    }
  });

  // If this checkout session has a subscription, ensure it's active
  if (session.subscription) {
    const subscription = await SubscriptionModel.findById(subscriptionId);
    if (subscription && subscription.status !== 'active') {
      await SubscriptionModel.updateStatus(subscriptionId, 'active');
    }
  }
}