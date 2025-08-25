const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🚀 Starting database migrations...\n');
  
  const migrations = [
    {
      name: 'Base Data Ingestion Schema',
      file: path.join(__dirname, '../../backend/migrations/0009_data_ingestion_init.sql')
    },
    {
      name: 'Data Ingestion Schema Enhancements',
      file: path.join(__dirname, '../../backend/intelligence_hub/data_ingestion/schemas/data_ingestion_schema.sql')
    }
  ];
  
  for (const migration of migrations) {
    try {
      console.log(`Running migration: ${migration.name}`);
      console.log(`File: ${migration.file}`);
      
      if (!fs.existsSync(migration.file)) {
        console.error(`❌ Migration file not found: ${migration.file}`);
        continue;
      }
      
      const migrationSQL = fs.readFileSync(migration.file, 'utf8');
      
      // Split by semicolon but be careful with functions and DO blocks
      const statements = migrationSQL
        .split(/;\s*$/gm)
        .filter(stmt => stmt.trim().length > 0)
        .map(stmt => stmt.trim() + ';');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const statement of statements) {
        // Skip comments
        if (statement.trim().startsWith('--')) continue;
        
        try {
          // Use sql.unsafe for raw SQL statements
          await sql.unsafe(statement);
          successCount++;
        } catch (error) {
          // Log error but continue with other statements
          console.error(`⚠️ Error executing statement: ${error.message}`);
          errorCount++;
        }
      }
      
      console.log(`✅ Completed ${migration.name}: ${successCount} statements succeeded, ${errorCount} errors\n`);
      
    } catch (error) {
      console.error(`❌ Failed to run migration ${migration.name}:`, error);
    }
  }
  
  console.log('🎉 Migration process completed!');
  
  // Verify tables exist
  console.log('\n📊 Verifying tables...');
  
  const tablesToCheck = [
    'data_ingestion.file_uploads',
    'data_ingestion.ai_column_detection',
    'data_ingestion.user_column_mappings',
    'data_ingestion.raw_data_storage',
    'data_ingestion.processed_records',
    'data_ingestion.processing_errors',
    'data_ingestion.data_quality_metrics',
    'data_ingestion.processing_queue',
    'data_ingestion.standard_field_definitions',
    'data_ingestion.dashboard_sync_status'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const [schema, tableName] = table.split('.');
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = ${schema}
          AND table_name = ${tableName}
        ) as exists
      `;
      
      if (result[0].exists) {
        console.log(`✅ ${table}`);
      } else {
        console.log(`❌ ${table} - NOT FOUND`);
      }
    } catch (error) {
      console.log(`❌ ${table} - ERROR: ${error.message}`);
    }
  }
}

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

runMigrations().catch(console.error);