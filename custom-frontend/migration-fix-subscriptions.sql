-- Migration to fix subscriptions table structure
-- Run this to add missing columns to the subscriptions table

-- Create subscriptions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS subscriptions;

-- Check if subscriptions table exists and add missing columns
DO $$ 
BEGIN
    -- Add renews_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'subscriptions' 
        AND table_name = 'subscriptions' 
        AND column_name = 'renews_at'
    ) THEN
        ALTER TABLE subscriptions.subscriptions ADD COLUMN renews_at TIMESTAMPTZ;
        RAISE NOTICE 'Added renews_at column to subscriptions table';
    END IF;

    -- Add trial_ends_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'subscriptions' 
        AND table_name = 'subscriptions' 
        AND column_name = 'trial_ends_at'
    ) THEN
        ALTER TABLE subscriptions.subscriptions ADD COLUMN trial_ends_at TIMESTAMPTZ;
        RAISE NOTICE 'Added trial_ends_at column to subscriptions table';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'subscriptions' 
        AND table_name = 'subscriptions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE subscriptions.subscriptions ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to subscriptions table';
    END IF;

    -- Add status column if it doesn't exist with proper check constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'subscriptions' 
        AND table_name = 'subscriptions' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE subscriptions.subscriptions ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'trialing' 
        CHECK (status IN ('trialing', 'active', 'cancelled', 'expired'));
        RAISE NOTICE 'Added status column to subscriptions table';
    END IF;

    RAISE NOTICE 'Migration completed successfully';
END $$;

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        NEW IS DISTINCT FROM OLD
        AND NEW.updated_at IS DISTINCT FROM OLD.updated_at
    ) THEN
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at on subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Show current table structure
SELECT 'Current subscriptions table structure:' as message;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'subscriptions' 
AND table_name = 'subscriptions'
ORDER BY ordinal_position;