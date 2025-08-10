-- Migration to create invoices and billing_events tables with proper schemas
-- Run this in your PostgreSQL database

-- Create invoices table
CREATE TABLE IF NOT EXISTS billing.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'one_time')),
  description TEXT,
  billing_address JSONB,
  metadata JSONB,
  paid_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT fk_invoices_company FOREIGN KEY (company_id) REFERENCES organization.companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoices_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions.subscriptions(id) ON DELETE CASCADE
);

-- Create billing_events table
CREATE TABLE IF NOT EXISTS billing.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  subscription_id UUID,
  invoice_id UUID,
  event_type VARCHAR(100) NOT NULL,
  event_status VARCHAR(20) NOT NULL CHECK (event_status IN ('pending', 'processed', 'failed', 'skipped')),
  stripe_event_id VARCHAR(255),
  stripe_object_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  description TEXT,
  metadata JSONB,
  raw_event_data JSONB,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT fk_billing_events_company FOREIGN KEY (company_id) REFERENCES organization.companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_billing_events_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions.subscriptions(id) ON DELETE CASCADE,
  CONSTRAINT fk_billing_events_invoice FOREIGN KEY (invoice_id) REFERENCES billing.invoices(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON billing.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON billing.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_payment_intent_id ON billing.invoices(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON billing.invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON billing.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON billing.invoices(created_at);

CREATE INDEX IF NOT EXISTS idx_billing_events_company_id ON billing.billing_events(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_subscription_id ON billing.billing_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_invoice_id ON billing.billing_events(invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_event_type ON billing.billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_event_status ON billing.billing_events(event_status);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id ON billing.billing_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at ON billing.billing_events(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON billing.invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_events_updated_at BEFORE UPDATE ON billing.billing_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

