import { query } from '@/lib/db';

export interface SystemMetric {
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  tags?: Record<string, any>;
  recorded_at?: Date;
}

export interface ApiRequest {
  company_id?: string;
  user_id?: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms?: number;
  ip_address?: string;
  user_agent?: string;
  request_size?: number;
  response_size?: number;
}

export interface ErrorLog {
  company_id?: string;
  user_id?: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  context?: Record<string, any>;
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
}

export interface PerformanceMetric {
  company_id?: string;
  operation_name: string;
  duration_ms: number;
  success: boolean;
  metadata?: Record<string, any>;
  recorded_at?: Date;
}

export class MonitoringService {
  // System Metrics
  static async recordSystemMetric(metric: SystemMetric): Promise<void> {
    try {
      await query(
        `INSERT INTO monitoring.system_metrics (metric_name, metric_value, metric_unit, tags, recorded_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          metric.metric_name,
          metric.metric_value,
          metric.metric_unit || null,
          JSON.stringify(metric.tags || {}),
          metric.recorded_at || new Date()
        ]
      );
    } catch (error) {
      console.error('Failed to record system metric:', error);
    }
  }

  // API Request Tracking
  static async recordApiRequest(request: ApiRequest): Promise<void> {
    try {
      await query(
        `INSERT INTO monitoring.api_requests 
         (company_id, user_id, endpoint, method, status_code, response_time_ms, ip_address, user_agent, request_size, response_size)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          request.company_id || null,
          request.user_id || null,
          request.endpoint,
          request.method,
          request.status_code,
          request.response_time_ms || null,
          request.ip_address || null,
          request.user_agent || null,
          request.request_size || null,
          request.response_size || null
        ]
      );
    } catch (error) {
      console.error('Failed to record API request:', error);
    }
  }

  // Error Logging
  static async logError(error: ErrorLog): Promise<void> {
    try {
      await query(
        `INSERT INTO monitoring.error_logs 
         (company_id, user_id, error_type, error_message, stack_trace, context, severity)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          error.company_id || null,
          error.user_id || null,
          error.error_type,
          error.error_message,
          error.stack_trace || null,
          JSON.stringify(error.context || {}),
          error.severity || 'error'
        ]
      );
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }
  }

  // Performance Monitoring
  static async recordPerformance(metric: PerformanceMetric): Promise<void> {
    try {
      await query(
        `INSERT INTO monitoring.performance_metrics 
         (company_id, operation_name, duration_ms, success, metadata, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          metric.company_id || null,
          metric.operation_name,
          metric.duration_ms,
          metric.success,
          JSON.stringify(metric.metadata || {}),
          metric.recorded_at || new Date()
        ]
      );
    } catch (error) {
      console.error('Failed to record performance metric:', error);
    }
  }

  // Database Health Check
  static async recordDatabaseHealth(
    metricName: string, 
    value: number, 
    status: 'healthy' | 'warning' | 'critical' = 'healthy',
    thresholdWarning?: number,
    thresholdCritical?: number
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO monitoring.database_health 
         (metric_name, metric_value, status, threshold_warning, threshold_critical)
         VALUES ($1, $2, $3, $4, $5)`,
        [metricName, value, status, thresholdWarning || null, thresholdCritical || null]
      );
    } catch (error) {
      console.error('Failed to record database health:', error);
    }
  }

  // Utility Functions
  static async getApiRequestMetrics(timeRange: string = '24h'): Promise<any> {
    try {
      const interval = timeRange === '1h' ? '1 hour' : timeRange === '24h' ? '1 day' : '7 days';
      const result = await query(
        `SELECT 
           endpoint,
           method,
           COUNT(*) as request_count,
           AVG(response_time_ms) as avg_response_time,
           COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
         FROM monitoring.api_requests 
         WHERE created_at > NOW() - INTERVAL '${interval}'
         GROUP BY endpoint, method
         ORDER BY request_count DESC`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Failed to get API request metrics:', error);
      return [];
    }
  }

  static async getErrorMetrics(timeRange: string = '24h'): Promise<any> {
    try {
      const interval = timeRange === '1h' ? '1 hour' : timeRange === '24h' ? '1 day' : '7 days';
      const result = await query(
        `SELECT 
           error_type,
           severity,
           COUNT(*) as error_count,
           COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved_count
         FROM monitoring.error_logs 
         WHERE created_at > NOW() - INTERVAL '${interval}'
         GROUP BY error_type, severity
         ORDER BY error_count DESC`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Failed to get error metrics:', error);
      return [];
    }
  }

  static async getPerformanceMetrics(timeRange: string = '24h'): Promise<any> {
    try {
      const interval = timeRange === '1h' ? '1 hour' : timeRange === '24h' ? '1 day' : '7 days';
      const result = await query(
        `SELECT 
           operation_name,
           AVG(duration_ms) as avg_duration,
           MAX(duration_ms) as max_duration,
           MIN(duration_ms) as min_duration,
           COUNT(*) as operation_count,
           COUNT(CASE WHEN success = true THEN 1 END) as success_count
         FROM monitoring.performance_metrics 
         WHERE recorded_at > NOW() - INTERVAL '${interval}'
         GROUP BY operation_name
         ORDER BY avg_duration DESC`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return [];
    }
  }
}

// Performance tracking decorator/wrapper
export function measurePerformance(operationName: string, userId?: string, companyId?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;
      let error: Error | null = null;

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (err) {
        success = false;
        error = err as Error;
        throw err;
      } finally {
        const duration = Date.now() - startTime;
        
        // Record performance metric
        MonitoringService.recordPerformance({
          company_id: companyId,
          operation_name: `${target.constructor.name}.${operationName}`,
          duration_ms: duration,
          success,
          metadata: {
            args: args.map(arg => typeof arg),
            error: error ? error.message : null
          }
        });

        // Log error if operation failed
        if (!success && error) {
          MonitoringService.logError({
            company_id: companyId,
            user_id: userId,
            error_type: 'operation_failure',
            error_message: error.message,
            stack_trace: error.stack,
            context: {
              operation: `${target.constructor.name}.${operationName}`,
              duration_ms: duration
            },
            severity: 'error'
          });
        }
      }
    };

    return descriptor;
  };
}