import { query } from '../db';

export interface PaymentTransaction {
  id: string;
  company_id: string;
  invoice_id?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  amount: number;
  currency?: string;
  status: string;
  payment_method_id?: string;
  failure_code?: string;
  failure_message?: string;
  processing_fee?: number;
  net_amount?: number;
  refunded_amount?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentTransactionData {
  company_id: string;
  invoice_id?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  amount: number;
  currency?: string;
  status: string;
  payment_method_id?: string;
  failure_code?: string;
  failure_message?: string;
  processing_fee?: number;
  net_amount?: number;
  refunded_amount?: number;
}

export class PaymentTransactionModel {
  static async create(transactionData: CreatePaymentTransactionData): Promise<PaymentTransaction> {
    const result = await query(
      `INSERT INTO billing.payment_transactions (
        company_id, invoice_id, stripe_payment_intent_id, stripe_charge_id,
        amount, currency, status, payment_method_id, failure_code, failure_message,
        processing_fee, net_amount, refunded_amount, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        transactionData.company_id,
        transactionData.invoice_id,
        transactionData.stripe_payment_intent_id,
        transactionData.stripe_charge_id,
        transactionData.amount,
        transactionData.currency || 'USD',
        transactionData.status,
        transactionData.payment_method_id,
        transactionData.failure_code,
        transactionData.failure_message,
        transactionData.processing_fee || 0,
        transactionData.net_amount || transactionData.amount,
        transactionData.refunded_amount || 0
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<PaymentTransaction | null> {
    const result = await query(
      'SELECT * FROM billing.payment_transactions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByCompanyId(companyId: string): Promise<PaymentTransaction[]> {
    const result = await query(
      'SELECT * FROM billing.payment_transactions WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    return result.rows;
  }

  static async findByInvoiceId(invoiceId: string): Promise<PaymentTransaction[]> {
    const result = await query(
      'SELECT * FROM billing.payment_transactions WHERE invoice_id = $1 ORDER BY created_at DESC',
      [invoiceId]
    );
    return result.rows;
  }

  static async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<PaymentTransaction | null> {
    const result = await query(
      'SELECT * FROM billing.payment_transactions WHERE stripe_payment_intent_id = $1',
      [stripePaymentIntentId]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id: string, status: string, failureCode?: string, failureMessage?: string): Promise<PaymentTransaction> {
    const result = await query(
      `UPDATE billing.payment_transactions 
       SET status = $1, failure_code = $2, failure_message = $3, updated_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [status, failureCode, failureMessage, id]
    );
    return result.rows[0];
  }

  static async getTransactionStats(companyId: string): Promise<{
    total_transactions: number;
    successful_transactions: number;
    failed_transactions: number;
    total_amount: number;
    total_fees: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as successful_transactions,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_transactions,
        SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total_amount,
        SUM(CASE WHEN status = 'succeeded' THEN processing_fee ELSE 0 END) as total_fees
      FROM billing.payment_transactions 
      WHERE company_id = $1`,
      [companyId]
    );
    return result.rows[0] || { 
      total_transactions: 0, 
      successful_transactions: 0, 
      failed_transactions: 0, 
      total_amount: 0, 
      total_fees: 0 
    };
  }

  static async getRecentTransactions(companyId: string, limit: number = 50): Promise<PaymentTransaction[]> {
    const result = await query(
      `SELECT * FROM billing.payment_transactions 
       WHERE company_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [companyId, limit]
    );
    return result.rows;
  }
}