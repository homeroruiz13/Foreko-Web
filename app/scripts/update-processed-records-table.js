const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

async function updateTable() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔄 Updating processed_records table to match backend schema...\n');
  
  try {
    // Drop existing table and recreate with exact schema
    await sql.unsafe(`DROP TABLE IF EXISTS data_ingestion.processed_records CASCADE;`);
    console.log('✅ Dropped existing processed_records table');
    
    // Create the exact table from backend schema
    const createTableSQL = `
      CREATE TABLE data_ingestion.processed_records (
        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_upload_id          UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
        company_id              UUID NOT NULL,
        
        -- Record identification
        source_row_number       INTEGER,
        record_hash             VARCHAR(64), -- SHA256 for duplicate detection
        
        -- Entity classification
        entity_type             VARCHAR(50) NOT NULL,
        entity_subtype          VARCHAR(100), -- More specific classification
        
        -- Standardized data (the clean, mapped data)
        standardized_data       JSONB NOT NULL, -- Key-value pairs using standard field names
        
        -- Original data reference
        original_data           JSONB, -- Original unmapped data for audit
        
        -- Data lineage
        transformation_applied  JSONB, -- What transformations were applied
        mapping_template_id     UUID REFERENCES data_ingestion.mapping_templates(id),
        
        -- Quality and validation
        validation_status       VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'passed', 'failed', 'warning')),
        validation_errors       JSONB,
        data_quality_score      NUMERIC(5,2),
        
        -- Dashboard assignment (THE KEY FIELD!)
        target_dashboards       VARCHAR(50)[], -- Array of dashboards this record feeds
        
        -- Processing metadata
        processed_at            TIMESTAMPTZ DEFAULT NOW(),
        exported_at             TIMESTAMPTZ,
        export_status           VARCHAR(20),
        
        -- Relationships (for cross-referencing)
        related_records         UUID[], -- Array of related record IDs
        parent_record_id        UUID REFERENCES data_ingestion.processed_records(id),
        
        -- Versioning
        version_number          INTEGER DEFAULT 1,
        is_current              BOOLEAN DEFAULT TRUE,
        superseded_by           UUID REFERENCES data_ingestion.processed_records(id),
        
        created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        -- Constraints
        CONSTRAINT processed_records_quality_valid CHECK (
            data_quality_score IS NULL OR (data_quality_score >= 0 AND data_quality_score <= 100)
        ),
        UNIQUE(company_id, record_hash, version_number)
      );
    `;
    
    await sql.unsafe(createTableSQL);
    console.log('✅ Created processed_records table with exact backend schema');
    
    // Add indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_processed_records_file_id ON data_ingestion.processed_records(file_upload_id);',
      'CREATE INDEX IF NOT EXISTS idx_processed_records_company_id ON data_ingestion.processed_records(company_id);',
      'CREATE INDEX IF NOT EXISTS idx_processed_records_entity_type ON data_ingestion.processed_records(entity_type);',
      'CREATE INDEX IF NOT EXISTS idx_processed_records_target_dashboards ON data_ingestion.processed_records USING GIN(target_dashboards);',
      'CREATE INDEX IF NOT EXISTS idx_processed_records_current ON data_ingestion.processed_records(is_current) WHERE is_current = true;'
    ];
    
    for (const index of indexes) {
      await sql.unsafe(index);
    }
    console.log('✅ Added performance indexes');
    
    console.log('\n🎉 processed_records table now matches backend schema exactly!');
    console.log('\n📊 Key features:');
    console.log('   - target_dashboards[] array for dashboard assignment');
    console.log('   - record_hash for duplicate detection');
    console.log('   - original_data + standardized_data for audit trail');
    console.log('   - transformation_applied for data lineage');
    console.log('   - versioning support with is_current flag');
    
  } catch (error) {
    console.error('❌ Error updating table:', error.message);
  }
}

updateTable().catch(console.error);