import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';
import { CompanyModel } from '@/lib/models/company';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { companyName, industry, role } = body;

    // Validation
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    if (!industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    // Check if user already has a company
    const existingCompanies = await CompanyModel.findByUserId(user.id);
    if (existingCompanies.length > 0) {
      return NextResponse.json(
        { error: 'User already has a company setup' },
        { status: 400 }
      );
    }

    // Create the company and user-company relationship
    const result = await CompanyModel.createCompany({
      name: companyName,
      industry,
      user_role: role
    }, user.id);

    return NextResponse.json({
      message: 'Company setup completed successfully',
      company: result.company,
      userRole: result.userCompany.role
    }, { status: 201 });

  } catch (error) {
    console.error('Company setup error:', error);
    
    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Company already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}