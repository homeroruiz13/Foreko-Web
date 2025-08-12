# Foreko Database Integration

This document outlines the integration of the custom-frontend with the new comprehensive Foreko database schema.

## Overview

The frontend has been updated to work with the new Foreko database schema structure which includes:
- `auth.*` - Authentication and security
- `org.*` - Organization management  
- `subscriptions.*` - Subscription and billing
- `billing.*` - Payment processing
- `monitoring.*` - API monitoring and analytics
- `config.*` - Configuration and feature flags

## Schema Mapping

### Authentication Schema (`auth.*`)
- **auth.users** - User accounts with status management
- **auth.sessions** - Secure session tracking
- **auth.tokens** - Email verification and password reset tokens
- **auth.providers** - OAuth provider integration

### Organization Schema (`org.*`)
- **org.companies** - Multi-tenant company structure
- **org.user_companies** - Role-based team membership
- **org.invitations** - Team invitation system
- **org.settings** - Company configuration
- **org.audit_log** - Activity tracking

### Subscriptions Schema (`subscriptions.*`)
- **subscriptions.subscription_plans** - Plan configuration
- **subscriptions.subscriptions** - Active subscriptions
- **subscriptions.usage** - Usage metrics
- **subscriptions.events** - Subscription events

### Billing Schema (`billing.*`)
- **billing.payment_methods** - Stripe payment methods
- **billing.invoices** - Invoice management
- **billing.transactions** - Payment history
- **billing.events** - Stripe webhook events

### Monitoring Schema (`monitoring.*`)
- **monitoring.api_requests** - API call tracking
- **monitoring.error_logs** - Error tracking
- **monitoring.performance_metrics** - Performance data
- **monitoring.system_metrics** - System health

### Configuration Schema (`config.*`)
- **config.feature_flags** - Feature toggles
- **config.system_settings** - App configuration
- **config.rate_limits** - API rate limiting
- **config.webhooks** - Webhook management

## New Features Added

### 1. Enhanced Security
- Security event logging for all authentication activities
- Suspicious activity detection
- Rate limiting integration
- Row-level security (RLS) support

### 2. Monitoring & Analytics
- API request tracking with performance metrics
- Error logging with severity levels
- System health monitoring
- Database performance tracking

### 3. Configuration Management
- Feature flags for gradual rollouts
- System-wide settings management
- Webhook system for integrations
- Rate limiting configuration

### 4. Advanced Authentication
- Session-based authentication with automatic cleanup
- Enhanced token management
- Security event auditing
- Multi-factor authentication ready

## Usage Examples

### Feature Flags
```typescript
import { ConfigModel } from '@/lib/models/config';

// Check if a feature is enabled for a user
const isEnabled = await ConfigModel.isFeatureEnabled('new_dashboard', userId, companyId);

if (isEnabled) {
  // Show new dashboard
}
```

### Security Logging
```typescript
import { SecurityUtils } from '@/lib/utils/security';

// Log security events
await SecurityUtils.logSecurityEvent(
  userId, 
  companyId, 
  SecurityUtils.SecurityEvents.LOGIN_SUCCESS,
  { method: 'password' },
  ipAddress
);
```

### API Monitoring
```typescript
import { MonitoringModel } from '@/lib/models/monitoring';

// Log API requests (done automatically via middleware)
await MonitoringModel.logAPIRequest({
  company_id: companyId,
  user_id: userId,
  endpoint: '/api/users',
  method: 'GET',
  status_code: 200,
  response_time_ms: 150
});
```

### System Configuration
```typescript
import { ConfigModel } from '@/lib/models/config';

// Get system settings
const maxFileSize = await ConfigModel.getSystemSettingValue('max_file_size_mb');

// Set system settings
await ConfigModel.setSystemSetting('max_file_size_mb', 100, 'number', 'Maximum file upload size in MB');
```

## Database Functions Available

### Utility Functions
- `public.cleanup_expired_tokens()` - Clean up expired sessions and tokens
- `public.get_database_health()` - Get database health metrics
- `public.run_scheduled_maintenance()` - Run maintenance tasks

### Security Functions
- `auth.log_security_event()` - Log security events
- `auth.check_suspicious_activity()` - Check for suspicious patterns
- `auth.check_rate_limit()` - Rate limit validation
- `org.user_has_company_access()` - Permission validation

## Migration Notes

### Breaking Changes
- Schema names have changed from `authentication.*` to `auth.*`
- Schema names have changed from `organization.*` to `org.*`
- Token tables have been consolidated into `auth.tokens`
- Session management is now in `auth.sessions`

### New Dependencies
- Added monitoring capabilities
- Added configuration management
- Enhanced security logging
- Row-level security integration

## Environment Variables

Make sure these environment variables are set:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database_name

# JWT (for backward compatibility)
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Testing the Integration

1. **Database Connection Test**: Verify all schemas are accessible
2. **Authentication Flow**: Test signup, login, logout with security logging
3. **Feature Flags**: Test feature flag evaluation
4. **Monitoring**: Verify API request logging
5. **Rate Limiting**: Test rate limit enforcement
6. **Webhooks**: Test webhook delivery tracking

## Maintenance

### Regular Tasks
- Clean up expired tokens: `SELECT * FROM public.cleanup_expired_tokens();`
- Database health check: `SELECT * FROM public.get_database_health();`
- Update table statistics: `SELECT public.update_table_statistics();`

### Monitoring
- Check API performance: Query `monitoring.api_requests` for metrics
- Review error logs: Query `monitoring.error_logs` for issues
- System health: Query `monitoring.system_metrics` for health data

## Support

For issues related to the Foreko database integration:
1. Check the database connection and schema availability
2. Verify all required environment variables are set
3. Check the application logs for detailed error messages
4. Review the monitoring and error logs in the database