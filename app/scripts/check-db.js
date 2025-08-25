const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');

async function checkDatabase() {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    console.log('Checking database schema...');
    
    // Check if data_ingestion schema exists
    const schemas = await sql`SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'data_ingestion'`;
    console.log('Schema exists:', schemas.length > 0);
    
    if (schemas.length > 0) {
      // Check if standard_field_definitions table exists
      const tables = await sql`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'data_ingestion' 
        AND table_name = 'standard_field_definitions'
        ORDER BY ordinal_position
      `;
      
      console.log('standard_field_definitions columns:');
      tables.forEach(row => {
        console.log(`- ${row.column_name}`);
      });
      
      // Check if we have validation_regex or validation_rules
      const hasValidationRegex = tables.some(t => t.column_name === 'validation_regex');
      const hasValidationRules = tables.some(t => t.column_name === 'validation_rules');
      
      console.log('Has validation_regex:', hasValidationRegex);
      console.log('Has validation_rules:', hasValidationRules);
    }
    
  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkDatabase();