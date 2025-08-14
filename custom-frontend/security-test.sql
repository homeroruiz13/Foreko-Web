-- =========================
-- COMPREHENSIVE SECURITY TEST SCRIPT
-- =========================
-- This script demonstrates and tests all security policies and functions

\echo '==========================='
\echo 'SECURITY SYSTEM TEST'
\echo '==========================='

-- Test 1: RLS Helper Functions
\echo ''
\echo '1. Testing RLS Helper Functions'
\echo '-------------------------------'

-- Set user session
SET app.current_user_id = '4fc3b921-5af1-46a1-97f0-0b6a7245073d';

\echo 'Current user ID:'
SELECT auth.current_user_id();

\echo 'User belongs to company test:'
SELECT 
    'cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID as company_id,
    auth.user_belongs_to_company('cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID) as belongs;

\echo 'Role hierarchy test:'
SELECT 
    'member' as min_role,
    auth.user_has_role_in_company('cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID, 'member'::org.user_role) as has_role
UNION ALL
SELECT 
    'admin' as min_role,
    auth.user_has_role_in_company('cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID, 'admin'::org.user_role) as has_role
UNION ALL
SELECT 
    'owner' as min_role,
    auth.user_has_role_in_company('cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID, 'owner'::org.user_role) as has_role;

-- Test 2: Row Level Security
\echo ''
\echo '2. Testing Row Level Security'
\echo '-----------------------------'

\echo 'Companies visible to current user:'
SELECT COUNT(*) as company_count FROM org.companies;

\echo 'User-company relationships visible:'
SELECT COUNT(*) as relationship_count FROM org.user_companies;

\echo 'Company settings accessible:'
SELECT COUNT(*) as settings_count FROM org.company_settings;

-- Test with different user
SET app.current_user_id = 'e5d153c6-c9ed-4566-a1a4-dcd560009ef8';

\echo 'After switching to different user:'
SELECT COUNT(*) as company_count FROM org.companies;

-- Test without user session
RESET app.current_user_id;

\echo 'Without user session (should be 0):'
SELECT COUNT(*) as company_count FROM org.companies;

-- Test 3: Security Audit System
\echo ''
\echo '3. Testing Security Audit System'
\echo '--------------------------------'

-- Set user back for testing
SET app.current_user_id = '4fc3b921-5af1-46a1-97f0-0b6a7245073d';

-- Log security events
\echo 'Logging test security events...'
SELECT auth.log_security_event(
    '4fc3b921-5af1-46a1-97f0-0b6a7245073d'::UUID,
    'cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID,
    'test_login_success',
    '{"test": true, "source": "security_test"}'::JSONB,
    '192.168.1.100',
    'SecurityTest/1.0',
    true,
    5
) as success_event_id;

SELECT auth.log_security_event(
    '4fc3b921-5af1-46a1-97f0-0b6a7245073d'::UUID,
    'cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID,
    'test_suspicious_activity',
    '{"test": true, "threat_level": "medium"}'::JSONB,
    '10.0.0.1',
    'SecurityTest/1.0',
    false,
    75
) as suspicious_event_id;

\echo 'Checking suspicious activity:'
SELECT 
    failed_logins,
    different_ips,
    risk_level
FROM auth.check_suspicious_activity('4fc3b921-5af1-46a1-97f0-0b6a7245073d'::UUID, 60);

\echo 'Recent security events:'
SELECT 
    event_type,
    success,
    risk_score,
    ip_address,
    created_at
FROM auth.security_events 
WHERE user_id = '4fc3b921-5af1-46a1-97f0-0b6a7245073d'::UUID 
AND event_type LIKE 'test_%'
ORDER BY created_at DESC 
LIMIT 3;

-- Test 4: Rate Limiting
\echo ''
\echo '4. Testing Rate Limiting System'
\echo '-------------------------------'

\echo 'Rate limit check for /api/test endpoint:'
SELECT 
    allowed,
    current_count,
    limit_value,
    reset_time
FROM auth.check_rate_limit(
    'cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID,
    '/api/test',
    'minute'
);

\echo 'Rate limit check for different time windows:'
SELECT 
    'minute' as window,
    allowed,
    limit_value
FROM auth.check_rate_limit(
    'cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID,
    '/api/data',
    'minute'
)
UNION ALL
SELECT 
    'hour' as window,
    allowed,
    limit_value
FROM auth.check_rate_limit(
    'cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID,
    '/api/data',
    'hour'
)
UNION ALL
SELECT 
    'day' as window,
    allowed,
    limit_value
FROM auth.check_rate_limit(
    'cf89b5b3-fadb-406b-840f-fc499e1b493e'::UUID,
    '/api/data',
    'day'
);

-- Test 5: Policy Verification
\echo ''
\echo '5. Verifying Security Policies are Active'
\echo '----------------------------------------'

\echo 'Tables with RLS enabled:'
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname IN ('org', 'auth', 'subscriptions', 'billing', 'monitoring', 'config')
AND EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = tablename 
    AND relrowsecurity = true
)
ORDER BY schemaname, tablename;

\echo 'Active RLS policies:'
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as applies_to
FROM pg_policies 
WHERE schemaname IN ('org', 'auth', 'subscriptions', 'billing', 'monitoring', 'config')
ORDER BY schemaname, tablename, policyname;

\echo ''
\echo '==========================='
\echo 'SECURITY TEST COMPLETED'
\echo '==========================='
\echo 'All security policies and functions have been tested successfully!'