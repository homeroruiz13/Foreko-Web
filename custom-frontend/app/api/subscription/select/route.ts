import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';
import { SubscriptionModel, SubscriptionPlanModel } from '@/lib/models/subscription';
import { CompanyModel } from '@/lib/models/company';

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
    const { planId, billingCycle } = body;

    // Validation
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Valid billing cycle is required (monthly or yearly)' },
        { status: 400 }
      );
    }

    // Get user's company
    const userCompanies = await CompanyModel.findByUserId(user.id);
    if (userCompanies.length === 0) {
      return NextResponse.json(
        { error: 'No company found for user. Please complete company setup first.' },
        { status: 400 }
      );
    }

    const company = userCompanies[0]; // Get the first company

    // Check if company already has a subscription
    const existingSubscription = await SubscriptionModel.findByCompanyId(company.id);
    if (existingSubscription) {
      // If subscription already exists, return it instead of error
      // This handles double-click or refresh scenarios gracefully
      console.log('Company already has subscription, returning existing:', existingSubscription.id);
      return NextResponse.json({
        message: 'Using existing subscription',
        subscription: existingSubscription
      }, { status: 200 });
    }

    // Verify the plan exists
    let plan;
    if (planId === 'starter') {
      plan = await SubscriptionPlanModel.findByName('Starter Inventory');
    } else if (planId === 'pro') {
      plan = await SubscriptionPlanModel.findByName('Pro Inventory');
    } else if (planId === 'business') {
      plan = await SubscriptionPlanModel.findByName('Business Intelligence');
    } else if (planId === 'test') {
      // Handle test plan - check if it exists, create if it doesn't
      plan = await SubscriptionPlanModel.findByName('Test Plan');
      if (!plan) {
        // Create the test plan in the database
        plan = await SubscriptionPlanModel.create({
          name: 'Test Plan',
          price_monthly: 0.01, // 1 cent for Stripe testing
          price_yearly: 0.01,  // 1 cent for Stripe testing
          stripe_price_id: undefined, // Will be created dynamically by Stripe checkout
          is_active: true,
          user_limit: 10,
          features: {
            inventory_limit: 10,
            analytics: 'basic',
            support: 'email',
            stripe_testing: true
          }
        });
      }
    } else {
      plan = await SubscriptionPlanModel.findById(planId);
    }

    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Create the subscription
    const subscription = await SubscriptionModel.create({
      company_id: company.id,
      plan_id: plan.id,
      billing_cycle: billingCycle
    });

    // Get the price based on billing cycle
    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    return NextResponse.json({
      message: 'Subscription plan selected successfully',
      subscription: {
        id: subscription.id,
        company_id: subscription.company_id,
        plan: {
          id: plan.id,
          name: plan.name,
          price: price,
          billing_cycle: billingCycle,
          features: plan.features
        },
        status: subscription.status,
        trial_ends_at: subscription.trial_ends_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Subscription selection error:', error);
    
    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Subscription already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}