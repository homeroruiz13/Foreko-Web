-- Setup script for authentication tables
-- Run this in your PostgreSQL database
-- NOTE: This database should already have the Foreko schemas (auth, org, subscriptions, billing, monitoring, config)
-- This script updates table names to match the current implementation

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- =========================
-- 1. USERS TABLE (if not exists)
-- =========================
CREATE TABLE IF NOT EXISTS auth.users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    email_verified_at TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 2. EMAIL VERIFICATIONS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS auth.email_verifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token           VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 3. PASSWORD RESETS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS auth.password_resets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token           VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 4. USER SESSIONS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS auth.user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token   VARCHAR(255) NOT NULL,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 5. TRIGGER FUNCTION
-- =========================
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

-- =========================
-- 6. TRIGGERS
-- =========================
-- Drop triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_users_updated_at ON auth.users;
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON auth.user_sessions;

-- Create triggers
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON auth.user_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- 7. INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON auth.email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON auth.email_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON auth.password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON auth.password_resets(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON auth.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON auth.user_sessions(session_token);

-- =========================
-- 8. VERIFICATION
-- =========================
-- Verify tables were created
SELECT 'Setup complete! Tables created:' as message;
SELECT tablename FROM pg_tables WHERE schemaname = 'auth' ORDER BY tablename;