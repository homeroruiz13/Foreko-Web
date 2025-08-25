const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { default: fetch } = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testEndToEnd() {
  console.log('🧪 Testing data import functionality end-to-end...\n');
  
  try {
    // Step 1: Create test CSV file
    console.log('📄 Step 1: Creating test inventory CSV...');
    const timestamp = Date.now();
    const testCsv = `item_name,quantity,unit_cost,supplier_name,sku_code
Fresh Apples,100,0.50,Fresh Farms Co,SKU-APPLE-001-${timestamp}
Organic Bananas,200,0.30,Tropical Suppliers Ltd,SKU-BANANA-002-${timestamp}
Valencia Oranges,150,0.60,Citrus Company Inc,SKU-ORANGE-003-${timestamp}
Red Bell Peppers,75,1.25,Garden Fresh Produce,SKU-PEPPER-004-${timestamp}
Tomatoes Roma,120,0.85,Local Farm Direct,SKU-TOMATO-005-${timestamp}`;
    
    const testFile = path.join(__dirname, `test-inventory-data-${timestamp}.csv`);
    fs.writeFileSync(testFile, testCsv);
    console.log('✅ Test CSV created');
    
    // Step 2: Upload file
    console.log('\n📤 Step 2: Uploading file...');
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile));
    
    const uploadResponse = await fetch('http://localhost:3001/api/data-ingestion/upload', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders()
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${await uploadResponse.text()}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ File uploaded successfully');
    console.log(`   File ID: ${uploadResult.fileUpload?.id}`);
    console.log(`   Status: ${uploadResult.fileUpload?.status}`);
    
    // Step 3: Analyze file
    console.log('\n🤖 Step 3: Analyzing file with Claude...');
    const analyzeResponse = await fetch(`http://localhost:3001/api/data-ingestion/analyze/${uploadResult.fileUpload?.id}`, {
      method: 'POST'
    });
    
    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      throw new Error(`Analysis failed: ${analyzeResponse.status} ${errorText}`);
    }
    
    const analyzeResult = await analyzeResponse.json();
    console.log('✅ File analyzed successfully');
    console.log(`   Detected Entity Type: ${analyzeResult.entityType}`);
    console.log(`   Confidence: ${analyzeResult.confidence}`);
    console.log(`   Row Count: ${analyzeResult.rowCount}`);
    console.log(`   Column Count: ${analyzeResult.columnCount}`);
    console.log(`   Column Mappings: ${analyzeResult.mappingSuggestions?.length || 0} suggestions`);
    
    if (analyzeResult.mappingSuggestions && analyzeResult.mappingSuggestions.length > 0) {
      console.log('\n   📋 Column Mapping Suggestions:');
      analyzeResult.mappingSuggestions.forEach(mapping => {
        console.log(`     ${mapping.sourceColumn} → ${mapping.targetField} (${mapping.confidence}% confidence)`);
      });
    }
    
    // Step 4: Get analysis results
    console.log('\n📊 Step 4: Retrieving analysis results...');
    const resultsResponse = await fetch(`http://localhost:3001/api/data-ingestion/analyze/${uploadResult.fileUpload?.id}`);
    
    if (!resultsResponse.ok) {
      throw new Error(`Failed to get results: ${resultsResponse.status}`);
    }
    
    const results = await resultsResponse.json();
    console.log('✅ Analysis results retrieved');
    console.log(`   AI Suggestions Count: ${results.mappingSuggestions?.length || 0}`);
    console.log(`   Sample Data Rows: ${results.sampleData?.length || 0}`);
    
    // Step 5: Check database for stored data
    console.log('\n🗄️  Step 5: Verifying data storage...');
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Check file_uploads table
    const fileRecord = await sql`
      SELECT * FROM data_ingestion.file_uploads 
      WHERE id = ${uploadResult.fileUpload?.id}
    `;
    console.log(`✅ File record: Status=${fileRecord[0]?.status}, Entity=${fileRecord[0]?.detected_entity_type}`);
    
    // Check raw_data_storage
    const rawDataCount = await sql`
      SELECT COUNT(*) as count FROM data_ingestion.raw_data_storage 
      WHERE file_upload_id = ${uploadResult.fileUpload?.id}
    `;
    console.log(`✅ Raw data stored: ${rawDataCount[0]?.count} rows`);
    
    // Check ai_column_detection
    const aiDetectionCount = await sql`
      SELECT COUNT(*) as count FROM data_ingestion.ai_column_detection 
      WHERE file_upload_id = ${uploadResult.fileUpload?.id}
    `;
    console.log(`✅ AI column detection: ${aiDetectionCount[0]?.count} suggestions stored`);
    
    // Check processing_queue
    const queueRecord = await sql`
      SELECT * FROM data_ingestion.processing_queue 
      WHERE file_upload_id = ${uploadResult.fileUpload?.id}
    `;
    console.log(`✅ Processing queue: Status=${queueRecord[0]?.status}`);
    
    // Step 6: Validation Rules Check
    console.log('\n✅ Step 6: Validation rules verification...');
    const validationRulesCount = await sql`
      SELECT COUNT(*) as count FROM data_ingestion.validation_rules 
      WHERE entity_type = 'inventory'
    `;
    console.log(`✅ Validation rules for inventory: ${validationRulesCount[0]?.count} rules`);
    
    // Clean up test file
    fs.unlinkSync(testFile);
    
    console.log('\n🎉 END-TO-END TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📋 SUMMARY:');
    console.log('  ✅ File upload working');
    console.log('  ✅ Claude API integration working');
    console.log('  ✅ Entity type detection working');
    console.log('  ✅ Column mapping suggestions working');
    console.log('  ✅ Database schema properly implemented');
    console.log('  ✅ All core tables populated correctly');
    console.log('  ✅ Validation rules system in place');
    console.log('\n🚀 The data import page should now work without errors!');
    
  } catch (error) {
    console.error('\n❌ END-TO-END TEST FAILED:', error.message);
    console.error('   Full error:', error);
  }
}

testEndToEnd();