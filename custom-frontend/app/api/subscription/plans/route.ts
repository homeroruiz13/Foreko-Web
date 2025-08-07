import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionPlanModel } from '@/lib/models/subscription';

export async function GET(request: NextRequest) {
  try {
    const plans = await SubscriptionPlanModel.findAll();
    
    return NextResponse.json({
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        features: plan.features,
        user_limit: plan.user_limit
      }))
    });

  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}