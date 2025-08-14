import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/lib/org-service';
import { getServerSideUserWithSession } from '@/lib/auth-session';
import { withMonitoring } from '@/lib/middleware/monitoring';

async function handleCompanyAudit(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerSideUserWithSession();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const companyId = params.id;

  // Check if user has admin access to view audit logs
  const hasAccess = await OrganizationService.checkUserAccess(user.id, companyId, 'admin');
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  if (request.method === 'GET') {
    try {
      const { searchParams } = new URL(request.url);
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
      const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

      const auditLog = await OrganizationService.getAuditLog(companyId, limit, offset);
      
      return NextResponse.json({
        audit_log: auditLog,
        count: auditLog.length,
        limit,
        offset
      });

    } catch (error) {
      console.error('Get audit log error:', error);
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

export const GET = withMonitoring(handleCompanyAudit);