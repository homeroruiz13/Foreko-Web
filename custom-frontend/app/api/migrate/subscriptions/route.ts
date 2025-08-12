import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migration-fix-subscriptions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running subscriptions migration...');
    
    // Execute the migration
    const result = await query(migrationSQL);
    
    console.log('Migration completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Subscriptions table migration completed successfully',
      result: result
    });

  } catch (error) {
    console.error('Migration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check current table structure
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'subscriptions' 
      AND table_name = 'subscriptions'
      ORDER BY ordinal_position
    `);

    return NextResponse.json({
      success: true,
      message: 'Current subscriptions table structure',
      columns: result.rows
    });

  } catch (error) {
    console.error('Error checking table structure:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check table structure',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}