import { query } from '../db';

export interface Invoice {
  id: string;
  company_id: string;
  stripe_invoice_id: string;
  amount_due?: number;
  amount_paid?: number;
  status?: string;
  hosted_invoice_url?: string;
  invoice_pdf_url?: string;
  billing_period_start?: Date;
  billing_period_end?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvoiceData {
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
        company_id, stripe_invoice_id, amount_due, amount_paid, status,
        hosted_invoice_url, invoice_pdf_url, billing_period_start, 
        billing_period_end, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        invoiceData.company_id,
        invoiceData.stripe_invoice_id,
        invoiceData.amount_due,
        invoiceData.amount_paid,
        invoiceData.status,
        invoiceData.hosted_invoice_url,
        invoiceData.invoice_pdf_url,
        invoiceData.billing_period_start,
        invoiceData.billing_period_end
      ]
    );
    return result.rows[0];
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
    const result = await query(
      'UPDATE billing.invoices SET status = $1, amount_paid = COALESCE($2, amount_paid), updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, amountPaid, id]
    );
    return result.rows[0];
  }

  static async updateInvoiceData(id: string, updates: {
    amount_due?: number;
    amount_paid?: number;
    status?: string;
    hosted_invoice_url?: string;
    invoice_pdf_url?: string;
    billing_period_start?: Date;
    billing_period_end?: Date;
  }): Promise<Invoice> {
    const result = await query(
      `UPDATE billing.invoices SET 
        amount_due = COALESCE($1, amount_due),
        amount_paid = COALESCE($2, amount_paid),
        status = COALESCE($3, status),
        hosted_invoice_url = COALESCE($4, hosted_invoice_url),
        invoice_pdf_url = COALESCE($5, invoice_pdf_url),
        billing_period_start = COALESCE($6, billing_period_start),
        billing_period_end = COALESCE($7, billing_period_end),
        updated_at = NOW()
      WHERE id = $8 RETURNING *`,
      [
        updates.amount_due,
        updates.amount_paid,
        updates.status,
        updates.hosted_invoice_url,
        updates.invoice_pdf_url,
        updates.billing_period_start,
        updates.billing_period_end,
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
      `SELECT SUM(amount_paid) as total 
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