const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');

async function createMissingTables() {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    console.log('Creating missing tables according to schema documentation...');
    
    // 1. Create validation_rules table
    console.log('Creating validation_rules table...');
    await sql`
      CREATE TABLE IF NOT EXISTS data_ingestion.validation_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        field_name VARCHAR(100) NOT NULL,
        rule_type VARCHAR(50) NOT NULL,
        rule_config JSONB NOT NULL,
        error_message TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        priority INTEGER DEFAULT 100,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        UNIQUE(entity_type, field_name, rule_type)
      )
    `;
    
    // 2. Create ai_column_detection table
    console.log('Creating ai_column_detection table...');
    await sql`
      CREATE TABLE IF NOT EXISTS data_ingestion.ai_column_detection (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
        detected_column_name VARCHAR(200) NOT NULL,
        suggested_standard_field VARCHAR(100),
        confidence_score NUMERIC(5,2),
        suggestion_reasoning TEXT,
        alternative_suggestions JSONB,
        
        -- Column statistics
        data_type_detected VARCHAR(50),
        sample_values JSONB,
        null_percentage NUMERIC(5,2),
        unique_percentage NUMERIC(5,2),
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        UNIQUE(file_upload_id, detected_column_name)
      )
    `;
    
    // 3. Create processing_errors table  
    console.log('Creating processing_errors table...');
    await sql`
      CREATE TABLE IF NOT EXISTS data_ingestion.processing_errors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
        processed_record_id UUID REFERENCES data_ingestion.processed_records(id) ON DELETE CASCADE,
        
        -- Error details
        error_type VARCHAR(50) NOT NULL,
        error_code VARCHAR(20),
        error_message TEXT NOT NULL,
        
        -- Location details
        row_number INTEGER,
        column_name VARCHAR(200),
        field_value TEXT,
        
        -- Resolution
        severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
        is_resolved BOOLEAN DEFAULT FALSE,
        resolution_notes TEXT,
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      )
    `;
    
    // 4. Create ai_learning_data table (enhanced version)
    console.log('Creating enhanced ai_learning_data table...');
    await sql`
      CREATE TABLE IF NOT EXISTS data_ingestion.ai_learning_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
        
        -- Learning data
        entity_type VARCHAR(50) NOT NULL,
        source_column_name VARCHAR(200) NOT NULL,
        target_standard_field VARCHAR(100) NOT NULL,
        
        -- Performance metrics
        usage_frequency INTEGER DEFAULT 1,
        success_rate NUMERIC(5,4) DEFAULT 1.0,
        
        -- Learning metadata
        is_global_learning BOOLEAN DEFAULT FALSE,
        confidence_improvement NUMERIC(5,2),
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        UNIQUE(company_id, entity_type, source_column_name, target_standard_field)
      )
    `;
    
    // 5. Create data_quality_metrics table
    console.log('Creating data_quality_metrics table...');
    await sql`
      CREATE TABLE IF NOT EXISTS data_ingestion.data_quality_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
        
        -- Quality scores
        overall_quality_score NUMERIC(5,2),
        completeness_score NUMERIC(5,2),
        accuracy_score NUMERIC(5,2),
        consistency_score NUMERIC(5,2),
        validity_score NUMERIC(5,2),
        
        -- Record counts
        total_records INTEGER NOT NULL,
        valid_records INTEGER DEFAULT 0,
        error_records INTEGER DEFAULT 0,
        warning_records INTEGER DEFAULT 0,
        
        -- Detailed metrics
        quality_checks_performed JSONB,
        field_quality_scores JSONB,
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    
    // 6. Create processing_queue table
    console.log('Creating processing_queue table...');
    await sql`
      CREATE TABLE IF NOT EXISTS data_ingestion.processing_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
        company_id UUID NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
        
        -- Queue management
        priority INTEGER DEFAULT 100,
        status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
        
        -- Processing details
        entity_type VARCHAR(50),
        estimated_processing_time_ms INTEGER,
        actual_processing_time_ms INTEGER,
        
        -- Timestamps
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        
        -- Error handling
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        last_error TEXT
      )
    `;
    
    // Create indexes for performance
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_validation_rules_entity_field ON data_ingestion.validation_rules(entity_type, field_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_column_detection_file_id ON data_ingestion.ai_column_detection(file_upload_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_processing_errors_file_id ON data_ingestion.processing_errors(file_upload_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_processing_errors_severity ON data_ingestion.processing_errors(severity, is_resolved)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_learning_company_entity ON data_ingestion.ai_learning_data(company_id, entity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON data_ingestion.processing_queue(status, priority, created_at)`;
    
    console.log('✅ All missing tables created successfully!');
    
    // Insert some sample validation rules
    console.log('Inserting sample validation rules...');
    await sql`
      INSERT INTO data_ingestion.validation_rules (
        entity_type, field_name, rule_type, rule_config, error_message
      ) VALUES
      ('inventory', 'quantity', 'min_value', '{"min": 0}', 'Quantity must be greater than or equal to 0'),
      ('inventory', 'unit_cost', 'min_value', '{"min": 0}', 'Unit cost must be greater than or equal to 0'),
      ('inventory', 'item_name', 'required', '{}', 'Item name is required'),
      ('orders', 'order_date', 'date_format', '{"format": "YYYY-MM-DD"}', 'Order date must be in YYYY-MM-DD format'),
      ('orders', 'total_amount', 'min_value', '{"min": 0}', 'Total amount must be greater than or equal to 0'),
      ('financial', 'transaction_date', 'date_format', '{"format": "YYYY-MM-DD"}', 'Transaction date must be in YYYY-MM-DD format'),
      ('logistics', 'estimated_delivery', 'date_future', '{}', 'Estimated delivery must be a future date')
      ON CONFLICT (entity_type, field_name, rule_type) DO NOTHING
    `;
    
    console.log('✅ Sample validation rules inserted!');
    
  } catch (error) {
    console.error('Failed to create tables:', error);
  }
}

createMissingTables();