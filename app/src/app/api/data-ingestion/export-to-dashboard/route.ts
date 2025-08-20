import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function POST(request: NextRequest) {
  if (!sql) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
  }
  
  try {
    const { companyId, dashboardType, batchSize = 1000 } = await request.json();
    
    // Call the export function
    const result = await sql`
      SELECT * FROM data_ingestion.export_to_dashboard(
        ${companyId}::UUID,
        ${dashboardType},
        ${batchSize}
      )
    `;
    
    return NextResponse.json({
      success: true,
      exported: result[0].exported_count,
      failed: result[0].failed_count,
      status: result[0].export_status
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}