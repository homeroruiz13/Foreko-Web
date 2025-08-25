import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

interface Params {
  params: Promise<{ fileId: string }>;
}

interface MappingConfirmation {
  sourceColumn: string;
  targetField: string;
  transformationType?: string;
  isUserOverride?: boolean;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { fileId } = await params;
    const body = await request.json();
    const { mappings, autoProcess = false } = body as { 
      mappings: MappingConfirmation[]; 
      autoProcess?: boolean;
    };

    // Validate file exists
    const fileResult = await sql`
      SELECT * FROM data_ingestion.file_uploads
      WHERE id = ${fileId}
    `;

    if (!fileResult || fileResult.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fileResult[0];

    // Clear existing mappings for this file
    await sql`
      DELETE FROM data_ingestion.user_column_mappings
      WHERE file_upload_id = ${fileId}
    `;

    // Store user-confirmed mappings
    for (const mapping of mappings) {
      // Get AI suggestion for this mapping if exists
      const aiSuggestion = await sql`
        SELECT confidence_score FROM data_ingestion.ai_column_detection
        WHERE file_upload_id = ${fileId}
        AND detected_column_name = ${mapping.sourceColumn}
        AND suggested_standard_field = ${mapping.targetField}
      `;

      const confidenceScore = aiSuggestion.length > 0 
        ? aiSuggestion[0].confidence_score 
        : (mapping.isUserOverride ? 100 : 80);

      await sql`
        INSERT INTO data_ingestion.user_column_mappings (
          file_upload_id,
          source_column,
          target_field,
          is_required,
          confidence_score
        ) VALUES (
          ${fileId},
          ${mapping.sourceColumn},
          ${mapping.targetField},
          false,
          ${confidenceScore}
        )
      `;

      // Store in AI learning data for future improvements
      if (!mapping.isUserOverride) {
        await sql`
          INSERT INTO data_ingestion.ai_learning_data (
            file_upload_id,
            entity_type,
            source_column_name,
            confirmed_standard_field,
            was_ai_suggestion,
            user_feedback_type,
            confidence_improvement
          ) VALUES (
            ${fileId},
            ${file.detected_entity_type},
            ${mapping.sourceColumn},
            ${mapping.targetField},
            ${aiSuggestion.length > 0},
            'confirmed',
            ${confidenceScore}
          )
        `;
      }
    }

    // Update file status
    await sql`
      UPDATE data_ingestion.file_uploads
      SET status = 'mapping_confirmed'
      WHERE id = ${fileId}
    `;

    // If autoProcess is true, trigger the processing pipeline
    if (autoProcess) {
      // Process the data with confirmed mappings
      const processResult = await processWithMappings(fileId, file, mappings);
      
      return NextResponse.json({
        success: true,
        fileId,
        mappingsConfirmed: mappings.length,
        processed: true,
        processResult
      });
    }

    return NextResponse.json({
      success: true,
      fileId,
      mappingsConfirmed: mappings.length,
      message: 'Mappings confirmed successfully. Ready for processing.'
    });

  } catch (error) {
    console.error('Error confirming mappings:', error);
    return NextResponse.json(
      { error: 'Failed to confirm mappings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function processWithMappings(fileId: string, file: any, mappings: MappingConfirmation[]) {
  try {
    // Get raw data
    const rawData = await sql`
      SELECT * FROM data_ingestion.raw_data_storage
      WHERE file_upload_id = ${fileId}
      ORDER BY row_number
    `;

    let processedCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Process each row
    for (const row of rawData) {
      const rawRowData = JSON.parse(row.raw_row_data);
      const standardizedData: any = {};
      let hasError = false;

      // Apply mappings to transform raw data
      for (const mapping of mappings) {
        const sourceValue = rawRowData[mapping.sourceColumn];
        
        // Apply transformation based on type
        let transformedValue = sourceValue;
        
        try {
          if (mapping.transformationType === 'date') {
            transformedValue = new Date(sourceValue).toISOString();
          } else if (mapping.transformationType === 'number') {
            transformedValue = parseFloat(String(sourceValue).replace(/[^0-9.-]/g, ''));
          } else if (mapping.transformationType === 'boolean') {
            transformedValue = ['true', '1', 'yes'].includes(String(sourceValue).toLowerCase());
          }
          
          standardizedData[mapping.targetField] = transformedValue;
        } catch (transformError) {
          hasError = true;
          errors.push({
            rowNumber: row.row_number,
            field: mapping.sourceColumn,
            error: 'Transformation failed',
            originalValue: sourceValue
          });
        }
      }

      if (!hasError) {
        // Generate record hash for duplicate detection
        const recordHash = require('crypto')
          .createHash('sha256')
          .update(JSON.stringify(rawRowData))
          .digest('hex');
        
        // Determine target dashboards based on entity type
        const targetDashboards = getTargetDashboards(file.detected_entity_type);
        
        // Store processed record with full schema
        await sql`
          INSERT INTO data_ingestion.processed_records (
            file_upload_id,
            company_id,
            source_row_number,
            record_hash,
            entity_type,
            standardized_data,
            original_data,
            transformation_applied,
            validation_status,
            data_quality_score,
            target_dashboards,
            processed_at
          ) VALUES (
            ${fileId},
            ${file.company_id},
            ${row.row_number},
            ${recordHash.substring(0, 64)},
            ${file.detected_entity_type},
            ${JSON.stringify(standardizedData)},
            ${JSON.stringify(rawRowData)},
            ${JSON.stringify(mappings)},
            'passed',
            ${calculateQualityScore(standardizedData)},
            ${targetDashboards},
            NOW()
          )
        `;
        processedCount++;
      } else {
        // Store error
        for (const error of errors.filter(e => e.rowNumber === row.row_number)) {
          await sql`
            INSERT INTO data_ingestion.processing_errors (
              file_upload_id,
              row_number,
              error_type,
              error_message,
              field_name,
              field_value
            ) VALUES (
              ${fileId},
              ${error.rowNumber},
              'transformation_error',
              ${error.error},
              ${error.field},
              ${error.originalValue}
            )
          `;
        }
        errorCount++;
      }
    }

    // Calculate and store quality metrics
    const totalRecords = rawData.length;
    const qualityScore = (processedCount / totalRecords) * 100;

    await sql`
      INSERT INTO data_ingestion.data_quality_metrics (
        file_upload_id,
        overall_quality_score,
        completeness_score,
        accuracy_score,
        consistency_score,
        total_records,
        valid_records,
        error_records
      ) VALUES (
        ${fileId},
        ${qualityScore},
        ${calculateCompletenessScore(processedCount, totalRecords)},
        ${calculateAccuracyScore(processedCount, errorCount)},
        95,
        ${totalRecords},
        ${processedCount},
        ${errorCount}
      )
    `;

    // Update file status
    const finalStatus = errorCount > 0 ? 'completed_with_errors' : 'completed';
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        status = ${finalStatus},
        processing_completed_at = NOW(),
        data_quality_score = ${qualityScore}
      WHERE id = ${fileId}
    `;

    // Update processing queue
    await sql`
      UPDATE data_ingestion.processing_queue
      SET 
        status = 'completed',
        completed_at = NOW(),
        actual_processing_time_ms = ${Date.now()}
      WHERE file_upload_id = ${fileId}
    `;

    return {
      processedCount,
      errorCount,
      qualityScore,
      status: finalStatus
    };

  } catch (error) {
    console.error('Error processing with mappings:', error);
    throw error;
  }
}

function calculateQualityScore(data: any): number {
  const fields = Object.keys(data);
  const nonNullFields = fields.filter(f => data[f] !== null && data[f] !== undefined && data[f] !== '');
  return (nonNullFields.length / fields.length) * 100;
}

// Dashboard assignment logic based on entity type
function getTargetDashboards(entityType: string): string[] {
  const dashboardMap: { [key: string]: string[] } = {
    'inventory': ['inventory_management', 'executive_dashboard'],
    'orders': ['order_management', 'sales_analytics', 'executive_dashboard'],
    'suppliers': ['supplier_management', 'procurement'],
    'customers': ['customer_analytics', 'crm', 'executive_dashboard'],
    'sales': ['sales_analytics', 'revenue_dashboard', 'executive_dashboard'],
    'purchases': ['procurement', 'expense_management', 'financial'],
    'recipes': ['recipe_management', 'cost_analysis'],
    'ingredients': ['inventory_management', 'recipe_management'],
    'menu_items': ['menu_management', 'sales_analytics'],
    'financial': ['financial', 'accounting', 'executive_dashboard'],
    'logistics': ['logistics', 'shipping', 'operations'],
    'shipping': ['logistics', 'shipping'],
    'accounting': ['financial', 'accounting']
  };
  
  return dashboardMap[entityType] || ['executive_dashboard'];
}

function calculateCompletenessScore(processed: number, total: number): number {
  return (processed / total) * 100;
}

function calculateAccuracyScore(processed: number, errors: number): number {
  const total = processed + errors;
  return total > 0 ? (processed / total) * 100 : 0;
}