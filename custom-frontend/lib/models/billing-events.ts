import { query } from '../db';

export interface BillingEvent {
  id: string;
  stripe_event_id: string;
  event_type?: string;
  payload?: any;
  processed_at?: Date;
}

export interface CreateBillingEventData {
  stripe_event_id: string;
  event_type?: string;
  payload?: any;
}

export class BillingEventModel {
  static async create(eventData: CreateBillingEventData): Promise<BillingEvent> {
    const result = await query(
      `INSERT INTO billing.billing_events (
        stripe_event_id, event_type, payload, processed_at
      ) VALUES ($1, $2, $3, NOW())
      RETURNING *`,
      [
        eventData.stripe_event_id,
        eventData.event_type,
        eventData.payload ? JSON.stringify(eventData.payload) : null
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<BillingEvent | null> {
    const result = await query(
      'SELECT * FROM billing.billing_events WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByStripeEventId(stripeEventId: string): Promise<BillingEvent | null> {
    const result = await query(
      'SELECT * FROM billing.billing_events WHERE stripe_event_id = $1',
      [stripeEventId]
    );
    return result.rows[0] || null;
  }

  static async findByEventType(eventType: string, limit: number = 100): Promise<BillingEvent[]> {
    const result = await query(
      'SELECT * FROM billing.billing_events WHERE event_type = $1 ORDER BY processed_at DESC LIMIT $2',
      [eventType, limit]
    );
    return result.rows;
  }

  static async findAll(limit: number = 100): Promise<BillingEvent[]> {
    const result = await query(
      'SELECT * FROM billing.billing_events ORDER BY processed_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async getEventStats(): Promise<{
    total_events: number;
    successful_payments: number;
    failed_payments: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN event_type LIKE '%succeeded%' THEN 1 ELSE 0 END) as successful_payments,
        SUM(CASE WHEN event_type LIKE '%failed%' THEN 1 ELSE 0 END) as failed_payments
      FROM billing.billing_events`
    );
    return result.rows[0] || { total_events: 0, successful_payments: 0, failed_payments: 0 };
  }

  static async getRecentPaymentEvents(days: number = 30): Promise<BillingEvent[]> {
    const result = await query(
      `SELECT * FROM billing.billing_events 
       WHERE event_type IN ('payment_intent.succeeded', 'invoice.payment_succeeded', 'checkout.session.completed')
       AND processed_at >= NOW() - INTERVAL '${days} days'
       ORDER BY processed_at DESC`
    );
    return result.rows;
  }
}