import { query, setAppUserId } from '../db';

// Security functions to integrate with Foreko auth schema
export class SecurityUtils {
  // Log security events
  static async logSecurityEvent(
    userId: string | null,
    companyId: string | null,
    eventType: string,
    details: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      await query(
        `SELECT auth.log_security_event($1, $2, $3, $4, $5)`,
        [userId, companyId, eventType, JSON.stringify(details), ipAddress]
      );
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Check for suspicious activity
  static async checkSuspiciousActivity(
    userId: string,
    timeWindowMinutes: number = 15
  ): Promise<boolean> {
    try {
      const result = await query(
        `SELECT * FROM auth.check_suspicious_activity($1, $2)`,
        [userId, timeWindowMinutes]
      );
      return result.rows[0]?.suspicious || false;
    } catch (error) {
      console.error('Failed to check suspicious activity:', error);
      return false;
    }
  }

  // Check rate limits
  static async checkRateLimit(
    companyId: string | null,
    endpoint: string,
    timeWindow: 'minute' | 'hour' | 'day' = 'minute'
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    try {
      const result = await query(
        `SELECT * FROM auth.check_rate_limit($1, $2, $3)`,
        [companyId, endpoint, timeWindow]
      );
      
      const data = result.rows[0];
      return {
        allowed: data?.allowed || false,
        remaining: data?.remaining || 0,
        resetTime: data?.reset_time ? new Date(data.reset_time) : new Date()
      };
    } catch (error) {
      console.error('Failed to check rate limit:', error);
      // Default to allowing the request if rate limiting fails
      return {
        allowed: true,
        remaining: 100,
        resetTime: new Date(Date.now() + 60000) // 1 minute from now
      };
    }
  }

  // Set user context for RLS (Row Level Security)
  static async setUserContext(userId: string | null): Promise<void> {
    try {
      await setAppUserId(userId);
    } catch (error) {
      console.error('Failed to set user context:', error);
    }
  }

  // Validate permissions for company access
  static async validateCompanyAccess(
    userId: string,
    companyId: string,
    requiredRole: 'member' | 'admin' | 'owner' = 'member'
  ): Promise<boolean> {
    try {
      const result = await query(
        `SELECT org.user_has_company_access($1, $2, $3)`,
        [userId, companyId, requiredRole]
      );
      return result.rows[0]?.user_has_company_access || false;
    } catch (error) {
      console.error('Failed to validate company access:', error);
      return false;
    }
  }

  // Clean up expired sessions and tokens
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await query('SELECT * FROM public.cleanup_expired_tokens()');
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error);
    }
  }

  // Get database health metrics
  static async getDatabaseHealth(): Promise<any> {
    try {
      const result = await query('SELECT * FROM public.get_database_health()');
      return result.rows[0] || {};
    } catch (error) {
      console.error('Failed to get database health:', error);
      return {};
    }
  }

  // Run scheduled maintenance
  static async runScheduledMaintenance(): Promise<void> {
    try {
      await query('SELECT * FROM public.run_scheduled_maintenance()');
    } catch (error) {
      console.error('Failed to run scheduled maintenance:', error);
    }
  }

  // Security event types
  static readonly SecurityEvents = {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILURE: 'login_failure',
    LOGOUT: 'logout',
    PASSWORD_RESET_REQUEST: 'password_reset_request',
    PASSWORD_RESET_SUCCESS: 'password_reset_success',
    EMAIL_VERIFICATION: 'email_verification',
    ACCOUNT_LOCKED: 'account_locked',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    PERMISSION_DENIED: 'permission_denied',
    DATA_ACCESS: 'data_access',
    API_KEY_USAGE: 'api_key_usage',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded'
  } as const;
}