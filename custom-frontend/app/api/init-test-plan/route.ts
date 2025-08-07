import { NextResponse } from 'next/server';
import { SubscriptionPlanModel } from '@/lib/models/subscription';

export async function POST() {
  try {
    // Check if test plan already exists
    const existingPlan = await SubscriptionPlanModel.findById('00000000-0000-0000-0000-000000000000');
    
    if (existingPlan) {
      return NextResponse.json({
        message: 'Test plan already exists',
        plan: existingPlan
      });
    }

    // Create the test plan
    const testPlan = await SubscriptionPlanModel.createWithId('00000000-0000-0000-0000-000000000000', {
      name: 'Test Plan',
      price_monthly: 0,
      price_yearly: 0,
      stripe_price_id: undefined,
      is_active: true,
      user_limit: 10,
      features: {
        inventory_limit: 10,
        analytics: 'basic',
        support: 'email'
      }
    });

    return NextResponse.json({
      message: 'Test plan created successfully',
      plan: testPlan
    });

  } catch (error) {
    console.error('Error initializing test plan:', error);
    return NextResponse.json(
      { error: 'Failed to initialize test plan' },
      { status: 500 }
    );
  }
}