import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/lib/org-service';
import { getServerSideUserWithSession } from '@/lib/auth-session';
import { withMonitoring } from '@/lib/middleware/monitoring';

async function handleCompanies(request: NextRequest) {
  const user = await getServerSideUserWithSession();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (request.method === 'GET') {
    try {
      const companies = await OrganizationService.getUserCompanies(user.id);
      
      return NextResponse.json({
        companies,
        count: companies.length
      });

    } catch (error) {
      console.error('Get companies error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { name, industry, website, phone, address } = body;

      if (!name || !name.trim()) {
        return NextResponse.json(
          { error: 'Company name is required' },
          { status: 400 }
        );
      }

      const companyData = {
        name: name.trim(),
        industry,
        website,
        phone,
        address_line1: address?.line1,
        address_line2: address?.line2,
        city: address?.city,
        state: address?.state,
        postal_code: address?.postal_code,
        country: address?.country
      };

      const companyId = await OrganizationService.createCompany(companyData, user.id);

      // Log company creation
      await OrganizationService.logAuditEvent({
        company_id: companyId,
        user_id: user.id,
        action: 'company_created',
        resource_type: 'company',
        resource_id: companyId,
        new_values: companyData
      });

      return NextResponse.json({
        message: 'Company created successfully',
        company_id: companyId
      }, { status: 201 });

    } catch (error) {
      console.error('Create company error:', error);
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

export const GET = withMonitoring(handleCompanies);
export const POST = withMonitoring(handleCompanies);