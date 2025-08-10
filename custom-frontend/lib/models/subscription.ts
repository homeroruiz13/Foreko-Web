import { query } from '../db';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly?: number;
  price_yearly?: number;
  stripe_price_id?: string;
  is_active: boolean;
  user_limit?: number;
  features?: any;
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
      'SELECT * FROM subscriptions.subscription_plans WHERE is_active = TRUE ORDER BY price_monthly ASC'
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
      `INSERT INTO subscriptions.subscription_plans (name, price_monthly, price_yearly, stripe_price_id, is_active, user_limit, features, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        planData.name,
        planData.price_monthly,
        planData.price_yearly,
        planData.stripe_price_id,
        planData.is_active,
        planData.user_limit,
        planData.features ? JSON.stringify(planData.features) : null
      ]
    );
    return result.rows[0];
  }

  static async createWithId(id: string, planData: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>): Promise<SubscriptionPlan> {
    const result = await query(
      `INSERT INTO subscriptions.subscription_plans (id, name, price_monthly, price_yearly, stripe_price_id, is_active, user_limit, features, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        id,
        planData.name,
        planData.price_monthly,
        planData.price_yearly,
        planData.stripe_price_id,
        planData.is_active,
        planData.user_limit,
        planData.features ? JSON.stringify(planData.features) : null
      ]
    );
    return result.rows[0];
  }
}

export class SubscriptionModel {
  static async create(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
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
      `SELECT s.*, sp.name as plan_name, sp.price_monthly, sp.price_yearly, sp.features, sp.user_limit
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