import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/lib/org-service';
import { getServerSideUserWithSession } from '@/lib/auth-session';
import { withMonitoring } from '@/lib/middleware/monitoring';

async function handleCompanyInvitations(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerSideUserWithSession();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const companyId = params.id;

  // Check if user has admin access to this company
  const hasAccess = await OrganizationService.checkUserAccess(user.id, companyId, 'admin');
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  if (request.method === 'GET') {
    try {
      const invitations = await OrganizationService.getCompanyInvitations(companyId);
      
      return NextResponse.json({
        invitations,
        count: invitations.length
      });

    } catch (error) {
      console.error('Get invitations error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { email, role } = body;

      if (!email || !role) {
        return NextResponse.json(
          { error: 'Email and role are required' },
          { status: 400 }
        );
      }

      const validRoles = ['admin', 'member'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be admin or member' },
          { status: 400 }
        );
      }

      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      const invitationId = await OrganizationService.createInvitation({
        company_id: companyId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Log invitation creation
      await OrganizationService.logAuditEvent({
        company_id: companyId,
        user_id: user.id,
        action: 'invitation_created',
        resource_type: 'invitation',
        resource_id: invitationId,
        new_values: { email, role }
      });

      return NextResponse.json({
        message: 'Invitation sent successfully',
        invitation_id: invitationId
      }, { status: 201 });

    } catch (error) {
      console.error('Create invitation error:', error);
      
      if (error instanceof Error && error.message?.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'User is already invited or is a member of this company' },
          { status: 409 }
        );
      }

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

export const GET = withMonitoring(handleCompanyInvitations);
export const POST = withMonitoring(handleCompanyInvitations);