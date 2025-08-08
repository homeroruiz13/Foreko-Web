import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
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

    // Generate user-specific dashboard data based on user ID
    const generateUserData = (userId: string) => {
      // Use user ID to generate consistent but unique data for each user
      const seed = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      
      // Generate data that's unique to this user but consistent across sessions
      const baseValue = (seed % 1000) + 500;
      const multiplier = ((seed % 10) + 1) / 10;
      
      return {
        companyData: {
          totalStockValue: `$${(baseValue * 250 * multiplier).toLocaleString()}`,
          activeOrders: Math.floor(baseValue * 0.05),
          revenue30d: `$${(baseValue * 90 * multiplier).toLocaleString()}`,
          repeatPurchaseRate: `${65 + (seed % 20)}%`
        },
        financialData: {
          totalRevenue: `$${(baseValue * 800 * multiplier).toLocaleString()}`,
          netProfit: `$${(baseValue * 240 * multiplier).toLocaleString()}`,
          operatingCashFlow: `$${(baseValue * 150 * multiplier).toLocaleString()}`,
          grossMargin: `${60 + (seed % 15)}%`,
          accountsReceivable: `$${(baseValue * 50 * multiplier).toLocaleString()}`,
          accountsPayable: `$${(baseValue * 30 * multiplier).toLocaleString()}`
        },
        customerData: {
          totalCustomers: Math.floor(baseValue * 2.5),
          activeCustomers: Math.floor(baseValue * 1.8),
          newCustomers: Math.floor(baseValue * 0.3),
          avgOrderValue: `$${Math.floor(180 + (seed % 100))}`,
          lifetimeValue: `$${Math.floor(2000 + (seed % 1000))}`,
          churnRate: `${2 + (seed % 4)}%`
        }
      };
    };

    const userData = generateUserData(user.id);

    return NextResponse.json({
      id: user.id,
      firstName: user.name?.split(' ')[0] || 'User',
      name: user.name,
      email: user.email,
      status: user.status,
      subscriptionStatus: 'Active Plan',
      ...userData
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}