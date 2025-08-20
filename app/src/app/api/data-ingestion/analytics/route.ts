import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function GET(request: NextRequest) {
  if (!sql) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // Get cross-domain metrics
    const metrics = await sql`
      SELECT * FROM data_ingestion.calculate_cross_domain_metrics(
        ${companyId}::UUID,
        ${dateFrom ? dateFrom : 'CURRENT_DATE - INTERVAL \'30 days\''}::DATE,
        ${dateTo ? dateTo : 'CURRENT_DATE'}::DATE
      )
    `;
    
    // Get recent analytics
    const analytics = await sql`
      SELECT 
        analysis_type,
        analysis_name,
        primary_domain,
        related_domains,
        confidence_score,
        insights,
        recommendations,
        potential_impact,
        calculated_at
      FROM data_ingestion.cross_domain_analytics
      WHERE company_id = ${companyId}
      AND calculated_at >= ${dateFrom || 'CURRENT_DATE - INTERVAL \'30 days\''}
      ORDER BY calculated_at DESC
      LIMIT 10
    `;
    
    return NextResponse.json({
      metrics,
      analytics
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Analytics failed' }, { status: 500 });
  }
}