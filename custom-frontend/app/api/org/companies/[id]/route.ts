import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/lib/org-service';
import { getServerSideUserWithSession } from '@/lib/auth-session';
import { withMonitoring } from '@/lib/middleware/monitoring';

async function handleCompanyById(request: NextRequest, { params }: { params: { id: string } }) {
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
      const company = await OrganizationService.getCompany(companyId);
      
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ company });

    } catch (error) {
      console.error('Get company error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'PUT') {
    // Require admin access for updates
    const hasAdminAccess = await OrganizationService.checkUserAccess(user.id, companyId, 'admin');
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    try {
      const body = await request.json();
      const { name, industry, website, phone, address } = body;

      const currentCompany = await OrganizationService.getCompany(companyId);
      if (!currentCompany) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      const updates = {
        ...(name && name.trim() && { name: name.trim() }),
        ...(industry !== undefined && { industry }),
        ...(website !== undefined && { website }),
        ...(phone !== undefined && { phone }),
        ...(address?.line1 !== undefined && { address_line1: address.line1 }),
        ...(address?.line2 !== undefined && { address_line2: address.line2 }),
        ...(address?.city !== undefined && { city: address.city }),
        ...(address?.state !== undefined && { state: address.state }),
        ...(address?.postal_code !== undefined && { postal_code: address.postal_code }),
        ...(address?.country !== undefined && { country: address.country })
      };

      if (Object.keys(updates).length === 0) {
        return NextResponse.json(
          { error: 'No valid updates provided' },
          { status: 400 }
        );
      }

      await OrganizationService.updateCompany(companyId, updates);

      // Log company update
      await OrganizationService.logAuditEvent({
        company_id: companyId,
        user_id: user.id,
        action: 'company_updated',
        resource_type: 'company',
        resource_id: companyId,
        old_values: currentCompany,
        new_values: updates
      });

      return NextResponse.json({
        message: 'Company updated successfully'
      });

    } catch (error) {
      console.error('Update company error:', error);
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

export const GET = withMonitoring(handleCompanyById);
export const PUT = withMonitoring(handleCompanyById);