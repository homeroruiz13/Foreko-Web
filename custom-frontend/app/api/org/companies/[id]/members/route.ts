import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/lib/org-service';
import { getServerSideUserWithSession } from '@/lib/auth-session';
import { withMonitoring } from '@/lib/middleware/monitoring';

async function handleCompanyMembers(request: NextRequest, { params }: { params: { id: string } }) {
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
      const members = await OrganizationService.getCompanyMembers(companyId);
      
      return NextResponse.json({
        members,
        count: members.length
      });

    } catch (error) {
      console.error('Get members error:', error);
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

export const GET = withMonitoring(handleCompanyMembers);