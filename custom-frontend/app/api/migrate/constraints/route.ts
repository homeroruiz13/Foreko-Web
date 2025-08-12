import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Read the constraint migration SQL file
    const migrationPath = path.join(process.cwd(), 'migration-fix-constraints.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running constraint migration...');
    
    // Execute the migration
    const result = await query(migrationSQL);
    
    console.log('Constraint migration completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Constraints migration completed successfully',
      result: result
    });

  } catch (error) {
    console.error('Constraint migration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Constraint migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check current constraints on subscriptions table
    const result = await query(`
      SELECT 
          con.conname AS constraint_name,
          con.contype AS constraint_type,
          pg_get_constraintdef(con.oid) AS constraint_definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = 'subscriptions' 
      AND rel.relname = 'subscriptions'
      AND con.contype = 'c'
    `);

    return NextResponse.json({
      success: true,
      message: 'Current subscription table constraints',
      constraints: result.rows
    });

  } catch (error) {
    console.error('Error checking constraints:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check constraints',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}