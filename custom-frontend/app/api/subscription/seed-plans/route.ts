import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionPlanModel } from '@/lib/models/subscription';

export async function POST(request: NextRequest) {
  try {
    // Check if plans already exist
    const existingPlans = await SubscriptionPlanModel.findAll();
    if (existingPlans.length > 0) {
      return NextResponse.json({
        message: 'Subscription plans already exist',
        plans: existingPlans
      });
    }

    // Create the three subscription plans
    const plans = [
      {
        name: 'Starter Inventory',
        price_monthly: 50.00,
        price_yearly: 40.00,
        is_active: true,
        user_limit: 5,
        features: {
          inventory_items: 500,
          ai_reorder_alerts: 'basic',
          analytics: 'standard',
          support: 'email',
          reports: 'essential'
        }
      },
      {
        name: 'Pro Inventory',
        price_monthly: 100.00,
        price_yearly: 80.00,
        is_active: true,
        user_limit: 25,
        features: {
          inventory_items: 5000,
          ai_forecasting: 'advanced',
          analytics: 'advanced',
          support: 'priority',
          multi_location: true,
          reports: 'advanced'
        }
      },
      {
        name: 'Business Intelligence',
        price_monthly: 150.00,
        price_yearly: 120.00,
        is_active: true,
        user_limit: 100,
        features: {
          inventory_items: 50000,
          ai_dashboard: 'collaborative',
          data_processing: 'high_speed',
          analytics: 'comprehensive',
          support: 'priority',
          team_collaboration: true,
          custom_integrations: true,
          workflows: 'custom'
        }
      }
    ];

    const createdPlans = [];
    for (const planData of plans) {
      const plan = await SubscriptionPlanModel.create(planData);
      createdPlans.push(plan);
    }

    return NextResponse.json({
      message: 'Subscription plans created successfully',
      plans: createdPlans
    }, { status: 201 });

  } catch (error) {
    console.error('Seed plans error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}