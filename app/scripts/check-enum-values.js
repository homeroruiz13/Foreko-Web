const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');

async function checkEnumValues() {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    console.log('Checking enum values for file_status...');
    
    // Get enum values for file_status
    const enumValues = await sql`
      SELECT enumlabel as value
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'file_status'
      )
      ORDER BY enumlabel
    `;
    
    console.log('Valid file_status values:');
    enumValues.forEach(val => {
      console.log(`  - ${val.value}`);
    });
    
    // Also check data_entity_type enum
    const entityEnumValues = await sql`
      SELECT enumlabel as value
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'data_entity_type'
      )
      ORDER BY enumlabel
    `;
    
    console.log('\nValid data_entity_type values:');
    entityEnumValues.forEach(val => {
      console.log(`  - ${val.value}`);
    });
    
  } catch (error) {
    console.error('Error checking enum values:', error);
  }
}

checkEnumValues();