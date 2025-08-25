const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function applyExactSchema() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔄 Applying EXACT backend schema for 5-step data flow...\n');
  
  try {
    // Step 1: Apply base schema (with all ENUMs and base tables)
    console.log('📋 Step 1: Applying base data ingestion schema...');
    const baseSchemaPath = path.join(__dirname, '../../backend/migrations/0009_data_ingestion_init.sql');
    
    if (fs.existsSync(baseSchemaPath)) {
      const baseSchema = fs.readFileSync(baseSchemaPath, 'utf8');
      await sql.unsafe(baseSchema);
      console.log('✅ Base schema applied');
    } else {
      console.log('⚠️ Base schema file not found, creating manually...');
      
      // Create schema and enums manually
      await sql.unsafe(`
        CREATE SCHEMA IF NOT EXISTS data_ingestion;
        
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_status') THEN
                CREATE TYPE data_ingestion.file_status AS ENUM (
                    'uploaded', 'analyzing', 'mapping_required', 'mapping_confirmed', 
                    'processing', 'completed', 'failed', 'cancelled', 'exported', 'archived'
                );
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_type') THEN
                CREATE TYPE data_ingestion.file_type AS ENUM (
                    'csv', 'excel', 'json', 'xml', 'txt', 'tsv'
                );
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_entity_type') THEN
                CREATE TYPE data_ingestion.data_entity_type AS ENUM (
                    'inventory', 'orders', 'suppliers', 'customers', 'sales', 'purchases',
                    'ingredients', 'recipes', 'bom', 'menu_items',
                    'financial', 'accounting', 'logistics', 'shipping',
                    'executive', 'kpi', 'unknown'
                );
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'column_data_type') THEN
                CREATE TYPE data_ingestion.column_data_type AS ENUM (
                    'text', 'integer', 'decimal', 'date', 'datetime', 'boolean', 'currency'
                );
            END IF;
        END $$;
      `);
      console.log('✅ Schema and enums created');
    }
    
    // Step 2: Apply enhancement schema
    console.log('\\n📋 Step 2: Applying data ingestion enhancements...');
    const enhancementSchemaPath = path.join(__dirname, '../../backend/intelligence_hub/data_ingestion/schemas/data_ingestion_schema.sql');
    
    if (fs.existsSync(enhancementSchemaPath)) {
      const enhancementSchema = fs.readFileSync(enhancementSchemaPath, 'utf8');
      await sql.unsafe(enhancementSchema);
      console.log('✅ Enhancement schema applied');
    }
    
    // Step 3: Verify the 5-step flow tables exist
    console.log('\\n📋 Step 3: Verifying 5-step flow tables...');
    
    const requiredTables = [
      'file_uploads',           // Step 1: File Upload
      'raw_data_storage',       // Step 2: Raw Data Storage  
      'ai_column_detection',    // Step 3: Column Mapping (AI)
      'user_column_mappings',   // Step 3: Column Mapping (User)
      'processed_records',      // Step 4: Processing to Standardized Records
      'standard_field_definitions' // Step 5: Dashboard Assignment (uses this for mapping)
    ];
    
    let allTablesExist = true;
    
    for (const tableName of requiredTables) {
      try {
        const result = await sql`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'data_ingestion' 
          AND table_name = ${tableName}
        `;
        
        if (result[0].count > 0) {
          console.log(`✅ ${tableName}`);
        } else {
          console.log(`❌ ${tableName} - MISSING`);
          allTablesExist = false;
        }
      } catch (error) {
        console.log(`❌ ${tableName} - ERROR: ${error.message}`);
        allTablesExist = false;
      }
    }
    
    if (allTablesExist) {
      console.log('\\n🎉 ALL TABLES READY FOR 5-STEP DATA FLOW!');
      console.log('\\n📊 Data Flow Architecture:');
      console.log('   1. File Upload → file_uploads table');
      console.log('   2. Raw Data Storage → raw_data_storage table');
      console.log('   3. Column Mapping → ai_column_detection + user_column_mappings');
      console.log('   4. Processing to Standardized Records → processed_records table');
      console.log('   5. Dashboard Assignment → target_dashboards[] array field');
      console.log('\\n🚀 processed_records is the SINGLE SOURCE OF TRUTH!');
    } else {
      console.log('\\n⚠️ Some tables are missing. Check the schema files.');
    }
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
  }
}

applyExactSchema().catch(console.error);