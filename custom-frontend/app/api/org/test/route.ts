import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/lib/org-service';
import { getServerSideUserWithSession } from '@/lib/auth-session';
import { AuditLogger, AuditActions } from '@/lib/audit-middleware';
import { withMonitoring } from '@/lib/middleware/monitoring';

async function handleOrgTest(request: NextRequest) {
  const user = await getServerSideUserWithSession();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'all';
    const results: any = {};

    if (testType === 'all' || testType === 'company') {
      // Test company creation
      const testCompanyId = await OrganizationService.createCompany({
        name: 'Test Organization ' + Date.now(),
        industry: 'Technology',
        website: 'https://test.example.com',
        phone: '+1-555-0123',
        address_line1: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        postal_code: '12345',
        country: 'United States'
      }, user.id);

      // Test company retrieval
      const company = await OrganizationService.getCompany(testCompanyId);

      // Test company update
      await OrganizationService.updateCompany(testCompanyId, {
        industry: 'Software Development'
      });

      results.company = {
        created: testCompanyId,
        retrieved: !!company,
        updated: true
      };
    }

    if (testType === 'all' || testType === 'settings') {
      const companies = await OrganizationService.getUserCompanies(user.id);
      if (companies.length > 0) {
        const companyId = companies[0].id!;

        // Test settings
        await OrganizationService.setSetting(companyId, 'test_setting', 'test_value', 'string');
        await OrganizationService.setSetting(companyId, 'test_number', '42', 'number');
        await OrganizationService.setSetting(companyId, 'test_boolean', 'true', 'boolean');
        await OrganizationService.setSetting(companyId, 'test_json', '{"key": "value"}', 'json');

        const setting = await OrganizationService.getSetting(companyId, 'test_setting');
        const allSettings = await OrganizationService.getSettings(companyId);

        results.settings = {
          created: 4,
          retrieved: !!setting,
          count: allSettings.length
        };
      }
    }

    if (testType === 'all' || testType === 'invitations') {
      const companies = await OrganizationService.getUserCompanies(user.id);
      if (companies.length > 0) {
        const companyId = companies[0].id!;

        // Test invitation creation
        const invitationId = await OrganizationService.createInvitation({
          company_id: companyId,
          email: `test-${Date.now()}@example.com`,
          role: 'member',
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const invitations = await OrganizationService.getCompanyInvitations(companyId);

        results.invitations = {
          created: invitationId,
          count: invitations.length
        };
      }
    }

    if (testType === 'all' || testType === 'audit') {
      const companies = await OrganizationService.getUserCompanies(user.id);
      if (companies.length > 0) {
        const companyId = companies[0].id!;

        // Test audit logging
        await AuditLogger.logCompanyAction(
          companyId,
          AuditActions.COMPANY_UPDATED,
          { test: 'new_value' },
          { test: 'old_value' },
          request
        );

        await AuditLogger.logGenericAction(
          companyId,
          'test_action',
          'test_resource',
          'test_id',
          { test_data: 'test_value' },
          request
        );

        const auditLog = await OrganizationService.getAuditLog(companyId, 10);

        results.audit = {
          logged: 2,
          retrieved: auditLog.length
        };
      }
    }

    if (testType === 'all' || testType === 'permissions') {
      const companies = await OrganizationService.getUserCompanies(user.id);
      if (companies.length > 0) {
        const companyId = companies[0].id!;
        const userRole = await OrganizationService.getUserRole(user.id, companyId);
        
        const hasOwnerAccess = await OrganizationService.checkUserAccess(user.id, companyId, 'owner');
        const hasAdminAccess = await OrganizationService.checkUserAccess(user.id, companyId, 'admin');
        const hasMemberAccess = await OrganizationService.checkUserAccess(user.id, companyId, 'member');

        results.permissions = {
          role: userRole,
          owner_access: hasOwnerAccess,
          admin_access: hasAdminAccess,
          member_access: hasMemberAccess
        };
      }
    }

    if (testType === 'all' || testType === 'members') {
      const companies = await OrganizationService.getUserCompanies(user.id);
      if (companies.length > 0) {
        const companyId = companies[0].id!;
        const members = await OrganizationService.getCompanyMembers(companyId);

        results.members = {
          count: members.length,
          current_user_included: members.some(m => m.user_id === user.id)
        };
      }
    }

    return NextResponse.json({
      message: 'Organization test completed',
      test_type: testType,
      user_id: user.id,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Organization test error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const GET = withMonitoring(handleOrgTest);