import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';
import { CompanyModel } from '@/lib/models/company';
import { PaymentTransactionModel } from '@/lib/models/payment-transactions';

export async function GET(request: NextRequest) {
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

    // Get user's company
    const userCompanies = await CompanyModel.findByUserId(user.id);
    if (userCompanies.length === 0) {
      return NextResponse.json(
        { error: 'No company found for user' },
        { status: 400 }
      );
    }

    const company = userCompanies[0];

    // Get payment transactions for the company
    const transactions = await PaymentTransactionModel.findByCompanyId(company.id);
    const stats = await PaymentTransactionModel.getTransactionStats(company.id);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        stats,
        company_id: company.id
      }
    });

  } catch (error) {
    console.error('Get payment transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}