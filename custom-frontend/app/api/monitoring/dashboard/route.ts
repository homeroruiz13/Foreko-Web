import { NextRequest, NextResponse } from 'next/server';
import { MonitoringService } from '@/lib/monitoring';
import { getServerSideUserWithSession } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated (you might want to add admin role check here)
    const user = await getServerSideUserWithSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Get all monitoring metrics
    const [apiMetrics, errorMetrics, performanceMetrics] = await Promise.all([
      MonitoringService.getApiRequestMetrics(timeRange),
      MonitoringService.getErrorMetrics(timeRange),
      MonitoringService.getPerformanceMetrics(timeRange)
    ]);

    return NextResponse.json({
      timeRange,
      metrics: {
        api: apiMetrics,
        errors: errorMetrics,
        performance: performanceMetrics
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Monitoring dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function POST(request: NextRequest) {
  try {
    const user = await getServerSideUserWithSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Record a test metric
    await MonitoringService.recordSystemMetric({
      metric_name: 'health_check',
      metric_value: 1,
      metric_unit: 'count',
      tags: {
        source: 'dashboard',
        user_id: user.id
      }
    });

    return NextResponse.json({
      message: 'Health check recorded',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}