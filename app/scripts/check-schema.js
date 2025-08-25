const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

async function checkSchema() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('📊 Checking data_ingestion schema...\n');
  
  // List all tables in data_ingestion schema
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'data_ingestion'
    ORDER BY table_name
  `;
  
  console.log('🏗️ Existing tables in data_ingestion schema:');
  for (const table of tables) {
    console.log(`   - ${table.table_name}`);
  }
  
  console.log('\n🔍 Checking for missing required tables...');
  const requiredTables = [
    'ai_column_detection',
    'processing_errors', 
    'data_quality_metrics',
    'processing_queue'
  ];
  
  for (const tableName of requiredTables) {
    const exists = tables.find(t => t.table_name === tableName);
    if (!exists) {
      console.log(`❌ Missing: ${tableName}`);
    }
  }
}

checkSchema().catch(console.error);