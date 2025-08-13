import { NextRequest, NextResponse } from 'next/server';
import { MonitoringService } from '@/lib/monitoring';
import { getServerSideUserWithSession } from '@/lib/auth-session';

// POST /api/monitoring/alerts/evaluate - Evaluate all active alert rules
export async function POST(request: NextRequest) {
  try {
    const user = await getServerSideUserWithSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const triggeredAlerts = await MonitoringService.evaluateAlertRules();

    return NextResponse.json({
      message: 'Alert rules evaluation completed',
      triggered_alerts: triggeredAlerts,
      count: triggeredAlerts.length,
      evaluated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Evaluate alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}