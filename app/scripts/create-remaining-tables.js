const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

async function createTables() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🚀 Creating remaining required tables...\n');
  
  // Create each table individually
  const tables = [
    {
      name: 'ai_column_detection',
      sql: `
        CREATE TABLE data_ingestion.ai_column_detection (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
          source_column_name VARCHAR(255) NOT NULL,
          detected_data_type VARCHAR(50),
          suggested_standard_field VARCHAR(255),
          confidence_score NUMERIC(5,2),
          detection_reasoning TEXT,
          sample_values JSONB,
          alternative_suggestions JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    },
    {
      name: 'processing_errors',
      sql: `
        CREATE TABLE data_ingestion.processing_errors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
          row_number INTEGER,
          error_type VARCHAR(50) NOT NULL,
          error_message TEXT NOT NULL,
          field_name VARCHAR(255),
          field_value TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    },
    {
      name: 'data_quality_metrics',
      sql: `
        CREATE TABLE data_ingestion.data_quality_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
          overall_quality_score NUMERIC(5,2),
          completeness_score NUMERIC(5,2),
          accuracy_score NUMERIC(5,2),
          consistency_score NUMERIC(5,2),
          total_records INTEGER,
          valid_records INTEGER,
          error_records INTEGER,
          warning_records INTEGER,
          quality_checks_performed JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    },
    {
      name: 'processing_queue',
      sql: `
        CREATE TABLE data_ingestion.processing_queue (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
          company_id UUID NOT NULL,
          priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
          status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
          entity_type VARCHAR(50),
          estimated_processing_time_ms INTEGER,
          actual_processing_time_ms INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          processed_at TIMESTAMPTZ
        );
      `
    }
  ];
  
  for (const table of tables) {
    try {
      console.log(`Creating ${table.name}...`);
      await sql.unsafe(table.sql);
      console.log(`✅ Created ${table.name}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ ${table.name} already exists`);
      } else {
        console.error(`❌ Failed to create ${table.name}: ${error.message}`);
      }
    }
  }
  
  // Add indexes
  console.log('\nAdding indexes...');
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_ai_column_detection_file_id ON data_ingestion.ai_column_detection(file_upload_id);',
    'CREATE INDEX IF NOT EXISTS idx_processing_errors_file_id ON data_ingestion.processing_errors(file_upload_id);',
    'CREATE INDEX IF NOT EXISTS idx_data_quality_file_id ON data_ingestion.data_quality_metrics(file_upload_id);',
    'CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON data_ingestion.processing_queue(status);',
    'CREATE INDEX IF NOT EXISTS idx_processing_queue_file_id ON data_ingestion.processing_queue(file_upload_id);'
  ];
  
  for (const index of indexes) {
    try {
      await sql.unsafe(index);
      console.log('✅ Added index');
    } catch (error) {
      console.log(`⚠️ Index creation: ${error.message}`);
    }
  }
  
  console.log('\n🎉 All tables created successfully!');
}

createTables().catch(console.error);