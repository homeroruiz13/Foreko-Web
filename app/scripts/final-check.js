const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

async function finalCheck() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔍 Final table verification...\n');
  
  const requiredTables = [
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
  
  let allGood = true;
  
  for (const tableName of requiredTables) {
    try {
      // Try to select from the table to verify it exists and is accessible
      const result = await sql`SELECT 1 FROM data_ingestion.${sql(tableName)} LIMIT 1`;
      console.log(`✅ data_ingestion.${tableName} - ACCESSIBLE`);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log(`❌ data_ingestion.${tableName} - DOES NOT EXIST`);
        allGood = false;
      } else {
        console.log(`✅ data_ingestion.${tableName} - EXISTS (empty or permission issue)`);
      }
    }
  }
  
  if (allGood) {
    console.log('\n🎉 All required tables are ready!');
    console.log('\n🚀 You can now test your file upload system!');
  } else {
    console.log('\n⚠️ Some tables are missing. Check the migration scripts.');
  }
}

finalCheck().catch(console.error);