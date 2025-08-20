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
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }
    
    // Get dashboard sync status
    const syncStatus = await sql`
      SELECT 
        dashboard_type,
        last_sync_at,
        next_sync_scheduled,
        sync_status,
        records_processed,
        records_created,
        records_updated,
        records_failed,
        sync_duration_ms,
        data_volume_mb,
        last_error,
        error_count,
        updated_at
      FROM data_ingestion.dashboard_sync_status
      WHERE company_id = ${companyId}
      ORDER BY updated_at DESC
    `;
    
    return NextResponse.json(syncStatus);
    
  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json({ error: 'Failed to fetch sync status' }, { status: 500 });
  }
}