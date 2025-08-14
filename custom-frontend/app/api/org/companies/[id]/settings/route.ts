import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/lib/org-service';
import { getServerSideUserWithSession } from '@/lib/auth-session';
import { withMonitoring } from '@/lib/middleware/monitoring';

async function handleCompanySettings(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerSideUserWithSession();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const companyId = params.id;

  // Check if user has access to this company
  const hasAccess = await OrganizationService.checkUserAccess(user.id, companyId, 'member');
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  if (request.method === 'GET') {
    try {
      const settings = await OrganizationService.getSettings(companyId);
      
      return NextResponse.json({
        settings,
        count: settings.length
      });

    } catch (error) {
      console.error('Get settings error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'POST') {
    // Require admin access for setting updates
    const hasAdminAccess = await OrganizationService.checkUserAccess(user.id, companyId, 'admin');
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    try {
      const body = await request.json();
      const { key, value, type } = body;

      if (!key || value === undefined) {
        return NextResponse.json(
          { error: 'Setting key and value are required' },
          { status: 400 }
        );
      }

      const validTypes = ['string', 'number', 'boolean', 'json'];
      const settingType = type || 'string';
      
      if (!validTypes.includes(settingType)) {
        return NextResponse.json(
          { error: 'Invalid setting type' },
          { status: 400 }
        );
      }

      // Validate key format
      if (!/^[a-z][a-z0-9_]*$/.test(key)) {
        return NextResponse.json(
          { error: 'Setting key must start with lowercase letter and contain only lowercase letters, numbers, and underscores' },
          { status: 400 }
        );
      }

      const oldSetting = await OrganizationService.getSetting(companyId, key);
      await OrganizationService.setSetting(companyId, key, String(value), settingType);

      // Log setting change
      await OrganizationService.logAuditEvent({
        company_id: companyId,
        user_id: user.id,
        action: oldSetting ? 'setting_updated' : 'setting_created',
        resource_type: 'setting',
        resource_id: key,
        old_values: oldSetting || undefined,
        new_values: { key, value, type: settingType }
      });

      return NextResponse.json({
        message: 'Setting saved successfully'
      });

    } catch (error) {
      console.error('Save setting error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export const GET = withMonitoring(handleCompanySettings);
export const POST = withMonitoring(handleCompanySettings);