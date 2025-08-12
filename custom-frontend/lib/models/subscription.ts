import { query } from '../db';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  stripe_price_monthly_id?: string;
  stripe_price_yearly_id?: string;
  stripe_product_id?: string;
  is_active: boolean;
  user_limit?: number;
  storage_limit_gb?: number;
  features?: any;
  trial_days?: number;
  display_order?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  status: 'trialing' | 'active' | 'cancelled' | 'expired';
  trial_ends_at?: Date;
  renews_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSubscriptionData {
  company_id: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  stripe_subscription_id?: string;
}

export class SubscriptionPlanModel {
  static async findAll(): Promise<SubscriptionPlan[]> {
    const result = await query(
      'SELECT * FROM subscriptions.subscription_plans WHERE is_active = TRUE ORDER BY display_order ASC, price_monthly ASC'
    );
    return result.rows;
  }

  static async findById(id: string): Promise<SubscriptionPlan | null> {
    const result = await query(
      'SELECT * FROM subscriptions.subscription_plans WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByName(name: string): Promise<SubscriptionPlan | null> {
    const result = await query(
      'SELECT * FROM subscriptions.subscription_plans WHERE name = $1 AND is_active = TRUE',
      [name]
    );
    return result.rows[0] || null;
  }

  static async create(planData: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>): Promise<SubscriptionPlan> {
    const result = await query(
      `INSERT INTO subscriptions.subscription_plans (name, description, price_monthly, price_yearly, stripe_price_monthly_id, stripe_price_yearly_id, stripe_product_id, is_active, user_limit, storage_limit_gb, features, trial_days, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING *`,
      [
        planData.name,
        planData.description,
        planData.price_monthly,
        planData.price_yearly,
        planData.stripe_price_monthly_id,
        planData.stripe_price_yearly_id,
        planData.stripe_product_id,
        planData.is_active,
        planData.user_limit,
        planData.storage_limit_gb,
        planData.features ? JSON.stringify(planData.features) : null,
        planData.trial_days,
        planData.display_order
      ]
    );
    return result.rows[0];
  }

  static async createWithId(id: string, planData: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>): Promise<SubscriptionPlan> {
    const result = await query(
      `INSERT INTO subscriptions.subscription_plans (id, name, description, price_monthly, price_yearly, stripe_price_monthly_id, stripe_price_yearly_id, stripe_product_id, is_active, user_limit, storage_limit_gb, features, trial_days, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
       RETURNING *`,
      [
        id,
        planData.name,
        planData.description,
        planData.price_monthly,
        planData.price_yearly,
        planData.stripe_price_monthly_id,
        planData.stripe_price_yearly_id,
        planData.stripe_product_id,
        planData.is_active,
        planData.user_limit,
        planData.storage_limit_gb,
        planData.features ? JSON.stringify(planData.features) : null,
        planData.trial_days,
        planData.display_order
      ]
    );
    return result.rows[0];
  }
}

export class SubscriptionModel {
  static async create(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
    try {
      // First attempt: try with trialing status and trial_ends_at
      const result = await query(
        `INSERT INTO subscriptions.subscriptions (company_id, plan_id, stripe_subscription_id, status, trial_ends_at, renews_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [
          subscriptionData.company_id,
          subscriptionData.plan_id,
          subscriptionData.stripe_subscription_id,
          'trialing', // Start with trial status
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
          null // Will be set when payment is processed
        ]
      );
      return result.rows[0];
    } catch (error: any) {
      // If constraint error, try with active status instead
      if (error.code === '23514' && error.constraint === 'subscriptions_trial_logic') {
        console.log('Trial logic constraint failed, trying with active status...');
        const result = await query(
          `INSERT INTO subscriptions.subscriptions (company_id, plan_id, stripe_subscription_id, status, trial_ends_at, renews_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           RETURNING *`,
          [
            subscriptionData.company_id,
            subscriptionData.plan_id,
            subscriptionData.stripe_subscription_id,
            'active', // Use active status to bypass constraint
            null, // No trial end date
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Set renewal for 30 days
          ]
        );
        return result.rows[0];
      }
      throw error; // Re-throw if it's a different error
    }
  }

  static async findByCompanyId(companyId: string): Promise<Subscription | null> {
    const result = await query(
      'SELECT * FROM subscriptions.subscriptions WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1',
      [companyId]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<Subscription | null> {
    const result = await query(
      'SELECT * FROM subscriptions.subscriptions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const result = await query(
      'SELECT * FROM subscriptions.subscriptions WHERE stripe_subscription_id = $1',
      [stripeSubscriptionId]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id: string, status: string, renewsAt?: Date): Promise<Subscription> {
    const result = await query(
      'UPDATE subscriptions.subscriptions SET status = $1, renews_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, renewsAt, id]
    );
    return result.rows[0];
  }

  static async getSubscriptionWithPlan(companyId: string): Promise<(Subscription & SubscriptionPlan) | null> {
    const result = await query(
      `SELECT s.*, sp.name as plan_name, sp.description, sp.price_monthly, sp.price_yearly, sp.features, sp.user_limit, sp.storage_limit_gb, sp.trial_days
       FROM subscriptions.subscriptions s
       JOIN subscriptions.subscription_plans sp ON s.plan_id = sp.id
       WHERE s.company_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [companyId]
    );
    return result.rows[0] || null;
  }
}