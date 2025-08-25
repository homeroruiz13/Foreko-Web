const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🚀 Adding missing tables...\n');
  
  const migrationFile = path.join(__dirname, '../migrations/add_missing_tables.sql');
  const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
  
  try {
    // Execute the entire migration as one statement
    await sql.unsafe(migrationSQL);
    console.log('✅ Successfully added missing tables\n');
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
  }
  
  // Verify tables
  console.log('📊 Verifying all tables...\n');
  
  const tables = [
    'file_uploads',
    'ai_column_detection', 
    'user_column_mappings',
    'raw_data_storage',
    'processed_records',
    'processing_errors',
    'data_quality_metrics',
    'processing_queue',
    'standard_field_definitions',
    'dashboard_sync_status'
  ];
  
  for (const tableName of tables) {
    try {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'data_ingestion'
          AND table_name = ${tableName}
        ) as exists
      `;
      
      if (result[0].exists) {
        console.log(`✅ data_ingestion.${tableName}`);
      } else {
        console.log(`❌ data_ingestion.${tableName} - NOT FOUND`);
      }
    } catch (error) {
      console.log(`❌ data_ingestion.${tableName} - ERROR: ${error.message}`);
    }
  }
  
  console.log('\n✨ Done!');
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

runMigration().catch(console.error);