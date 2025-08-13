import { query } from '../db';

export interface Invoice {
  id: string;
  company_id: string;
  subscription_id?: string;
  stripe_payment_intent_id?: string;
  stripe_subscription_id?: string;
  stripe_invoice_id?: string;
  amount: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  hosted_invoice_url?: string;
  invoice_pdf_url?: string;
  description?: string;
  billing_period_start?: Date;
  billing_period_end?: Date;
  due_date?: Date;
  paid_at?: Date;
  metadata?: any;
  line_items_count: number;
  attempt_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvoiceData {
  company_id: string;
  subscription_id?: string;
  stripe_payment_intent_id?: string;
  stripe_subscription_id?: string;
  stripe_invoice_id?: string;
  amount: number;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  status?: string;
  hosted_invoice_url?: string;
  invoice_pdf_url?: string;
  description?: string;
  billing_period_start?: Date;
  billing_period_end?: Date;
  due_date?: Date;
  paid_at?: Date;
  metadata?: any;
  line_items_count?: number;
  attempt_count?: number;
}

// Legacy interface for backwards compatibility
export interface LegacyCreateInvoiceData {
  company_id: string;
  stripe_invoice_id: string;
  amount_due?: number;
  amount_paid?: number;
  status?: string;
  hosted_invoice_url?: string;
  invoice_pdf_url?: string;
  billing_period_start?: Date;
  billing_period_end?: Date;
}

export class InvoiceModel {
  static async create(invoiceData: CreateInvoiceData): Promise<Invoice> {
    const result = await query(
      `INSERT INTO billing.invoices (
        company_id, subscription_id, stripe_payment_intent_id, stripe_subscription_id,
        stripe_invoice_id, amount, subtotal, tax_amount, discount_amount, total_amount,
        currency, status, hosted_invoice_url, invoice_pdf_url, description,
        billing_period_start, billing_period_end, due_date, paid_at, metadata,
        line_items_count, attempt_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW())
      RETURNING *`,
      [
        invoiceData.company_id,
        invoiceData.subscription_id,
        invoiceData.stripe_payment_intent_id,
        invoiceData.stripe_subscription_id,
        invoiceData.stripe_invoice_id,
        invoiceData.amount,
        invoiceData.subtotal || invoiceData.amount,
        invoiceData.tax_amount || 0,
        invoiceData.discount_amount || 0,
        invoiceData.total_amount || invoiceData.amount,
        invoiceData.currency || 'USD',
        invoiceData.status || 'pending',
        invoiceData.hosted_invoice_url,
        invoiceData.invoice_pdf_url,
        invoiceData.description,
        invoiceData.billing_period_start,
        invoiceData.billing_period_end,
        invoiceData.due_date,
        invoiceData.paid_at,
        invoiceData.metadata ? JSON.stringify(invoiceData.metadata) : null,
        invoiceData.line_items_count || 0,
        invoiceData.attempt_count || 0
      ]
    );
    return result.rows[0];
  }

  // Legacy create method for backwards compatibility
  static async createLegacy(invoiceData: LegacyCreateInvoiceData): Promise<Invoice> {
    return this.create({
      company_id: invoiceData.company_id,
      stripe_invoice_id: invoiceData.stripe_invoice_id,
      amount: invoiceData.amount_due || 0,
      subtotal: invoiceData.amount_due || 0,
      total_amount: invoiceData.amount_due || 0,
      currency: 'USD',
      status: invoiceData.status || 'pending',
      hosted_invoice_url: invoiceData.hosted_invoice_url,
      invoice_pdf_url: invoiceData.invoice_pdf_url,
      billing_period_start: invoiceData.billing_period_start,
      billing_period_end: invoiceData.billing_period_end,
      paid_at: invoiceData.status === 'paid' ? new Date() : undefined,
      line_items_count: 0
    });
  }

  static async findById(id: string): Promise<Invoice | null> {
    const result = await query(
      'SELECT * FROM billing.invoices WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByCompanyId(companyId: string): Promise<Invoice[]> {
    const result = await query(
      'SELECT * FROM billing.invoices WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    return result.rows;
  }

  static async findByStripeInvoiceId(stripeInvoiceId: string): Promise<Invoice | null> {
    const result = await query(
      'SELECT * FROM billing.invoices WHERE stripe_invoice_id = $1',
      [stripeInvoiceId]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id: string, status: string, amountPaid?: number): Promise<Invoice> {
    const updateFields = ['status = $1', 'updated_at = NOW()'];
    const values: any[] = [status];
    
    if (amountPaid !== undefined) {
      updateFields.push('total_amount = $2', 'paid_at = $3');
      values.push(amountPaid, status === 'paid' ? new Date() : null);
    }
    
    const result = await query(
      `UPDATE billing.invoices SET ${updateFields.join(', ')} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }

  static async updateInvoiceData(id: string, updates: {
    amount?: number;
    subtotal?: number;
    tax_amount?: number;
    discount_amount?: number;
    total_amount?: number;
    status?: string;
    hosted_invoice_url?: string;
    invoice_pdf_url?: string;
    billing_period_start?: Date;
    billing_period_end?: Date;
    paid_at?: Date;
    description?: string;
  }): Promise<Invoice> {
    const result = await query(
      `UPDATE billing.invoices SET 
        amount = COALESCE($1, amount),
        subtotal = COALESCE($2, subtotal),
        tax_amount = COALESCE($3, tax_amount),
        discount_amount = COALESCE($4, discount_amount),
        total_amount = COALESCE($5, total_amount),
        status = COALESCE($6, status),
        hosted_invoice_url = COALESCE($7, hosted_invoice_url),
        invoice_pdf_url = COALESCE($8, invoice_pdf_url),
        billing_period_start = COALESCE($9, billing_period_start),
        billing_period_end = COALESCE($10, billing_period_end),
        paid_at = COALESCE($11, paid_at),
        description = COALESCE($12, description),
        updated_at = NOW()
      WHERE id = $13 RETURNING *`,
      [
        updates.amount,
        updates.subtotal,
        updates.tax_amount,
        updates.discount_amount,
        updates.total_amount,
        updates.status,
        updates.hosted_invoice_url,
        updates.invoice_pdf_url,
        updates.billing_period_start,
        updates.billing_period_end,
        updates.paid_at,
        updates.description,
        id
      ]
    );
    return result.rows[0];
  }

  static async getInvoiceHistory(companyId: string, limit: number = 50): Promise<Invoice[]> {
    const result = await query(
      `SELECT * FROM billing.invoices 
       WHERE company_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [companyId, limit]
    );
    return result.rows;
  }

  static async getTotalRevenue(companyId: string): Promise<{ total: number }> {
    const result = await query(
      `SELECT SUM(total_amount) as total 
       FROM billing.invoices 
       WHERE company_id = $1 AND status = 'paid'`,
      [companyId]
    );
    return result.rows[0] || { total: 0 };
  }

  static async getInvoicesByStatus(companyId: string, status: string): Promise<Invoice[]> {
    const result = await query(
      'SELECT * FROM billing.invoices WHERE company_id = $1 AND status = $2 ORDER BY created_at DESC',
      [companyId, status]
    );
    return result.rows;
  }
}