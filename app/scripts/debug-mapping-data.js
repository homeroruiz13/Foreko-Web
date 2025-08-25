const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');

async function debugMappingData() {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    console.log('🔍 Debugging column mapping data...\n');
    
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
    console.log(`Status: ${latestFile[0].status}`);
    console.log(`Entity type: ${latestFile[0].detected_entity_type}\n`);
    
    // Check AI column detection results
    console.log('🤖 AI Column Detection Results:');
    const aiDetections = await sql`
      SELECT * FROM data_ingestion.ai_column_detection 
      WHERE file_upload_id = ${fileId}
      ORDER BY confidence_score DESC
    `;
    
    if (aiDetections.length === 0) {
      console.log('❌ No AI column detection data found\n');
    } else {
      aiDetections.forEach((detection, index) => {
        console.log(`${index + 1}. Column: "${detection.detected_column_name}"`);
        console.log(`   → Target: "${detection.suggested_standard_field}"`);
        console.log(`   → Confidence: ${detection.confidence_score}%`);
        console.log(`   → Reasoning: ${detection.suggestion_reasoning}`);
        console.log('');
      });
    }
    
    // Check raw data to see actual column names
    console.log('📄 Raw Data Sample:');
    const rawData = await sql`
      SELECT raw_row_data FROM data_ingestion.raw_data_storage 
      WHERE file_upload_id = ${fileId}
      LIMIT 3
    `;
    
    if (rawData.length === 0) {
      console.log('❌ No raw data found\n');
    } else {
      rawData.forEach((row, index) => {
        const data = JSON.parse(row.raw_row_data);
        console.log(`Row ${index + 1}: ${JSON.stringify(data, null, 2)}`);
      });
    }
    
    // Get what the analyze API would return
    console.log('\n🔎 Testing analyze API response...');
    try {
      const response = await fetch(`http://localhost:3001/api/data-ingestion/analyze/${fileId}`);
      if (response.ok) {
        const analyzeResult = await response.json();
        console.log('✅ Analyze API Response:');
        console.log('File Info:', JSON.stringify(analyzeResult.fileInfo, null, 2));
        console.log('Mapping Suggestions:', JSON.stringify(analyzeResult.mappingSuggestions, null, 2));
        console.log('Sample Data:', JSON.stringify(analyzeResult.sampleData?.slice(0, 2), null, 2));
      } else {
        console.log('❌ Analyze API failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Error calling analyze API:', error.message);
    }
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugMappingData();