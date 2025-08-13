import { query } from '../db';

export interface BillingEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  api_version?: string;
  livemode?: boolean;
  payload: any;
  processed?: boolean;
  processed_at?: Date;
  error_message?: string;
  retry_count?: number;
  created_at?: Date;
}

export interface CreateBillingEventData {
  stripe_event_id: string;
  event_type: string;
  api_version?: string;
  livemode?: boolean;
  payload: any;
  processed?: boolean;
  processed_at?: Date;
  error_message?: string;
  retry_count?: number;
}

export class BillingEventModel {
  static async create(eventData: CreateBillingEventData): Promise<BillingEvent> {
    const result = await query(
      `INSERT INTO billing.billing_events (
        stripe_event_id, event_type, api_version, livemode, payload, 
        processed, processed_at, error_message, retry_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        eventData.stripe_event_id,
        eventData.event_type,
        eventData.api_version || null,
        eventData.livemode !== undefined ? eventData.livemode : false,
        eventData.payload ? JSON.stringify(eventData.payload) : '{}',
        eventData.processed !== undefined ? eventData.processed : true,
        eventData.processed_at || new Date(),
        eventData.error_message || null,
        eventData.retry_count || 0
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
        SUM(CASE WHEN event_type = 'invoice_paid' THEN 1 ELSE 0 END) as successful_payments,
        SUM(CASE WHEN event_type = 'invoice_failed' THEN 1 ELSE 0 END) as failed_payments
      FROM billing.billing_events`
    );
    return result.rows[0] || { total_events: 0, successful_payments: 0, failed_payments: 0 };
  }

  static async getRecentPaymentEvents(days: number = 30): Promise<BillingEvent[]> {
    const result = await query(
      `SELECT * FROM billing.billing_events 
       WHERE event_type IN ('invoice_paid', 'invoice_failed')
       AND processed_at >= NOW() - INTERVAL '${days} days'
       ORDER BY processed_at DESC`
    );
    return result.rows;
  }
}