-- Migration to update payment schema foreign key references
-- Run this in your PostgreSQL database

-- Fix foreign key reference in payment_methods table
-- First drop the existing constraint if it exists
ALTER TABLE IF EXISTS billing.payment_methods 
DROP CONSTRAINT IF EXISTS payment_methods_company_id_fkey;

-- Add the correct foreign key reference to organization schema
ALTER TABLE billing.payment_methods 
ADD CONSTRAINT fk_payment_methods_company 
FOREIGN KEY (company_id) REFERENCES organization.companies(id) ON DELETE CASCADE;

-- Fix foreign key reference in invoices table  
ALTER TABLE IF EXISTS billing.invoices
DROP CONSTRAINT IF EXISTS invoices_company_id_fkey;

-- Add the correct foreign key reference to organization schema
ALTER TABLE billing.invoices
ADD CONSTRAINT fk_invoices_company 
FOREIGN KEY (company_id) REFERENCES organization.companies(id) ON DELETE CASCADE;