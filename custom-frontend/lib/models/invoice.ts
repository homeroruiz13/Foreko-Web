import { query } from '../db';

export interface Invoice {
  id: string;
  company_id: string;
  subscription_id?: string;
  stripe_invoice_id: string;
  invoice_number?: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  tax_amount?: number;
  discount_amount?: number;
  currency?: string;
  status: string;
  description?: string;
  hosted_invoice_url?: string;
  invoice_pdf_url?: string;
  billing_period_start?: Date;
  billing_period_end?: Date;
  due_date?: Date;
  paid_at?: Date;
  voided_at?: Date;
  attempt_count?: number;
  next_payment_attempt?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvoiceData {
  company_id: string;
  subscription_id?: string;
  stripe_invoice_id: string;
  invoice_number?: string;
  amount_due?: number;
  amount_paid?: number;
  amount_remaining?: number;
  tax_amount?: number;
  discount_amount?: number;
  currency?: string;
  status?: string;
  description?: string;
  hosted_invoice_url?: string;
  invoice_pdf_url?: string;
  billing_period_start?: Date;
  billing_period_end?: Date;
  due_date?: Date;
  paid_at?: Date;
  voided_at?: Date;
  attempt_count?: number;
  next_payment_attempt?: Date;
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
        company_id, subscription_id, stripe_invoice_id, invoice_number,
        amount_due, amount_paid, amount_remaining, tax_amount, discount_amount,
        currency, status, description, hosted_invoice_url, invoice_pdf_url,
        billing_period_start, billing_period_end, due_date, paid_at,
        voided_at, attempt_count, next_payment_attempt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        invoiceData.company_id,
        invoiceData.subscription_id,
        invoiceData.stripe_invoice_id,
        invoiceData.invoice_number,
        invoiceData.amount_due || 0,
        invoiceData.amount_paid || 0,
        invoiceData.amount_remaining || (invoiceData.amount_due || 0) - (invoiceData.amount_paid || 0),
        invoiceData.tax_amount || 0,
        invoiceData.discount_amount || 0,
        invoiceData.currency || 'USD',
        invoiceData.status || 'pending',
        invoiceData.description,
        invoiceData.hosted_invoice_url,
        invoiceData.invoice_pdf_url,
        invoiceData.billing_period_start,
        invoiceData.billing_period_end,
        invoiceData.due_date,
        invoiceData.paid_at,
        invoiceData.voided_at,
        invoiceData.attempt_count || 0,
        invoiceData.next_payment_attempt
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
    const updateFields = ['status = $1', 'updated_at = NOW()'];
    const values: any[] = [status];
    
    if (amountPaid !== undefined) {
      updateFields.push('amount_paid = $2', 'amount_remaining = amount_due - $3');
      values.push(amountPaid, amountPaid);
      
      // Set paid_at when status is paid
      if (status === 'paid') {
        updateFields.push('paid_at = $4');
        values.push(new Date());
      }
    } else if (status === 'paid') {
      updateFields.push('paid_at = $2');
      values.push(new Date());
    }
    
    const result = await query(
      `UPDATE billing.invoices SET ${updateFields.join(', ')} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }

  static async updateInvoiceData(id: string, updates: {
    amount_due?: number;
    amount_paid?: number;
    amount_remaining?: number;
    tax_amount?: number;
    discount_amount?: number;
    status?: string;
    description?: string;
    hosted_invoice_url?: string;
    invoice_pdf_url?: string;
    billing_period_start?: Date;
    billing_period_end?: Date;
    due_date?: Date;
    paid_at?: Date;
    voided_at?: Date;
    attempt_count?: number;
  }): Promise<Invoice> {
    const result = await query(
      `UPDATE billing.invoices SET 
        amount_due = COALESCE($1, amount_due),
        amount_paid = COALESCE($2, amount_paid),
        amount_remaining = COALESCE($3, amount_remaining),
        tax_amount = COALESCE($4, tax_amount),
        discount_amount = COALESCE($5, discount_amount),
        status = COALESCE($6, status),
        description = COALESCE($7, description),
        hosted_invoice_url = COALESCE($8, hosted_invoice_url),
        invoice_pdf_url = COALESCE($9, invoice_pdf_url),
        billing_period_start = COALESCE($10, billing_period_start),
        billing_period_end = COALESCE($11, billing_period_end),
        due_date = COALESCE($12, due_date),
        paid_at = COALESCE($13, paid_at),
        voided_at = COALESCE($14, voided_at),
        attempt_count = COALESCE($15, attempt_count),
        updated_at = NOW()
      WHERE id = $16 RETURNING *`,
      [
        updates.amount_due,
        updates.amount_paid,
        updates.amount_remaining,
        updates.tax_amount,
        updates.discount_amount,
        updates.status,
        updates.description,
        updates.hosted_invoice_url,
        updates.invoice_pdf_url,
        updates.billing_period_start,
        updates.billing_period_end,
        updates.due_date,
        updates.paid_at,
        updates.voided_at,
        updates.attempt_count,
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