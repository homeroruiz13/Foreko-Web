const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { default: fetch } = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    console.log('Testing file upload...');
    
    // Create a simple test CSV
    const testCsv = `item_name,quantity,unit_cost,supplier_name
Apple,100,0.50,Fresh Farms
Banana,200,0.30,Tropical Suppliers
Orange,150,0.60,Citrus Co`;
    
    const testFile = path.join(__dirname, 'test-data.csv');
    fs.writeFileSync(testFile, testCsv);
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile));
    
    // Upload file
    const response = await fetch('http://localhost:3001/api/data-ingestion/upload', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders()
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Upload successful!');
      console.log('File ID:', result.fileId);
      
      // Wait a moment then check the analyze endpoint
      console.log('Waiting for analysis...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analyzeResponse = await fetch(`http://localhost:3001/api/data-ingestion/analyze/${result.fileId}`);
      
      if (analyzeResponse.ok) {
        const analyzeResult = await analyzeResponse.json();
        console.log('Analysis successful!');
        console.log('Detected entity type:', analyzeResult.detectedEntityType);
        console.log('Column mappings:', analyzeResult.columnMappings?.length || 0);
      } else {
        console.log('Analysis failed:', analyzeResponse.status, await analyzeResponse.text());
      }
      
    } else {
      console.log('Upload failed:', response.status, await response.text());
    }
    
    // Clean up test file
    fs.unlinkSync(testFile);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUpload();