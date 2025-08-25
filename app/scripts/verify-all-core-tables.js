const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');

async function verifyAllCoreTables() {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    console.log('Verifying all core tables from schema documentation...\n');
    
    // Core tables according to schema documentation
    const coreTablesByFlow = {
      "1. File Upload Process": [
        'file_uploads',
        'raw_data_storage'
      ],
      "2. Column Mapping Tables": [
        'ai_column_detection',
        'user_column_mappings', 
        'mapping_templates'
      ],
      "3. Processing Tables": [
        'processing_queue',
        'processed_records'
      ],
      "4. Validation & Quality": [
        'validation_rules',
        'processing_errors',
        'data_quality_metrics'
      ],
      "5. AI Learning System": [
        'ai_learning_data'
      ],
      "6. Dashboard Integration": [
        'dashboard_sync_status',
        'export_configurations',
        'cross_domain_analytics'
      ],
      "Pre-populated Reference Tables": [
        'standard_field_definitions',
        'dashboard_registry'
      ]
    };
    
    // Get all tables in data_ingestion schema
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'data_ingestion'
      ORDER BY table_name
    `;
    
    const existingTableNames = existingTables.map(t => t.table_name);
    
    // Check each flow
    let allTablesExist = true;
    
    for (const [flowName, tables] of Object.entries(coreTablesByFlow)) {
      console.log(`${flowName}:`);
      
      for (const table of tables) {
        const exists = existingTableNames.includes(table);
        const status = exists ? '✅' : '❌';
        console.log(`  ${status} ${table}`);
        
        if (!exists) {
          allTablesExist = false;
        }
      }
      console.log('');
    }
    
    console.log('📋 SUMMARY:');
    console.log(`Total core tables required: ${Object.values(coreTablesByFlow).flat().length}`);
    console.log(`Tables existing: ${Object.values(coreTablesByFlow).flat().filter(t => existingTableNames.includes(t)).length}`);
    console.log(`Tables missing: ${Object.values(coreTablesByFlow).flat().filter(t => !existingTableNames.includes(t)).length}`);
    
    if (allTablesExist) {
      console.log('\n🎉 All core tables exist! The data ingestion schema is complete.');
    } else {
      console.log('\n⚠️  Some core tables are missing. Please create them to complete the schema.');
    }
    
    // Show additional tables that exist but aren't in the core list
    const additionalTables = existingTableNames.filter(t => 
      !Object.values(coreTablesByFlow).flat().includes(t)
    );
    
    if (additionalTables.length > 0) {
      console.log('\n📝 Additional tables found (not in core flow):');
      additionalTables.forEach(table => {
        console.log(`  • ${table}`);
      });
    }
    
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyAllCoreTables();