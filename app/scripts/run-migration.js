const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    console.log('Running data ingestion schema migration...');
    
    // Read and run the backend schema first
    const backendSchemaPath = path.join(__dirname, '..', '..', 'backend', 'intelligence_hub', 'data_ingestion', 'schemas', 'data_ingestion_schema.sql');
    if (fs.existsSync(backendSchemaPath)) {
      const backendSchema = fs.readFileSync(backendSchemaPath, 'utf8');
      console.log('Running backend schema...');
      await sql(backendSchema);
      console.log('Backend schema completed.');
    }
    
    // Then run the app migration
    const migrationPath = path.join(__dirname, '..', 'migrations', 'create_data_ingestion_tables.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    await sql(migration);
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();