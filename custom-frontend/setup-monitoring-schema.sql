-- =========================
-- MONITORING SCHEMA - STANDALONE
-- =========================
-- Complete monitoring schema for observability and performance tracking
-- This file can be run independently for monitoring-only deployments
-- Requires: auth and org schemas to exist (for foreign key references)

CREATE SCHEMA IF NOT EXISTS monitoring;

-- =========================
-- TRIGGER FUNCTIONS
-- =========================
CREATE OR REPLACE FUNCTION monitoring.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW IS DISTINCT FROM OLD AND NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at) THEN
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- TABLES
-- =========================

-- System metrics table (Fixed syntax error)
CREATE TABLE IF NOT EXISTS monitoring.system_metrics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name     VARCHAR(100) NOT NULL,
    metric_value    NUMERIC NOT NULL,
    metric_unit     VARCHAR(20),
    tags            JSONB DEFAULT '{}',
    recorded_at     TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT metrics_name_format CHECK (metric_name ~* '^[a-z][a-z0-9_]*$')
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS monitoring.api_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID, -- Made nullable since we don't have org.companies yet
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    endpoint        VARCHAR(255) NOT NULL,
    method          VARCHAR(10) NOT NULL,
    status_code     INTEGER NOT NULL,
    response_time_ms INTEGER,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    request_size    INTEGER,
    response_size   INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT api_requests_method_valid CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')),
    CONSTRAINT api_requests_status_valid CHECK (status_code BETWEEN 100 AND 599),
    CONSTRAINT api_requests_response_time_positive CHECK (response_time_ms IS NULL OR response_time_ms >= 0)
);

-- Error tracking
CREATE TABLE IF NOT EXISTS monitoring.error_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID, -- Made nullable since we don't have org.companies yet
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    error_type      VARCHAR(100) NOT NULL,
    error_message   TEXT NOT NULL,
    stack_trace     TEXT,
    context         JSONB DEFAULT '{}',
    severity        VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    resolved        BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT error_logs_resolved_logic CHECK (
        (resolved = FALSE AND resolved_at IS NULL AND resolved_by IS NULL) OR
        (resolved = TRUE AND resolved_at IS NOT NULL)
    )
);

-- Performance monitoring
CREATE TABLE IF NOT EXISTS monitoring.performance_metrics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID, -- Made nullable since we don't have org.companies yet
    operation_name  VARCHAR(100) NOT NULL,
    duration_ms     INTEGER NOT NULL,
    success         BOOLEAN NOT NULL,
    metadata        JSONB DEFAULT '{}',
    recorded_at     TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT performance_duration_positive CHECK (duration_ms >= 0)
);

-- Database health monitoring
CREATE TABLE IF NOT EXISTS monitoring.database_health (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name     VARCHAR(100) NOT NULL,
    metric_value    NUMERIC NOT NULL,
    status          VARCHAR(20) DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical')),
    threshold_warning NUMERIC,
    threshold_critical NUMERIC,
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Alert rules configuration
CREATE TABLE IF NOT EXISTS monitoring.alert_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    metric_name     VARCHAR(100) NOT NULL,
    condition_type  VARCHAR(20) CHECK (condition_type IN ('greater_than', 'less_than', 'equals', 'not_equals')),
    threshold_value NUMERIC NOT NULL,
    severity        VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    is_active       BOOLEAN DEFAULT TRUE,
    notification_channels TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_time ON monitoring.system_metrics(metric_name, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON monitoring.system_metrics(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_requests_company_time ON monitoring.api_requests(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_requests_endpoint_time ON monitoring.api_requests(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_requests_status_time ON monitoring.api_requests(status_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_requests_user_time ON monitoring.api_requests(user_id, created_at DESC) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_error_logs_company_time ON monitoring.error_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_type_time ON monitoring.error_logs(error_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_time ON monitoring.error_logs(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON monitoring.error_logs(resolved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_company_time ON monitoring.performance_metrics(company_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_operation_time ON monitoring.performance_metrics(operation_name, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_database_health_metric_time ON monitoring.database_health(metric_name, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_database_health_status_time ON monitoring.database_health(status, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON monitoring.alert_rules(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_alert_rules_metric ON monitoring.alert_rules(metric_name);

-- =========================
-- TRIGGERS
-- =========================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_alert_rules_updated_at') THEN
        CREATE TRIGGER update_alert_rules_updated_at
        BEFORE UPDATE ON monitoring.alert_rules
        FOR EACH ROW EXECUTE FUNCTION monitoring.update_updated_at_column();
    END IF;
END$$;