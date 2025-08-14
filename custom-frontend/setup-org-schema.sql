-- =========================
-- ORG SCHEMA - STANDALONE
-- =========================
-- Complete organization schema extracted from master
-- This file can be run independently for org-only deployments
-- Requires: auth schema to exist (for foreign key references)

CREATE SCHEMA IF NOT EXISTS org;

-- =========================
-- ENUM TYPES
-- =========================
DO $ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE org.user_role AS ENUM ('owner', 'admin', 'member');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_role') THEN
        CREATE TYPE org.invitation_role AS ENUM ('admin', 'member');
    END IF;
END $;

-- =========================
-- TRIGGER FUNCTIONS
-- =========================
CREATE OR REPLACE FUNCTION org.update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    IF (NEW IS DISTINCT FROM OLD AND NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at) THEN
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION org.ensure_company_owner()
RETURNS TRIGGER AS $
BEGIN
    -- If deleting or changing role from owner, ensure another owner exists
    IF (TG_OP = 'DELETE' AND OLD.role = 'owner') OR 
       (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner') THEN
        
        IF NOT EXISTS (
            SELECT 1 FROM org.user_companies 
            WHERE company_id = COALESCE(NEW.company_id, OLD.company_id) 
            AND role = 'owner' 
            AND id != OLD.id
        ) THEN
            RAISE EXCEPTION 'Cannot remove last owner from company. Assign another owner first.';
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION org.user_has_company_access(
    p_user_id UUID,
    p_company_id UUID,
    p_required_role org.user_role DEFAULT 'member'
)
RETURNS BOOLEAN AS $
DECLARE
    user_role org.user_role;
    role_hierarchy INTEGER;
    required_hierarchy INTEGER;
BEGIN
    -- Get user's role in the company
    SELECT role INTO user_role
    FROM org.user_companies
    WHERE user_id = p_user_id AND company_id = p_company_id;
    
    -- If user is not a member, return false
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Define role hierarchy (higher number = more permissions)
    role_hierarchy := CASE user_role
        WHEN 'owner' THEN 3
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 1
    END;
    
    required_hierarchy := CASE p_required_role
        WHEN 'owner' THEN 3
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 1
    END;
    
    RETURN role_hierarchy >= required_hierarchy;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- TABLES
-- =========================

-- Companies table
CREATE TABLE IF NOT EXISTS org.companies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    industry            VARCHAR(100),
    stripe_customer_id  VARCHAR(255) UNIQUE,
    website             VARCHAR(500),
    phone               VARCHAR(50),
    address_line1       TEXT,
    address_line2       TEXT,
    city                VARCHAR(100),
    state               VARCHAR(100),
    postal_code         VARCHAR(20),
    country             VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT companies_name_length CHECK (LENGTH(TRIM(name)) >= 1),
    CONSTRAINT companies_website_format CHECK (
        website IS NULL OR website ~* '^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$'
    )
);

-- User companies table
CREATE TABLE IF NOT EXISTS org.user_companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id      UUID NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    role            org.user_role NOT NULL,
    invited_by      UUID REFERENCES auth.users(id),
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (user_id, company_id),
    CONSTRAINT user_companies_self_invite CHECK (user_id != invited_by)
);

-- Company invitations table
CREATE TABLE IF NOT EXISTS org.company_invitations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    role            org.invitation_role NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    used_at         TIMESTAMPTZ,
    invited_by      UUID NOT NULL REFERENCES auth.users(id),
    invited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at     TIMESTAMPTZ,
    
    CONSTRAINT company_invitations_expires_future CHECK (expires_at > invited_at),
    CONSTRAINT company_invitations_used_logic CHECK (
        (is_used = FALSE AND used_at IS NULL AND accepted_at IS NULL) OR 
        (is_used = TRUE AND used_at IS NOT NULL)
    ),
    CONSTRAINT company_invitations_email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    EXCLUDE USING btree (email WITH =, company_id WITH =) WHERE (NOT is_used AND expires_at > NOW())
);

-- Company settings table
CREATE TABLE IF NOT EXISTS org.company_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    setting_key     VARCHAR(100) NOT NULL,
    setting_value   TEXT,
    setting_type    VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (company_id, setting_key),
    CONSTRAINT company_settings_key_format CHECK (setting_key ~* '^[a-z][a-z0-9_]*$')
);

-- Company audit log table
CREATE TABLE IF NOT EXISTS org.company_audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(50),
    resource_id     UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT audit_log_action_format CHECK (action ~* '^[a-z][a-z0-9_]*$')
);

-- =========================
-- TRIGGERS
-- =========================
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_companies_updated_at') THEN
        CREATE TRIGGER update_companies_updated_at 
        BEFORE UPDATE ON org.companies 
        FOR EACH ROW EXECUTE FUNCTION org.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_companies_updated_at') THEN
        CREATE TRIGGER update_user_companies_updated_at 
        BEFORE UPDATE ON org.user_companies 
        FOR EACH ROW EXECUTE FUNCTION org.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_settings_updated_at') THEN
        CREATE TRIGGER update_company_settings_updated_at 
        BEFORE UPDATE ON org.company_settings 
        FOR EACH ROW EXECUTE FUNCTION org.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ensure_company_owner_trigger') THEN
        CREATE TRIGGER ensure_company_owner_trigger 
        BEFORE UPDATE OR DELETE ON org.user_companies 
        FOR EACH ROW EXECUTE FUNCTION org.ensure_company_owner();
    END IF;
END$;

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_companies_name ON org.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer ON org.companies(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_industry ON org.companies(industry) WHERE industry IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON org.user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON org.user_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_role_company ON org.user_companies(company_id, role);
CREATE INDEX IF NOT EXISTS idx_user_companies_invited_by ON org.user_companies(invited_by) WHERE invited_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_company_invitations_token ON org.company_invitations(token);
CREATE INDEX IF NOT EXISTS idx_company_invitations_email ON org.company_invitations(email);
CREATE INDEX IF NOT EXISTS idx_company_invitations_company_id ON org.company_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_invitations_expires ON org.company_invitations(expires_at) WHERE NOT is_used;
CREATE INDEX IF NOT EXISTS idx_company_invitations_invited_by ON org.company_invitations(invited_by);

CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON org.company_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_key ON org.company_settings(setting_key);

CREATE INDEX IF NOT EXISTS idx_company_audit_log_company_id ON org.company_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_company_audit_log_user_id ON org.company_audit_log(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_company_audit_log_action ON org.company_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_company_audit_log_created_at ON org.company_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_company_audit_log_resource ON org.company_audit_log(resource_type, resource_id) WHERE resource_type IS NOT NULL;