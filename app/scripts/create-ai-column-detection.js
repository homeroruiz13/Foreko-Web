const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

async function createTable() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔧 Creating ai_column_detection table with exact backend schema...\n');
  
  try {
    // Create the exact table from backend schema
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS data_ingestion.ai_column_detection (
        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_upload_id          UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
        detected_column_name    VARCHAR(255) NOT NULL,
        column_position         INTEGER NOT NULL,
        detected_data_type      data_ingestion.column_data_type NOT NULL,
        
        -- AI Analysis
        sample_values           TEXT[],
        null_percentage         NUMERIC(5,2),
        unique_percentage       NUMERIC(5,2),
        pattern_analysis        JSONB,
        
        -- AI Suggestions
        suggested_standard_field VARCHAR(100),
        confidence_score        NUMERIC(5,2),
        suggestion_reasoning    TEXT,
        alternative_suggestions JSONB,
        
        created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        -- Constraints
        CONSTRAINT ai_column_detection_position_positive CHECK (column_position > 0),
        CONSTRAINT ai_column_detection_percentages_valid CHECK (
            (null_percentage IS NULL OR (null_percentage >= 0 AND null_percentage <= 100)) AND
            (unique_percentage IS NULL OR (unique_percentage >= 0 AND unique_percentage <= 100)) AND
            (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100))
        )
      );
    `);
    
    console.log('✅ ai_column_detection table created with exact backend schema');
    
    // Add indexes
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_ai_column_detection_file_upload 
      ON data_ingestion.ai_column_detection(file_upload_id);
      
      CREATE INDEX IF NOT EXISTS idx_ai_column_detection_confidence 
      ON data_ingestion.ai_column_detection(confidence_score DESC);
    `);
    
    console.log('✅ Indexes added');
    
    // Verify table exists
    const verification = await sql`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'data_ingestion' 
      AND table_name = 'ai_column_detection'
    `;
    
    if (verification[0].count > 0) {
      console.log('\\n🎉 ai_column_detection table verified and ready!');
      console.log('\\n📊 This table supports Step 3: Column Mapping (AI suggestions)');
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  }
}

createTable().catch(console.error);