-- Fix for invoices_paid_logic constraint error
-- Based on the actual database schema from the Foreko Database

-- First, let's check what the current constraint looks like
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'billing' 
AND rel.relname = 'invoices'
AND con.conname = 'invoices_paid_logic';

-- Drop the problematic constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'billing' 
        AND rel.relname = 'invoices'
        AND con.conname = 'invoices_paid_logic'
    ) THEN
        ALTER TABLE billing.invoices DROP CONSTRAINT invoices_paid_logic;
        RAISE NOTICE 'Dropped invoices_paid_logic constraint';
    ELSE
        RAISE NOTICE 'invoices_paid_logic constraint does not exist';
    END IF;
END $$;

-- Create a more flexible constraint for paid invoices
-- This ensures that if status is 'paid', then amount_paid should be greater than 0 OR the invoice is a free plan (amount_due = 0)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'billing' 
        AND rel.relname = 'invoices'
        AND con.conname = 'invoices_paid_logic_flexible'
    ) THEN
        ALTER TABLE billing.invoices 
        ADD CONSTRAINT invoices_paid_logic_flexible 
        CHECK (
            (status != 'paid') OR 
            (status = 'paid' AND (amount_paid > 0 OR amount_due = 0))
        );
        RAISE NOTICE 'Added new invoices_paid_logic_flexible constraint';
    ELSE
        RAISE NOTICE 'invoices_paid_logic_flexible constraint already exists';
    END IF;
END $$;

-- Show the current structure of the invoices table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'billing' 
AND table_name = 'invoices'
ORDER BY ordinal_position;