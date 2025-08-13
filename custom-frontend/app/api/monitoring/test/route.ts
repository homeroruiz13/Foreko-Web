import { NextRequest, NextResponse } from 'next/server';
import { MonitoringService } from '@/lib/monitoring';
import { withMonitoring } from '@/lib/middleware/monitoring';

async function handleMonitoringTest(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'all';

  try {
    const results: any = {};

    if (testType === 'all' || testType === 'system') {
      // Test System Metrics
      await MonitoringService.recordSystemMetric({
        metric_name: 'cpu_usage',
        metric_value: Math.random() * 100,
        metric_unit: 'percent',
        tags: {
          server: 'web-01',
          environment: 'production',
          test: true
        }
      });

      await MonitoringService.recordSystemMetric({
        metric_name: 'memory_usage',
        metric_value: Math.random() * 8192,
        metric_unit: 'mb',
        tags: {
          server: 'web-01',
          environment: 'production',
          test: true
        }
      });

      await MonitoringService.recordSystemMetric({
        metric_name: 'active_users',
        metric_value: Math.floor(Math.random() * 500),
        metric_unit: 'count',
        tags: {
          source: 'session_tracker',
          test: true
        }
      });

      results.system_metrics = 'recorded';
    }

    if (testType === 'all' || testType === 'error') {
      // Test Error Logging
      await MonitoringService.logError({
        error_type: 'validation_error',
        error_message: 'Test validation error for monitoring',
        stack_trace: 'Error\n    at testFunction (/app/test.js:10:15)\n    at Object.handleRequest (/app/handler.js:25:8)',
        context: {
          endpoint: '/api/monitoring/test',
          test_parameter: testType,
          user_action: 'monitoring_test'
        },
        severity: 'warning'
      });

      await MonitoringService.logError({
        error_type: 'database_error',
        error_message: 'Test database connection timeout',
        context: {
          query: 'SELECT * FROM test_table',
          timeout_ms: 5000,
          connection_pool: 'primary'
        },
        severity: 'error'
      });

      await MonitoringService.logError({
        error_type: 'external_api_error',
        error_message: 'Third-party service unavailable',
        context: {
          service: 'payment_gateway',
          status_code: 503,
          retry_count: 3
        },
        severity: 'critical'
      });

      results.error_logs = 'recorded';
    }

    if (testType === 'all' || testType === 'performance') {
      // Test Performance Metrics
      const operations = [
        { name: 'database_query', duration: 50 + Math.random() * 200, success: true },
        { name: 'external_api_call', duration: 100 + Math.random() * 500, success: Math.random() > 0.1 },
        { name: 'file_processing', duration: 200 + Math.random() * 1000, success: Math.random() > 0.05 },
        { name: 'email_sending', duration: 300 + Math.random() * 700, success: Math.random() > 0.02 }
      ];

      for (const op of operations) {
        await MonitoringService.recordPerformance({
          operation_name: op.name,
          duration_ms: Math.round(op.duration),
          success: op.success,
          metadata: {
            test: true,
            timestamp: new Date().toISOString(),
            operation_id: Math.random().toString(36).substr(2, 9)
          }
        });
      }

      results.performance_metrics = 'recorded';
    }

    if (testType === 'all' || testType === 'database') {
      // Test Database Health Monitoring
      const healthMetrics = [
        { name: 'connection_count', value: 25, status: 'healthy' as const },
        { name: 'query_response_time', value: 85, status: 'warning' as const },
        { name: 'cpu_usage', value: 45, status: 'healthy' as const },
        { name: 'memory_usage', value: 92, status: 'critical' as const },
        { name: 'disk_usage', value: 78, status: 'warning' as const }
      ];

      for (const metric of healthMetrics) {
        await MonitoringService.recordDatabaseHealth(
          metric.name,
          metric.value,
          metric.status,
          metric.name === 'query_response_time' ? 100 : undefined,
          metric.name === 'memory_usage' ? 90 : undefined
        );
      }

      results.database_health = 'recorded';
    }

    const responseTime = Date.now() - startTime;

    // Record this test operation as a performance metric
    await MonitoringService.recordPerformance({
      operation_name: 'monitoring_test',
      duration_ms: responseTime,
      success: true,
      metadata: {
        test_type: testType,
        results: Object.keys(results)
      }
    });

    return NextResponse.json({
      message: 'Monitoring test completed successfully',
      test_type: testType,
      response_time_ms: responseTime,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Monitoring test error:', error);
    
    // Log this error
    await MonitoringService.logError({
      error_type: 'monitoring_test_error',
      error_message: error instanceof Error ? error.message : 'Unknown test error',
      stack_trace: error instanceof Error ? error.stack : undefined,
      context: {
        test_type: testType,
        endpoint: '/api/monitoring/test'
      },
      severity: 'error'
    });

    return NextResponse.json(
      { 
        error: 'Monitoring test failed',
        test_type: testType,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export wrapped with monitoring
export const GET = withMonitoring(handleMonitoringTest);