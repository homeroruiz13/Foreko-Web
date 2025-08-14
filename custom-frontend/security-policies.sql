-- =========================
-- SECURITY POLICIES - STANDALONE
-- =========================
-- Row-level security policies and security enhancement functions
-- This file can be run independently after all schemas are created

-- =========================
-- HELPER FUNCTIONS FOR RLS
-- =========================

-- Function to get current user ID from session
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
    -- This function should be implemented based on your authentication system
    -- Example implementations:
    -- 1. JWT token: RETURN current_setting('app.current_user_id', true)::UUID;
    -- 2. Session table: SELECT user_id FROM auth.user_sessions WHERE session_token = current_setting('app.session_token');
    -- 3. Direct setting: RETURN current_setting('app.current_user_id', true)::UUID;
    
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user belongs to company
CREATE OR REPLACE FUNCTION auth.user_belongs_to_company(p_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM org.user_companies 
        WHERE user_id = auth.current_user_id() 
        AND company_id = p_company_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has minimum role in company
CREATE OR REPLACE FUNCTION auth.user_has_role_in_company(
    p_company_id UUID, 
    p_min_role org.user_role
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role org.user_role;
    role_level INTEGER;
    min_role_level INTEGER;
BEGIN
    -- Get user's role in the company
    SELECT role INTO user_role
    FROM org.user_companies
    WHERE user_id = auth.current_user_id() 
    AND company_id = p_company_id;
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Define role hierarchy
    role_level := CASE user_role
        WHEN 'owner' THEN 3
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 1
    END;
    
    min_role_level := CASE p_min_role
        WHEN 'owner' THEN 3
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 1
    END;
    
    RETURN role_level >= min_role_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- ENABLE ROW LEVEL SECURITY
-- =========================

-- Organization tables
ALTER TABLE org.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE org.user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE org.company_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE org.company_audit_log ENABLE ROW LEVEL SECURITY;

-- Subscription tables
ALTER TABLE subscriptions.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions.subscription_events ENABLE ROW LEVEL SECURITY;

-- Billing tables
ALTER TABLE billing.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Monitoring tables (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'monitoring' AND table_name = 'api_requests') THEN
        ALTER TABLE monitoring.api_requests ENABLE ROW LEVEL SECURITY;
        ALTER TABLE monitoring.error_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE monitoring.performance_metrics ENABLE ROW LEVEL SECURITY;
    END IF;
END$$;

-- Configuration tables (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'config' AND table_name = 'rate_limits') THEN
        ALTER TABLE config.rate_limits ENABLE ROW LEVEL SECURITY;
        ALTER TABLE config.webhooks ENABLE ROW LEVEL SECURITY;
        ALTER TABLE config.webhook_deliveries ENABLE ROW LEVEL SECURITY;
        ALTER TABLE config.email_templates ENABLE ROW LEVEL SECURITY;
        ALTER TABLE config.notification_settings ENABLE ROW LEVEL SECURITY;
    END IF;
END$$;

-- =========================
-- ORGANIZATION POLICIES
-- =========================

-- Companies: Users can only see companies they belong to
CREATE POLICY companies_user_access ON org.companies
    FOR ALL USING (auth.user_belongs_to_company(id));

-- User companies: Users can see their own memberships + admins can see company memberships
CREATE POLICY user_companies_access ON org.user_companies
    FOR ALL USING (
        user_id = auth.current_user_id() OR 
        auth.user_has_role_in_company(company_id, 'admin')
    );

-- Company invitations: Admins+ can manage, invitees can see their own
CREATE POLICY company_invitations_admin_access ON org.company_invitations
    FOR ALL USING (
        auth.user_has_role_in_company(company_id, 'admin') OR
        (email = (SELECT email FROM auth.users WHERE id = auth.current_user_id()))
    );

-- Company settings: Members can read, admins+ can modify
CREATE POLICY company_settings_read ON org.company_settings
    FOR SELECT USING (auth.user_belongs_to_company(company_id));

CREATE POLICY company_settings_modify ON org.company_settings
    FOR INSERT, UPDATE, DELETE USING (auth.user_has_role_in_company(company_id, 'admin'));

-- Audit logs: Members can read their company's logs
CREATE POLICY company_audit_log_access ON org.company_audit_log
    FOR SELECT USING (auth.user_belongs_to_company(company_id));

-- =========================
-- SUBSCRIPTION POLICIES
-- =========================

-- Subscriptions: Company-based access
CREATE POLICY subscriptions_company_access ON subscriptions.subscriptions
    FOR ALL USING (auth.user_belongs_to_company(company_id));

-- Subscription usage: Through subscription relationship
CREATE POLICY subscription_usage_company_access ON subscriptions.subscription_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM subscriptions.subscriptions s 
            WHERE s.id = subscription_id 
            AND auth.user_belongs_to_company(s.company_id)
        )
    );

-- Subscription events: Through subscription relationship
CREATE POLICY subscription_events_company_access ON subscriptions.subscription_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM subscriptions.subscriptions s 
            WHERE s.id = subscription_id 
            AND auth.user_belongs_to_company(s.company_id)
        )
    );

-- =========================
-- BILLING POLICIES
-- =========================

-- Payment methods: Admins+ can manage
CREATE POLICY payment_methods_admin_access ON billing.payment_methods
    FOR ALL USING (auth.user_has_role_in_company(company_id, 'admin'));

-- Invoices: Members can read, admins+ can manage
CREATE POLICY invoices_read ON billing.invoices
    FOR SELECT USING (auth.user_belongs_to_company(company_id));

CREATE POLICY invoices_modify ON billing.invoices
    FOR INSERT, UPDATE, DELETE USING (auth.user_has_role_in_company(company_id, 'admin'));

-- Payment transactions: Members can read, admins+ can manage
CREATE POLICY payment_transactions_read ON billing.payment_transactions
    FOR SELECT USING (auth.user_belongs_to_company(company_id));

CREATE POLICY payment_transactions_modify ON billing.payment_transactions
    FOR INSERT, UPDATE, DELETE USING (auth.user_has_role_in_company(company_id, 'admin'));

-- =========================
-- MONITORING POLICIES (if tables exist)
-- =========================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'monitoring' AND table_name = 'api_requests') THEN
        -- API requests: Users can see their own, admins can see company data
        EXECUTE 'CREATE POLICY api_requests_access ON monitoring.api_requests
            FOR SELECT USING (
                user_id = auth.current_user_id() OR
                (company_id IS NOT NULL AND auth.user_has_role_in_company(company_id, ''admin''))
            )';

        -- Error logs: Similar access pattern
        EXECUTE 'CREATE POLICY error_logs_access ON monitoring.error_logs
            FOR SELECT USING (
                user_id = auth.current_user_id() OR
                (company_id IS NOT NULL AND auth.user_has_role_in_company(company_id, ''admin''))
            )';

        -- Performance metrics: Admins can see company metrics
        EXECUTE 'CREATE POLICY performance_metrics_access ON monitoring.performance_metrics
            FOR SELECT USING (
                company_id IS NULL OR auth.user_has_role_in_company(company_id, ''admin'')
            )';
    END IF;
END$$;

-- =========================
-- CONFIGURATION POLICIES (if tables exist)
-- =========================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'config' AND table_name = 'rate_limits') THEN
        -- Rate limits: Admins+ can manage
        EXECUTE 'CREATE POLICY rate_limits_admin_access ON config.rate_limits
            FOR ALL USING (
                company_id IS NULL OR auth.user_has_role_in_company(company_id, ''admin'')
            )';

        -- Webhooks: Admins+ can manage
        EXECUTE 'CREATE POLICY webhooks_admin_access ON config.webhooks
            FOR ALL USING (auth.user_has_role_in_company(company_id, ''admin''))';

        -- Webhook deliveries: Read-only for admins+
        EXECUTE 'CREATE POLICY webhook_deliveries_read ON config.webhook_deliveries
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM config.webhooks w 
                    WHERE w.id = webhook_id 
                    AND auth.user_has_role_in_company(w.company_id, ''admin'')
                )
            )';

        -- Email templates: Members can read, admins+ can modify
        EXECUTE 'CREATE POLICY email_templates_read ON config.email_templates
            FOR SELECT USING (
                company_id IS NULL OR 
                auth.user_belongs_to_company(company_id)
            )';

        EXECUTE 'CREATE POLICY email_templates_modify ON config.email_templates
            FOR INSERT, UPDATE, DELETE USING (
                company_id IS NULL OR 
                auth.user_has_role_in_company(company_id, ''admin'')
            )';

        -- Notification settings: Users can manage their own settings
        EXECUTE 'CREATE POLICY notification_settings_user_access ON config.notification_settings
            FOR ALL USING (
                user_id = auth.current_user_id() OR
                (company_id IS NOT NULL AND auth.user_has_role_in_company(company_id, ''admin''))
            )';
    END IF;
END$$;

-- =========================
-- SECURITY AUDIT TABLE
-- =========================
CREATE TABLE IF NOT EXISTS auth.security_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    company_id      UUID REFERENCES org.companies(id) ON DELETE SET NULL,
    event_type      VARCHAR(100) NOT NULL,
    event_data      JSONB DEFAULT '{}',
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    success         BOOLEAN NOT NULL,
    risk_score      INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT security_events_type_format CHECK (event_type ~* '^[a-z][a-z0-9_]*')
);

-- Security events indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_time ON auth.security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_company_time ON auth.security_events(company_id, created_at DESC) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_type_time ON auth.security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_success ON auth.security_events(success, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON auth.security_events(risk_score DESC, created_at DESC) WHERE risk_score > 50;

-- =========================
-- SECURITY HELPER FUNCTIONS
-- =========================

-- Function to log security events
CREATE OR REPLACE FUNCTION auth.log_security_event(
    p_user_id UUID,
    p_company_id UUID,
    p_event_type VARCHAR(100),
    p_event_data JSONB DEFAULT '{}',
    p_ip_address VARCHAR(45) DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_risk_score INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO auth.security_events (
        user_id, company_id, event_type, event_data, 
        ip_address, user_agent, success, risk_score
    ) VALUES (
        p_user_id, p_company_id, p_event_type, p_event_data,
        p_ip_address, p_user_agent, p_success, p_risk_score
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for suspicious activity
CREATE OR REPLACE FUNCTION auth.check_suspicious_activity(
    p_user_id UUID,
    p_time_window_minutes INTEGER DEFAULT 15
)
RETURNS TABLE(
    failed_logins INTEGER,
    different_ips INTEGER,
    risk_level VARCHAR(20)
) AS $$
DECLARE
    cutoff_time TIMESTAMPTZ;
    failed_count INTEGER;
    ip_count INTEGER;
    risk VARCHAR(20);
BEGIN
    cutoff_time := NOW() - (p_time_window_minutes || ' minutes')::INTERVAL;
    
    -- Count failed login attempts
    SELECT COUNT(*) INTO failed_count
    FROM auth.security_events
    WHERE user_id = p_user_id
    AND event_type = 'login_failed'
    AND created_at > cutoff_time;
    
    -- Count different IP addresses
    SELECT COUNT(DISTINCT ip_address) INTO ip_count
    FROM auth.security_events
    WHERE user_id = p_user_id
    AND created_at > cutoff_time
    AND ip_address IS NOT NULL;
    
    -- Determine risk level
    IF failed_count >= 5 OR ip_count >= 3 THEN
        risk := 'high';
    ELSIF failed_count >= 3 OR ip_count >= 2 THEN
        risk := 'medium';
    ELSE
        risk := 'low';
    END IF;
    
    RETURN QUERY SELECT failed_count, ip_count, risk;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- RATE LIMITING HELPERS
-- =========================

-- Function to check rate limits
CREATE OR REPLACE FUNCTION auth.check_rate_limit(
    p_company_id UUID,
    p_endpoint VARCHAR(255),
    p_time_window VARCHAR(20) DEFAULT 'minute'
)
RETURNS TABLE(
    allowed BOOLEAN,
    current_count INTEGER,
    limit_value INTEGER,
    reset_time TIMESTAMPTZ
) AS $$
DECLARE
    time_interval INTERVAL;
    window_start TIMESTAMPTZ;
    current_requests INTEGER;
    rate_limit INTEGER;
    next_reset TIMESTAMPTZ;
BEGIN
    -- Determine time window
    CASE p_time_window
        WHEN 'minute' THEN 
            time_interval := '1 minute'::INTERVAL;
            window_start := date_trunc('minute', NOW());
        WHEN 'hour' THEN 
            time_interval := '1 hour'::INTERVAL;
            window_start := date_trunc('hour', NOW());
        WHEN 'day' THEN 
            time_interval := '1 day'::INTERVAL;
            window_start := date_trunc('day', NOW());
        ELSE 
            time_interval := '1 minute'::INTERVAL;
            window_start := date_trunc('minute', NOW());
    END CASE;
    
    next_reset := window_start + time_interval;
    
    -- Get rate limit (check if config.rate_limits table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'config' AND table_name = 'rate_limits') THEN
        EXECUTE format('
            SELECT 
                CASE %L
                    WHEN ''minute'' THEN requests_per_minute
                    WHEN ''hour'' THEN requests_per_hour
                    WHEN ''day'' THEN requests_per_day
                    ELSE requests_per_minute
                END
            FROM config.rate_limits
            WHERE (company_id = %L OR company_id IS NULL)
            AND %L ~ endpoint_pattern
            AND is_active = TRUE
            ORDER BY company_id NULLS LAST
            LIMIT 1', 
            p_time_window, p_company_id, p_endpoint
        ) INTO rate_limit;
    END IF;
    
    -- Default rate limit if none found
    rate_limit := COALESCE(rate_limit, 1000);
    
    -- Count current requests (check if monitoring.api_requests table exists)
    current_requests := 0;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'monitoring' AND table_name = 'api_requests') THEN
        EXECUTE format('
            SELECT COUNT(*)
            FROM monitoring.api_requests
            WHERE company_id = %L
            AND endpoint = %L
            AND created_at >= %L
            AND created_at < %L',
            p_company_id, p_endpoint, window_start, next_reset
        ) INTO current_requests;
    END IF;
    
    RETURN QUERY SELECT 
        (current_requests < rate_limit),
        current_requests,
        rate_limit,
        next_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;