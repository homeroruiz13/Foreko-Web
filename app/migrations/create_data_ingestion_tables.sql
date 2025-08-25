-- Create data_ingestion schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS data_ingestion;

-- 1. Raw data storage table
CREATE TABLE IF NOT EXISTS data_ingestion.raw_data_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    raw_row_data JSONB NOT NULL,
    original_format TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_upload_id, row_number)
);

-- 2. AI column detection table
CREATE TABLE IF NOT EXISTS data_ingestion.ai_column_detection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
    source_column_name TEXT NOT NULL,
    detected_data_type TEXT,
    suggested_standard_field TEXT,
    confidence_score DECIMAL(5,2),
    detection_reasoning TEXT,
    sample_values JSONB,
    alternative_suggestions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User column mappings table
CREATE TABLE IF NOT EXISTS data_ingestion.user_column_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
    source_column_name TEXT NOT NULL,
    target_standard_field TEXT NOT NULL,
    transformation_type TEXT DEFAULT 'direct',
    transformation_rules JSONB,
    is_user_override BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(5,2),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_upload_id, source_column_name)
);

-- 4. Processed records table
CREATE TABLE IF NOT EXISTS data_ingestion.processed_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
    company_id UUID NOT NULL,
    source_row_number INTEGER,
    entity_type TEXT,
    standardized_data JSONB NOT NULL,
    target_dashboards TEXT[],
    validation_status TEXT CHECK (validation_status IN ('passed', 'failed', 'warning')),
    data_quality_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Processing errors table
CREATE TABLE IF NOT EXISTS data_ingestion.processing_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
    row_number INTEGER,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    field_name TEXT,
    field_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Data quality metrics table
CREATE TABLE IF NOT EXISTS data_ingestion.data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
    overall_quality_score DECIMAL(5,2),
    completeness_score DECIMAL(5,2),
    accuracy_score DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    total_records INTEGER,
    valid_records INTEGER,
    error_records INTEGER,
    warning_records INTEGER,
    quality_checks_performed JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Processing queue table
CREATE TABLE IF NOT EXISTS data_ingestion.processing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
    company_id UUID NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    entity_type TEXT,
    estimated_processing_time_ms INTEGER,
    actual_processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 8. AI learning data table
CREATE TABLE IF NOT EXISTS data_ingestion.ai_learning_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID REFERENCES data_ingestion.file_uploads(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    source_column_name TEXT NOT NULL,
    confirmed_standard_field TEXT NOT NULL,
    was_ai_suggestion BOOLEAN DEFAULT FALSE,
    user_feedback_type TEXT CHECK (user_feedback_type IN ('confirmed', 'corrected', 'rejected')),
    confidence_improvement DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Dashboard registry table (if not exists)
CREATE TABLE IF NOT EXISTS data_ingestion.dashboard_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id TEXT UNIQUE NOT NULL,
    dashboard_name TEXT NOT NULL,
    dashboard_type TEXT,
    entity_types TEXT[],
    required_fields TEXT[],
    optional_fields TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Dashboard sync status table
CREATE TABLE IF NOT EXISTS data_ingestion.dashboard_sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_upload_id UUID NOT NULL REFERENCES data_ingestion.file_uploads(id) ON DELETE CASCADE,
    dashboard_id TEXT NOT NULL,
    sync_status TEXT CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
    records_synced INTEGER DEFAULT 0,
    error_message TEXT,
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_upload_id, dashboard_id)
);

-- 11. Standard field definitions table (if not exists)
CREATE TABLE IF NOT EXISTS data_ingestion.standard_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    field_name TEXT NOT NULL,
    display_name TEXT,
    data_type TEXT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSONB,
    default_value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_type, field_name)
);

-- 12. Mapping templates table
CREATE TABLE IF NOT EXISTS data_ingestion.mapping_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    company_id UUID,
    column_mappings JSONB NOT NULL,
    transformation_rules JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Validation rules table
CREATE TABLE IF NOT EXISTS data_ingestion.validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    field_name TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    rule_config JSONB NOT NULL,
    error_message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Export configurations table
CREATE TABLE IF NOT EXISTS data_ingestion.export_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    target_format TEXT NOT NULL,
    field_mappings JSONB,
    filter_criteria JSONB,
    schedule_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Cross domain analytics table
CREATE TABLE IF NOT EXISTS data_ingestion.cross_domain_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_name TEXT NOT NULL,
    source_entities TEXT[] NOT NULL,
    target_dashboard TEXT,
    aggregation_rules JSONB,
    calculated_metrics JSONB,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_raw_data_file_id ON data_ingestion.raw_data_storage(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_ai_detection_file_id ON data_ingestion.ai_column_detection(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_user_mappings_file_id ON data_ingestion.user_column_mappings(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_processed_records_file_id ON data_ingestion.processed_records(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_processed_records_company_id ON data_ingestion.processed_records(company_id);
CREATE INDEX IF NOT EXISTS idx_processing_errors_file_id ON data_ingestion.processing_errors(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON data_ingestion.processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_sync_status ON data_ingestion.dashboard_sync_status(file_upload_id, dashboard_id);

-- Add columns to file_uploads if they don't exist
ALTER TABLE data_ingestion.file_uploads 
ADD COLUMN IF NOT EXISTS detected_entity_type TEXT,
ADD COLUMN IF NOT EXISTS entity_detection_confidence DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_quality_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS processing_duration_ms INTEGER;

-- Insert sample standard field definitions for common entity types
INSERT INTO data_ingestion.standard_field_definitions (entity_type, field_name, display_name, data_type, is_required) VALUES
-- Inventory fields
('inventory', 'item_name', 'Item Name', 'text', true),
('inventory', 'sku_code', 'SKU Code', 'text', false),
('inventory', 'quantity', 'Quantity', 'number', true),
('inventory', 'unit_of_measure', 'Unit of Measure', 'text', true),
('inventory', 'unit_cost', 'Unit Cost', 'decimal', false),
('inventory', 'location', 'Storage Location', 'text', false),
('inventory', 'supplier_name', 'Supplier', 'text', false),
-- Orders fields
('orders', 'order_id', 'Order ID', 'text', true),
('orders', 'customer_name', 'Customer', 'text', false),
('orders', 'order_date', 'Order Date', 'date', true),
('orders', 'item_name', 'Item Name', 'text', true),
('orders', 'quantity', 'Quantity', 'number', true),
('orders', 'unit_price', 'Unit Price', 'decimal', false),
('orders', 'total_amount', 'Total Amount', 'decimal', false),
-- Customer fields
('customers', 'customer_name', 'Customer Name', 'text', true),
('customers', 'email', 'Email', 'text', false),
('customers', 'phone', 'Phone', 'text', false),
('customers', 'address', 'Address', 'text', false)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Insert sample dashboard registry entries
INSERT INTO data_ingestion.dashboard_registry (dashboard_id, dashboard_name, entity_types) VALUES
('inventory_management', 'Inventory Management', ARRAY['inventory', 'ingredients']),
('order_management', 'Order Management', ARRAY['orders']),
('customer_analytics', 'Customer Analytics', ARRAY['customers']),
('sales_analytics', 'Sales Analytics', ARRAY['sales', 'orders']),
('executive_dashboard', 'Executive Dashboard', ARRAY['inventory', 'orders', 'sales', 'customers'])
ON CONFLICT (dashboard_id) DO NOTHING;