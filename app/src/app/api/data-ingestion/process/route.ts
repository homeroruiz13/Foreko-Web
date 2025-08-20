import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function POST(request: NextRequest) {
  if (!sql) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
  }
  
  let fileId: string | undefined;
  try {
    const body = await request.json();
    fileId = body.fileId;
    
    // Update status to processing
    await sql`
      UPDATE data_ingestion.file_uploads 
      SET status = 'processing', processing_started_at = NOW()
      WHERE id = ${fileId}
    `;
    
    // Get file metadata
    const fileInfo = await sql`
      SELECT company_id, detected_entity_type, uploaded_by
      FROM data_ingestion.file_uploads
      WHERE id = ${fileId}
    `;
    
    const companyId = fileInfo[0].company_id;
    const entityType = fileInfo[0].detected_entity_type;
    
    // Get confirmed mappings
    const mappings = await sql`
      SELECT source_column_name, target_standard_field, transformation_rules
      FROM data_ingestion.user_column_mappings
      WHERE file_upload_id = ${fileId} AND user_confirmed = true
    `;
    
    // Get raw data
    const rawData = await sql`
      SELECT row_number, raw_row_data
      FROM data_ingestion.raw_data_storage
      WHERE file_upload_id = ${fileId}
      ORDER BY row_number
    `;
    
    // Get standard field definitions for validation
    const standardFields = await sql`
      SELECT field_name, data_type, validation_regex, min_value, max_value, allowed_values
      FROM data_ingestion.standard_field_definitions
      WHERE field_name = ANY(${mappings.map(m => m.target_standard_field)})
    `;
    
    // Process each row into processed_records
    let successCount = 0;
    let errorCount = 0;
    const processedRecords = [];
    
    for (const row of rawData) {
      try {
        const standardizedData: any = {};
        const transformationApplied: any = {};
        const validationErrors: any[] = [];
        
        // Apply mappings and transformations
        for (const mapping of mappings) {
          const sourceValue = row.raw_row_data[mapping.source_column_name];
          let processedValue = sourceValue;
          
          // Apply transformations
          if (mapping.transformation_rules) {
            processedValue = applyTransformation(
              sourceValue, 
              mapping.transformation_rules
            );
            transformationApplied[mapping.target_standard_field] = mapping.transformation_rules;
          }
          
          // Validate against standard field definitions
          const fieldDef = standardFields.find(f => f.field_name === mapping.target_standard_field);
          if (fieldDef) {
            const validation = validateField(processedValue, fieldDef);
            if (!validation.valid) {
              validationErrors.push({
                field: mapping.target_standard_field,
                error: validation.error
              });
            }
          }
          
          standardizedData[mapping.target_standard_field] = processedValue;
        }
        
        // Generate record hash for duplicate detection
        const recordHash = crypto
          .createHash('sha256')
          .update(JSON.stringify(standardizedData))
          .digest('hex');
        
        // Determine entity subtype based on data
        const entitySubtype = determineEntitySubtype(entityType, standardizedData);
        
        // Calculate data quality score
        const qualityScore = calculateQualityScore(
          standardizedData, 
          validationErrors.length,
          Object.keys(standardizedData).length
        );
        
        // Get target dashboards using the built-in function
        const dashboards = await sql`
          SELECT data_ingestion.assign_to_dashboards(${entityType}::data_ingestion.data_entity_type) as dashboards
        `;
        
        // Insert into processed_records
        const insertResult = await sql`
          INSERT INTO data_ingestion.processed_records (
            file_upload_id,
            company_id,
            source_row_number,
            record_hash,
            entity_type,
            entity_subtype,
            standardized_data,
            original_data,
            transformation_applied,
            validation_status,
            validation_errors,
            data_quality_score,
            target_dashboards
          ) VALUES (
            ${fileId},
            ${companyId},
            ${row.row_number},
            ${recordHash},
            ${entityType}::data_ingestion.data_entity_type,
            ${entitySubtype},
            ${standardizedData},
            ${row.raw_row_data},
            ${Object.keys(transformationApplied).length > 0 ? transformationApplied : null},
            ${validationErrors.length === 0 ? 'passed' : validationErrors.length <= 2 ? 'warning' : 'failed'},
            ${validationErrors.length > 0 ? validationErrors : null},
            ${qualityScore},
            ${dashboards[0].dashboards}
          )
          RETURNING id
        `;
        
        processedRecords.push(insertResult[0].id);
        successCount++;
        
      } catch (error) {
        errorCount++;
        console.error(`Error processing row ${row.row_number}:`, error);
        
        // Log failed row to processing_errors
        await sql`
          INSERT INTO data_ingestion.processing_errors (
            file_upload_id,
            row_number,
            error_type,
            error_message,
            raw_data
          ) VALUES (
            ${fileId},
            ${row.row_number},
            'processing_error',
            ${error instanceof Error ? error.message : 'Unknown error'},
            ${row.raw_row_data}
          )
        `;
      }
    }
    
    // Calculate overall data quality score
    const overallQualityScore = successCount > 0 
      ? (successCount / (successCount + errorCount)) * 100 
      : 0;
    
    // Update file upload status
    await sql`
      UPDATE data_ingestion.file_uploads 
      SET 
        status = ${errorCount === 0 ? 'completed' : 'completed_with_errors'},
        processing_completed_at = NOW(),
        processing_duration_ms = EXTRACT(EPOCH FROM (NOW() - processing_started_at)) * 1000,
        total_rows_processed = ${successCount + errorCount},
        successful_rows = ${successCount},
        failed_rows = ${errorCount},
        data_quality_score = ${overallQualityScore}
      WHERE id = ${fileId}
    `;
    
    // Trigger dashboard sync if needed
    if (successCount > 0) {
      await triggerDashboardSync(sql, companyId, entityType);
    }
    
    // Store cross-domain analytics if applicable
    await generateCrossDomainInsights(sql, companyId, entityType, processedRecords);
    
    return NextResponse.json({
      success: true,
      processed: successCount,
      errors: errorCount,
      qualityScore: overallQualityScore,
      recordIds: processedRecords
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    
    // Update file status to failed if fileId exists
    if (fileId) {
      await sql`
        UPDATE data_ingestion.file_uploads 
        SET 
          status = 'failed',
          error_message = ${error instanceof Error ? error.message : 'Unknown error'}
        WHERE id = ${fileId}
      `;
    }
    
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

// Helper Functions

function applyTransformation(value: any, rules: any): any {
  if (!rules || !value) return value;
  
  // Example transformations based on rule types
  if (rules.type === 'uppercase') {
    return String(value).toUpperCase();
  }
  if (rules.type === 'lowercase') {
    return String(value).toLowerCase();
  }
  if (rules.type === 'trim') {
    return String(value).trim();
  }
  if (rules.type === 'date_format' && rules.format) {
    // Parse and format date
    return new Date(value).toISOString().split('T')[0];
  }
  if (rules.type === 'number_format' && rules.decimals !== undefined) {
    return parseFloat(value).toFixed(rules.decimals);
  }
  if (rules.type === 'replace' && rules.find && rules.replace) {
    return String(value).replace(new RegExp(rules.find, 'g'), rules.replace);
  }
  
  return value;
}

function validateField(value: any, fieldDef: any): { valid: boolean; error?: string } {
  // Check data type
  if (fieldDef.data_type === 'integer' && !Number.isInteger(Number(value))) {
    return { valid: false, error: 'Value must be an integer' };
  }
  
  if (fieldDef.data_type === 'decimal' && isNaN(Number(value))) {
    return { valid: false, error: 'Value must be a number' };
  }
  
  // Check regex pattern
  if (fieldDef.validation_regex && !new RegExp(fieldDef.validation_regex).test(String(value))) {
    return { valid: false, error: 'Value does not match required pattern' };
  }
  
  // Check min/max values
  if (fieldDef.min_value !== null && Number(value) < fieldDef.min_value) {
    return { valid: false, error: `Value must be at least ${fieldDef.min_value}` };
  }
  
  if (fieldDef.max_value !== null && Number(value) > fieldDef.max_value) {
    return { valid: false, error: `Value must be at most ${fieldDef.max_value}` };
  }
  
  // Check allowed values
  if (fieldDef.allowed_values && fieldDef.allowed_values.length > 0) {
    if (!fieldDef.allowed_values.includes(String(value))) {
      return { valid: false, error: `Value must be one of: ${fieldDef.allowed_values.join(', ')}` };
    }
  }
  
  return { valid: true };
}

function determineEntitySubtype(entityType: string, data: any): string | null {
  // Determine subtype based on entity type and data content
  if (entityType === 'orders') {
    if (data.order_type === 'purchase') return 'purchase_order';
    if (data.order_type === 'sales') return 'sales_order';
    return 'standard_order';
  }
  
  if (entityType === 'inventory') {
    if (data.item_type === 'raw') return 'raw_material';
    if (data.item_type === 'finished') return 'finished_goods';
    return 'general_inventory';
  }
  
  if (entityType === 'recipes' || entityType === 'bom') {
    return 'bill_of_materials';
  }
  
  return null;
}

function calculateQualityScore(
  data: any, 
  errorCount: number, 
  totalFields: number
): number {
  // Calculate completeness
  const filledFields = Object.values(data).filter(v => v !== null && v !== '').length;
  const completeness = (filledFields / totalFields) * 100;
  
  // Calculate accuracy (based on validation errors)
  const accuracy = ((totalFields - errorCount) / totalFields) * 100;
  
  // Overall score (weighted average)
  return Math.round((completeness * 0.5 + accuracy * 0.5));
}

async function triggerDashboardSync(sql: any, companyId: string, entityType: string) {
  // Get relevant dashboards for this entity type
  const dashboards = await sql`
    SELECT dashboard_name 
    FROM data_ingestion.dashboard_registry
    WHERE ${entityType}::data_ingestion.data_entity_type = ANY(entity_types)
    AND is_active = true
  `;
  
  // Update sync status for each dashboard
  for (const dashboard of dashboards) {
    await sql`
      INSERT INTO data_ingestion.dashboard_sync_status (
        company_id,
        dashboard_type,
        next_sync_scheduled,
        sync_status
      ) VALUES (
        ${companyId},
        ${dashboard.dashboard_name},
        NOW() + INTERVAL '5 minutes',
        'pending'
      )
      ON CONFLICT (company_id, dashboard_type)
      DO UPDATE SET
        next_sync_scheduled = NOW() + INTERVAL '5 minutes',
        sync_status = 'pending'
    `;
  }
}

async function generateCrossDomainInsights(
  sql: any,
  companyId: string, 
  entityType: string,
  recordIds: string[]
) {
  // Generate insights based on the processed data
  // This is a simplified example - you'd implement more sophisticated analysis
  
  const insights = {
    recordsProcessed: recordIds.length,
    entityType: entityType,
    timestamp: new Date().toISOString(),
    patterns: []
  };
  
  // Store cross-domain analytics
  await sql`
    INSERT INTO data_ingestion.cross_domain_analytics (
      company_id,
      analysis_type,
      analysis_name,
      primary_domain,
      analysis_results,
      confidence_score,
      insights,
      potential_impact
    ) VALUES (
      ${companyId},
      'import_analysis',
      ${`Import Analysis - ${entityType}`},
      ${entityType},
      ${insights},
      85.0,
      ${insights},
      'low'
    )
  `;
}