const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');

async function checkRawData() {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    console.log('🔍 Checking raw data structure...\n');
    
    // Get the latest file upload
    const latestFile = await sql`
      SELECT * FROM data_ingestion.file_uploads 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    if (latestFile.length === 0) {
      console.log('No files found');
      return;
    }
    
    const fileId = latestFile[0].id;
    console.log(`Latest file: ${latestFile[0].original_filename} (${fileId})`);
    
    // Check raw data structure
    console.log('\n📄 Raw Data Structure:');
    const rawData = await sql`
      SELECT 
        row_number,
        raw_row_data,
        pg_typeof(raw_row_data) as data_type
      FROM data_ingestion.raw_data_storage 
      WHERE file_upload_id = ${fileId}
      LIMIT 3
    `;
    
    rawData.forEach((row, index) => {
      console.log(`Row ${row.row_number}:`);
      console.log(`  Data type: ${row.data_type}`);
      console.log(`  Raw value: ${row.raw_row_data}`);
      
      // Try to parse if it's a string
      if (typeof row.raw_row_data === 'string') {
        try {
          const parsed = JSON.parse(row.raw_row_data);
          console.log(`  Parsed: ${JSON.stringify(parsed, null, 2)}`);
        } catch (e) {
          console.log(`  Parse error: ${e.message}`);
        }
      } else {
        console.log(`  Direct value: ${JSON.stringify(row.raw_row_data, null, 2)}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

checkRawData();