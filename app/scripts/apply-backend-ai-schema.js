const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function applyBackendAISchema() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🤖 Applying exact backend schema with AI functions...\n');
  
  try {
    // Apply the exact backend schema with all AI functionality
    const schemaPath = path.join(__dirname, '../../backend/intelligence_hub/data_ingestion/schemas/data_ingestion_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Applying backend schema with:');
    console.log('   - AI dashboard assignment functions');
    console.log('   - Automated processing pipeline');
    console.log('   - Cross-domain analytics with AI insights');
    console.log('   - Smart triggers for auto-assignment');
    console.log('   - Standard field definitions with AI mapping hints');
    
    await sql.unsafe(schema);
    console.log('\\n✅ Backend AI schema applied successfully!');
    
    // Verify key AI components exist
    console.log('\\n🔍 Verifying AI components...');
    
    // Check functions
    const functions = await sql`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'data_ingestion'
      AND routine_type = 'FUNCTION'
    `;
    
    console.log('\\n🔧 AI Functions available:');
    functions.forEach(f => console.log(`   - ${f.routine_name}()`));
    
    // Check triggers
    const triggers = await sql`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'data_ingestion'
    `;
    
    console.log('\\n⚡ AI Triggers active:');
    triggers.forEach(t => console.log(`   - ${t.trigger_name}`));
    
    // Check key tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'data_ingestion'
      ORDER BY table_name
    `;
    
    console.log('\\n📊 Data flow tables ready:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    
    console.log('\\n🎉 AI-POWERED DATA INGESTION SYSTEM READY!');
    console.log('\\n📋 The system now includes:');
    console.log('   1. File Upload → file_uploads table');
    console.log('   2. Raw Data Storage → raw_data_storage table'); 
    console.log('   3. AI Column Mapping → standard_field_definitions (with AI hints)');
    console.log('   4. Processing → processed_records (via AI functions)');
    console.log('   5. Dashboard Assignment → target_dashboards[] (AI auto-assigned)');
    console.log('\\n🤖 AI Features:');
    console.log('   - Auto dashboard assignment based on entity type');
    console.log('   - Cross-domain analytics with AI insights');
    console.log('   - Smart field mapping using common_aliases');
    console.log('   - Automated data quality scoring');
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
  }
}

applyBackendAISchema().catch(console.error);