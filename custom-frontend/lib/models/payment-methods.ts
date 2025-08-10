import { query } from '../db';

export interface PaymentMethod {
  id: string;
  company_id: string;
  stripe_payment_method_id: string;
  type?: string;
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  cardholder_name?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentMethodData {
  company_id: string;
  stripe_payment_method_id: string;
  type?: string;
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default?: boolean;
  cardholder_name?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
}

export class PaymentMethodModel {
  static async create(paymentMethodData: CreatePaymentMethodData): Promise<PaymentMethod> {
    // If this is set as default, make all other payment methods for this company non-default
    if (paymentMethodData.is_default) {
      await query(
        'UPDATE billing.payment_methods SET is_default = FALSE WHERE company_id = $1',
        [paymentMethodData.company_id]
      );
    }

    const result = await query(
      `INSERT INTO billing.payment_methods (
        company_id, stripe_payment_method_id, type, last4, brand, exp_month, exp_year,
        is_default, cardholder_name, billing_address_line1, billing_address_line2,
        billing_city, billing_state, billing_postal_code, billing_country,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *`,
      [
        paymentMethodData.company_id,
        paymentMethodData.stripe_payment_method_id,
        paymentMethodData.type,
        paymentMethodData.last4,
        paymentMethodData.brand,
        paymentMethodData.exp_month,
        paymentMethodData.exp_year,
        paymentMethodData.is_default ?? true,
        paymentMethodData.cardholder_name,
        paymentMethodData.billing_address_line1,
        paymentMethodData.billing_address_line2,
        paymentMethodData.billing_city,
        paymentMethodData.billing_state,
        paymentMethodData.billing_postal_code,
        paymentMethodData.billing_country
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<PaymentMethod | null> {
    const result = await query(
      'SELECT * FROM billing.payment_methods WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByCompanyId(companyId: string): Promise<PaymentMethod[]> {
    const result = await query(
      'SELECT * FROM billing.payment_methods WHERE company_id = $1 ORDER BY is_default DESC, created_at DESC',
      [companyId]
    );
    return result.rows;
  }

  static async findByStripePaymentMethodId(stripePaymentMethodId: string): Promise<PaymentMethod | null> {
    const result = await query(
      'SELECT * FROM billing.payment_methods WHERE stripe_payment_method_id = $1',
      [stripePaymentMethodId]
    );
    return result.rows[0] || null;
  }

  static async findDefaultByCompanyId(companyId: string): Promise<PaymentMethod | null> {
    const result = await query(
      'SELECT * FROM billing.payment_methods WHERE company_id = $1 AND is_default = TRUE LIMIT 1',
      [companyId]
    );
    return result.rows[0] || null;
  }

  static async setAsDefault(id: string, companyId: string): Promise<PaymentMethod> {
    // First, make all other payment methods for this company non-default
    await query(
      'UPDATE billing.payment_methods SET is_default = FALSE WHERE company_id = $1',
      [companyId]
    );

    // Then set this payment method as default
    const result = await query(
      'UPDATE billing.payment_methods SET is_default = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM billing.payment_methods WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  static async updateBillingAddress(id: string, billingAddress: {
    cardholder_name?: string;
    billing_address_line1?: string;
    billing_address_line2?: string;
    billing_city?: string;
    billing_state?: string;
    billing_postal_code?: string;
    billing_country?: string;
  }): Promise<PaymentMethod> {
    const result = await query(
      `UPDATE billing.payment_methods SET 
        cardholder_name = COALESCE($1, cardholder_name),
        billing_address_line1 = COALESCE($2, billing_address_line1),
        billing_address_line2 = COALESCE($3, billing_address_line2),
        billing_city = COALESCE($4, billing_city),
        billing_state = COALESCE($5, billing_state),
        billing_postal_code = COALESCE($6, billing_postal_code),
        billing_country = COALESCE($7, billing_country),
        updated_at = NOW()
      WHERE id = $8 RETURNING *`,
      [
        billingAddress.cardholder_name,
        billingAddress.billing_address_line1,
        billingAddress.billing_address_line2,
        billingAddress.billing_city,
        billingAddress.billing_state,
        billingAddress.billing_postal_code,
        billingAddress.billing_country,
        id
      ]
    );
    return result.rows[0];
  }
}