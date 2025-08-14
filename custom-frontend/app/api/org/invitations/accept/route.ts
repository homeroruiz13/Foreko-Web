import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/lib/org-service';
import { getServerSideUserWithSession } from '@/lib/auth-session';
import { withMonitoring } from '@/lib/middleware/monitoring';

async function handleAcceptInvitation(request: NextRequest) {
  const user = await getServerSideUserWithSession();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { token } = body;

      if (!token) {
        return NextResponse.json(
          { error: 'Invitation token is required' },
          { status: 400 }
        );
      }

      // Get invitation details first
      const invitation = await OrganizationService.getInvitation(token);
      if (!invitation) {
        return NextResponse.json(
          { error: 'Invalid or expired invitation' },
          { status: 404 }
        );
      }

      const success = await OrganizationService.acceptInvitation(token, user.id);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to accept invitation. It may be invalid or expired.' },
          { status: 400 }
        );
      }

      // Log invitation acceptance
      await OrganizationService.logAuditEvent({
        company_id: invitation.company_id,
        user_id: user.id,
        action: 'invitation_accepted',
        resource_type: 'invitation',
        resource_id: invitation.id,
        new_values: {
          accepted_by: user.id,
          role: invitation.role
        }
      });

      return NextResponse.json({
        message: 'Invitation accepted successfully',
        company_id: invitation.company_id
      });

    } catch (error) {
      console.error('Accept invitation error:', error);
      
      if (error instanceof Error && error.message?.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'You are already a member of this company' },
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

export const POST = withMonitoring(handleAcceptInvitation);