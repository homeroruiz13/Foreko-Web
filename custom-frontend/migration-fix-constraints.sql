-- Migration to fix subscription constraints
-- This removes problematic constraints that are blocking subscription creation

-- First, let's see what constraints exist on the subscriptions table
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'subscriptions' 
AND rel.relname = 'subscriptions'
AND con.contype = 'c'; -- Check constraints only

-- Drop the problematic trial logic constraint
DO $$ 
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'subscriptions' 
        AND rel.relname = 'subscriptions'
        AND con.conname = 'subscriptions_trial_logic'
    ) THEN
        ALTER TABLE subscriptions.subscriptions DROP CONSTRAINT subscriptions_trial_logic;
        RAISE NOTICE 'Dropped subscriptions_trial_logic constraint';
    ELSE
        RAISE NOTICE 'subscriptions_trial_logic constraint does not exist';
    END IF;
END $$;

-- Add a simpler, more flexible constraint if needed
-- This ensures that if status is 'trialing', trial_ends_at should be set
DO $$
BEGIN
    -- Only add if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'subscriptions' 
        AND rel.relname = 'subscriptions'
        AND con.conname = 'trial_status_check'
    ) THEN
        ALTER TABLE subscriptions.subscriptions 
        ADD CONSTRAINT trial_status_check 
        CHECK (
            (status != 'trialing') OR 
            (status = 'trialing' AND trial_ends_at IS NOT NULL)
        );
        RAISE NOTICE 'Added new trial_status_check constraint';
    ELSE
        RAISE NOTICE 'trial_status_check constraint already exists';
    END IF;
END $$;

-- Show remaining constraints
SELECT 'Updated constraints on subscriptions table:' as message;
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'subscriptions' 
AND rel.relname = 'subscriptions'
AND con.contype = 'c';