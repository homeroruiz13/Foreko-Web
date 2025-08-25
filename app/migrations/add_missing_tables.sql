-- Add missing tables that weren't created by the main migrations

-- 1. Processing errors table (referenced in status endpoint)
CREATE TABLE IF NOT EXISTS data_ingestion.processing_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
    row_number INTEGER,
    error_type VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    field_name VARCHAR(255),
    field_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Data quality metrics table
CREATE TABLE IF NOT EXISTS data_ingestion.data_quality_metrics (
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

-- 3. Processing queue table
CREATE TABLE IF NOT EXISTS data_ingestion.processing_queue (
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

-- 4. Rename ai_column_detection if it exists with different name
DO $$ 
BEGIN
    -- Check if the old table exists and rename it
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'data_ingestion' AND tablename = 'column_detections') THEN
        ALTER TABLE data_ingestion.column_detections RENAME TO ai_column_detection;
    END IF;
END $$;

-- Create ai_column_detection if it doesn't exist
CREATE TABLE IF NOT EXISTS data_ingestion.ai_column_detection (
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_processing_errors_file_id ON data_ingestion.processing_errors(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_data_quality_file_id ON data_ingestion.data_quality_metrics(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON data_ingestion.processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_processing_queue_file_id ON data_ingestion.processing_queue(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_ai_column_detection_file_id ON data_ingestion.ai_column_detection(file_upload_id);