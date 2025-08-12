import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting constraint fix...');
    
    // Drop the problematic constraint if it exists
    const dropConstraintSQL = `
      DO $$ 
      BEGIN
          IF EXISTS (
              SELECT 1 FROM pg_constraint con
              JOIN pg_class rel ON rel.oid = con.conrelid
              JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
              WHERE nsp.nspname = 'subscriptions' 
              AND rel.relname = 'subscriptions'
              AND con.conname = 'subscriptions_trial_logic'
          ) THEN
              ALTER TABLE subscriptions.subscriptions DROP CONSTRAINT subscriptions_trial_logic;
              RAISE NOTICE 'Dropped subscriptions_trial_logic constraint';
          ELSE
              RAISE NOTICE 'subscriptions_trial_logic constraint does not exist';
          END IF;
      END $$;
    `;
    
    console.log('Executing constraint drop...');
    await query(dropConstraintSQL);
    
    console.log('Constraint fix completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Subscription constraint fixed successfully'
    });

  } catch (error) {
    console.error('Constraint fix error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Constraint fix failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to fix subscription constraints'
  });
}