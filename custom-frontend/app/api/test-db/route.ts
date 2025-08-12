import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const check = searchParams.get('check');
    
    if (check === 'schemas') {
      // Check what schemas exist
      const schemaResult = await query(`
        SELECT schema_name FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
        ORDER BY schema_name
      `);
      
      // Check for specific Foreko tables
      const tableResult = await query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema IN ('auth', 'org', 'subscriptions', 'billing', 'monitoring', 'config', 'public')
        ORDER BY table_schema, table_name
      `);
      
      return NextResponse.json({
        success: true,
        message: 'Database schema check completed',
        schemas: schemaResult.rows.map(row => row.schema_name),
        foreko_tables: tableResult.rows
      });
    }
    
    const result = await query('SELECT NOW() as current_time');
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful!',
      current_time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query: testQuery } = body;
    
    if (!testQuery) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const result = await query(testQuery);
    return NextResponse.json({
      success: true,
      data: result.rows,
      rowCount: result.rowCount
    });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Query failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}