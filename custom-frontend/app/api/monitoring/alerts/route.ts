import { NextRequest, NextResponse } from 'next/server';
import { MonitoringService, AlertRule } from '@/lib/monitoring';
import { getServerSideUserWithSession } from '@/lib/auth-session';

// GET /api/monitoring/alerts - Get all alert rules
export async function GET(request: NextRequest) {
  try {
    const user = await getServerSideUserWithSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const alertRules = await MonitoringService.getAlertRules(activeOnly);

    return NextResponse.json({
      alert_rules: alertRules,
      count: alertRules.length,
      active_only: activeOnly
    });

  } catch (error) {
    console.error('Get alert rules error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/monitoring/alerts - Create new alert rule
export async function POST(request: NextRequest) {
  try {
    const user = await getServerSideUserWithSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      metric_name,
      condition_type,
      threshold_value,
      severity,
      is_active,
      notification_channels
    } = body;

    // Validation
    if (!name || !metric_name || !condition_type || threshold_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, metric_name, condition_type, threshold_value' },
        { status: 400 }
      );
    }

    const validConditions = ['greater_than', 'less_than', 'equals', 'not_equals'];
    if (!validConditions.includes(condition_type)) {
      return NextResponse.json(
        { error: 'Invalid condition_type. Must be one of: ' + validConditions.join(', ') },
        { status: 400 }
      );
    }

    const validSeverities = ['info', 'warning', 'critical'];
    if (severity && !validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity. Must be one of: ' + validSeverities.join(', ') },
        { status: 400 }
      );
    }

    const alertRule: AlertRule = {
      name,
      description,
      metric_name,
      condition_type,
      threshold_value: parseFloat(threshold_value),
      severity: severity || 'warning',
      is_active: is_active !== false,
      notification_channels: notification_channels || []
    };

    const alertId = await MonitoringService.createAlertRule(alertRule);

    return NextResponse.json({
      message: 'Alert rule created successfully',
      alert_id: alertId,
      alert_rule: { ...alertRule, id: alertId }
    }, { status: 201 });

  } catch (error) {
    console.error('Create alert rule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/monitoring/alerts - Update alert rule
export async function PUT(request: NextRequest) {
  try {
    const user = await getServerSideUserWithSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Alert rule ID is required' },
        { status: 400 }
      );
    }

    // Validate condition_type if provided
    if (updates.condition_type) {
      const validConditions = ['greater_than', 'less_than', 'equals', 'not_equals'];
      if (!validConditions.includes(updates.condition_type)) {
        return NextResponse.json(
          { error: 'Invalid condition_type' },
          { status: 400 }
        );
      }
    }

    // Validate severity if provided
    if (updates.severity) {
      const validSeverities = ['info', 'warning', 'critical'];
      if (!validSeverities.includes(updates.severity)) {
        return NextResponse.json(
          { error: 'Invalid severity' },
          { status: 400 }
        );
      }
    }

    // Convert threshold_value to number if provided
    if (updates.threshold_value !== undefined) {
      updates.threshold_value = parseFloat(updates.threshold_value);
    }

    await MonitoringService.updateAlertRule(id, updates);

    return NextResponse.json({
      message: 'Alert rule updated successfully',
      alert_id: id
    });

  } catch (error) {
    console.error('Update alert rule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/monitoring/alerts - Delete alert rule  
export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerSideUserWithSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Alert rule ID is required' },
        { status: 400 }
      );
    }

    await MonitoringService.deleteAlertRule(id);

    return NextResponse.json({
      message: 'Alert rule deleted successfully',
      alert_id: id
    });

  } catch (error) {
    console.error('Delete alert rule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}