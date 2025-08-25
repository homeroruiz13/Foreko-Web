const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');

async function checkValidationStructure() {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    console.log('Checking validation structure...');
    
    // Check if validation_rules table exists
    const validationRulesTable = await sql`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'data_ingestion' 
      AND table_name = 'validation_rules'
      ORDER BY ordinal_position
    `;
    
    console.log('validation_rules table columns:');
    if (validationRulesTable.length > 0) {
      validationRulesTable.forEach(row => {
        console.log(`- ${row.column_name}`);
      });
    } else {
      console.log('❌ validation_rules table does not exist');
    }
    
    // Check standard_field_definitions structure
    const standardFieldsTable = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'data_ingestion' 
      AND table_name = 'standard_field_definitions'
      ORDER BY ordinal_position
    `;
    
    console.log('\nstandard_field_definitions table structure:');
    standardFieldsTable.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Check what the code is trying to query
    console.log('\n🔍 The ClaudeMappingService is querying for validation_rules but the table has validation_regex');
    console.log('📋 According to your schema documentation, there should be a separate validation_rules table');
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

checkValidationStructure();