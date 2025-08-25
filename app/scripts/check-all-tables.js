const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');

async function checkAllTables() {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    console.log('Checking all data_ingestion tables...');
    
    // Get all tables in data_ingestion schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'data_ingestion'
      ORDER BY table_name
    `;
    
    console.log('Tables in data_ingestion schema:');
    tables.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check key tables that might be missing
    const requiredTables = [
      'file_uploads',
      'raw_data_storage', 
      'ai_column_detection',
      'user_column_mappings',
      'processed_records',
      'processing_errors',
      'standard_field_definitions'
    ];
    
    console.log('\nRequired table status:');
    const existingTables = tables.map(t => t.table_name);
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`${exists ? '✓' : '✗'} ${table}`);
    });
    
  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkAllTables();