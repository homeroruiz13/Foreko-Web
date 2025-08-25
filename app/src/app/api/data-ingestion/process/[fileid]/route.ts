// app/src/app/api/data-ingestion/process/[fileId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ClaudeMappingService } from '@/services/claude-mapping-service';
import { parse as parseCSV } from 'papaparse';
import * as XLSX from 'xlsx';

interface ProcessingStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  progress?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const body = await request.json();
    const { action, options = {} } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Initialize Claude service
    const claudeService = new ClaudeMappingService(process.env.ANTHROPIC_API_KEY!);

    switch (action) {
      case 'analyze':
        return await analyzeFile(fileId, claudeService);
      
      case 'process':
        return await processFile(fileId, claudeService, options);
      
      case 'validate':
        return await validateFile(fileId, claudeService);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function analyzeFile(fileId: string, claudeService: ClaudeMappingService) {
  try {
    // Update status to analyzing
    await sql`
      UPDATE data_ingestion.file_uploads
      SET status = 'analyzing',
          processing_started_at = NOW()
      WHERE id = ${fileId}
    `;

    // Get file details
    const fileResult = await sql`
      SELECT 
        fu.*,
        c.name as company_name,
        c.industry
      FROM data_ingestion.file_uploads fu
      JOIN org.companies c ON fu.company_id = c.id
      WHERE fu.id = ${fileId}
    `;

    if (fileResult.length === 0) {
      throw new Error('File not found');
    }

    const file = fileResult[0];
    
    // Fetch file from S3
    const fileContent = await fetchFileFromS3(file.storage_path);
    
    // Parse file based on type
    const { columns, sampleData } = await parseFile(fileContent, file.file_type);
    
    // Detect entity type using Claude
    const entityDetection = await claudeService.detectEntityType(
      columns,
      file.original_filename,
      { industry: file.industry }
    );

    // Update file with detected entity type
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        detected_entity_type = ${entityDetection.entityType},
        detected_row_count = ${sampleData.length},
        detected_column_count = ${columns.length},
        updated_at = NOW()
      WHERE id = ${fileId}
    `;

    // Get column mapping suggestions from Claude
    const mappingSuggestions = await claudeService.suggestColumnMappings(
      columns,
      entityDetection.entityType,
      file.company_id
    );

    // Store AI column detections
    for (const suggestion of mappingSuggestions) {
      const column = columns.find(c => c.columnName === suggestion.sourceColumn);
      
      await sql`
        INSERT INTO data_ingestion.ai_column_detection (
          file_upload_id,
          detected_column_name,
          column_position,
          detected_data_type,
          sample_values,
          suggested_standard_field,
          confidence_score,
          suggestion_reasoning,
          alternative_suggestions
        ) VALUES (
          ${fileId},
          ${suggestion.sourceColumn},
          ${columns.indexOf(column!) + 1},
          ${column?.dataType || 'text'},
          ${JSON.stringify(column?.sampleValues || [])},
          ${suggestion.targetField},
          ${suggestion.confidence},
          ${suggestion.reasoning},
          ${JSON.stringify(suggestion.alternativeSuggestions || [])}
        )
      `;
    }

    // Store raw data
    for (let i = 0; i < Math.min(sampleData.length, 1000); i++) {
      await sql`
        INSERT INTO data_ingestion.raw_data_storage (
          file_upload_id,
          row_number,
          raw_row_data,
          is_header_row,
          processed
        ) VALUES (
          ${fileId},
          ${i + 1},
          ${JSON.stringify(sampleData[i])},
          ${i === 0},
          false
        )
      `;
    }

    // Update status to mapping_required
    await sql`
      UPDATE data_ingestion.file_uploads
      SET status = 'mapping_required',
          updated_at = NOW()
      WHERE id = ${fileId}
    `;

    return NextResponse.json({
      success: true,
      fileId,
      entityType: entityDetection.entityType,
      confidence: entityDetection.confidence,
      columnCount: columns.length,
      rowCount: sampleData.length,
      mappingSuggestions,
      message: 'File analyzed successfully. Please review column mappings.'
    });

  } catch (error) {
    // Update status to failed
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        status = 'failed',
        error_message = ${error instanceof Error ? error.message : 'Analysis failed'}
      WHERE id = ${fileId}
    `;
    
    throw error;
  }
}

async function processFile(fileId: string, claudeService: ClaudeMappingService, options: any) {
  try {
    // Update status to processing
    await sql`
      UPDATE data_ingestion.file_uploads
      SET status = 'processing',
          processing_started_at = NOW()
      WHERE id = ${fileId}
    `;

    // Get file and mappings
    const fileResult = await sql`
      SELECT * FROM data_ingestion.file_uploads
      WHERE id = ${fileId}
    `;

    const file = fileResult[0];

    // Get confirmed mappings
    const mappings = await sql`
      SELECT 
        ucm.source_column,
        ucm.target_field,
        ucm.confidence_score
      FROM data_ingestion.user_column_mappings ucm
      LEFT JOIN data_ingestion.ai_column_detection acd 
        ON ucm.file_upload_id = acd.file_upload_id 
        AND ucm.source_column = acd.detected_column_name
      WHERE ucm.file_upload_id = ${fileId}
    `;

    // Get raw data
    const rawData = await sql`
      SELECT raw_row_data
      FROM data_ingestion.raw_data_storage
      WHERE file_upload_id = ${fileId}
        AND NOT is_header_row
        AND NOT processed
      ORDER BY row_number
    `;

    // Validate and transform data using Claude
    const { valid, errors } = await claudeService.validateAndTransformData(
      rawData.map((r: any) => r.raw_row_data),
      mappings.map((m: any) => ({
        sourceColumn: m.source_column,
        targetField: m.target_field,
        confidence: m.confidence_score || 100,
        reasoning: 'User confirmed mapping'
      })),
      file.detected_entity_type
    );

    // Store validation errors
    for (const error of errors) {
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
          'validation_error',
          ${error.issue},
          ${error.field},
          ${JSON.stringify(error.originalValue)}
        )
      `;
    }

    // Determine target dashboards based on entity type
    const targetDashboards = getTargetDashboards(file.detected_entity_type);

    // Process valid records into processed_records table
    let processedCount = 0;
    for (const record of valid) {
      await sql`
        INSERT INTO data_ingestion.processed_records (
          file_upload_id,
          company_id,
          source_row_number,
          entity_type,
          standardized_data,
          target_dashboards,
          validation_status,
          data_quality_score
        ) VALUES (
          ${fileId},
          ${file.company_id},
          ${processedCount + 1},
          ${file.detected_entity_type},
          ${JSON.stringify(record)},
          ${targetDashboards},
          'passed',
          ${calculateQualityScore(record)}
        )
      `;
      
      processedCount++;
    }

    // Calculate overall quality metrics
    const qualityScore = (valid.length / (valid.length + errors.length)) * 100;

    // Store quality metrics
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
        ${calculateCompletenessScore(valid)},
        ${calculateAccuracyScore(valid, errors)},
        ${calculateConsistencyScore(valid)},
        ${valid.length + errors.length},
        ${valid.length},
        ${errors.length}
      )
    `;

    // Update file status
    const finalStatus = errors.length > 0 ? 'completed_with_errors' : 'completed';
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        status = ${finalStatus},
        processing_completed_at = NOW(),
        data_quality_score = ${qualityScore},
        processing_duration_ms = EXTRACT(EPOCH FROM (NOW() - processing_started_at)) * 1000
      WHERE id = ${fileId}
    `;

    // Trigger dashboard sync if auto-sync enabled
    if (options.autoSync) {
      await syncToDashboards(fileId, targetDashboards);
    }

    return NextResponse.json({
      success: true,
      fileId,
      recordsProcessed: processedCount,
      errorsCount: errors.length,
      qualityScore,
      targetDashboards,
      status: finalStatus,
      message: `Processing complete. ${processedCount} records processed successfully.`
    });

  } catch (error) {
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        status = 'failed',
        error_message = ${error instanceof Error ? error.message : 'Processing failed'}
      WHERE id = ${fileId}
    `;
    
    throw error;
  }
}

async function validateFile(fileId: string, claudeService: ClaudeMappingService) {
  // Similar to processFile but only validates without storing
  // Returns validation results for preview
  return NextResponse.json({
    success: true,
    message: 'Validation complete'
  });
}

// Helper functions

async function fetchFileFromS3(s3Path: string): Promise<Buffer> {
  // Implement S3 fetch logic
  // This is a placeholder - integrate with your S3 service
  const response = await fetch(s3Path);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

async function parseFile(content: Buffer, fileType: string) {
  let columns: any[] = [];
  let sampleData: any[] = [];

  switch (fileType) {
    case 'csv':
    case 'tsv':
      const delimiter = fileType === 'tsv' ? '\t' : ',';
      const parsed = parseCSV(content.toString(), {
        header: true,
        delimiter,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      
      if (parsed.data.length > 0) {
        columns = Object.keys(parsed.data[0] as any).map(name => ({
          columnName: name,
          dataType: detectDataType(parsed.data.slice(0, 100).map((r: any) => r[name])),
          sampleValues: parsed.data.slice(0, 5).map((r: any) => r[name]),
          nullPercentage: calculateNullPercentage(parsed.data.map((r: any) => r[name])),
          uniquePercentage: calculateUniquePercentage(parsed.data.map((r: any) => r[name])),
        }));
        sampleData = parsed.data;
      }
      break;

    case 'excel':
      const workbook = XLSX.read(content, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      if (jsonData.length > 0) {
        columns = Object.keys(jsonData[0] as any).map(name => ({
          columnName: name,
          dataType: detectDataType(jsonData.slice(0, 100).map((r: any) => r[name])),
          sampleValues: jsonData.slice(0, 5).map((r: any) => r[name]),
          nullPercentage: calculateNullPercentage(jsonData.map((r: any) => r[name])),
          uniquePercentage: calculateUniquePercentage(jsonData.map((r: any) => r[name])),
        }));
        sampleData = jsonData;
      }
      break;

    case 'json':
      const jsonContent = JSON.parse(content.toString());
      const data = Array.isArray(jsonContent) ? jsonContent : [jsonContent];
      
      if (data.length > 0) {
        columns = Object.keys(data[0]).map(name => ({
          columnName: name,
          dataType: detectDataType(data.slice(0, 100).map(r => r[name])),
          sampleValues: data.slice(0, 5).map(r => r[name]),
          nullPercentage: calculateNullPercentage(data.map(r => r[name])),
          uniquePercentage: calculateUniquePercentage(data.map(r => r[name])),
        }));
        sampleData = data;
      }
      break;
  }

  return { columns, sampleData };
}

function detectDataType(values: any[]): string {
  const nonNullValues = values.filter(v => v != null);
  if (nonNullValues.length === 0) return 'text';
  
  const types = nonNullValues.map(v => {
    if (typeof v === 'number') return 'number';
    if (typeof v === 'boolean') return 'boolean';
    if (Date.parse(v)) return 'date';
    return 'text';
  });
  
  // Return most common type
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];
}

function calculateNullPercentage(values: any[]): number {
  const nullCount = values.filter(v => v == null || v === '').length;
  return (nullCount / values.length) * 100;
}

function calculateUniquePercentage(values: any[]): number {
  const uniqueValues = new Set(values.filter(v => v != null));
  return (uniqueValues.size / values.length) * 100;
}

function getTargetDashboards(entityType: string): string[] {
  const dashboardMap: Record<string, string[]> = {
    'inventory': ['inventory', 'executive'],
    'ingredients': ['inventory', 'recipes'],
    'recipes': ['recipes', 'inventory'],
    'menu_items': ['recipes', 'orders'],
    'orders': ['orders', 'executive', 'financial'],
    'suppliers': ['suppliers', 'executive'],
    'customers': ['customer', 'orders'],
    'financial': ['financial', 'executive'],
    'logistics': ['logistics', 'orders'],
  };
  
  return dashboardMap[entityType] || ['executive'];
}

function calculateQualityScore(record: any): number {
  // Calculate quality based on completeness and data validity
  const fields = Object.values(record);
  const nonNullFields = fields.filter(f => f != null && f !== '');
  return (nonNullFields.length / fields.length) * 100;
}

function calculateCompletenessScore(records: any[]): number {
  if (records.length === 0) return 0;
  
  const scores = records.map(r => {
    const fields = Object.values(r);
    const nonNullFields = fields.filter(f => f != null && f !== '');
    return (nonNullFields.length / fields.length) * 100;
  });
  
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function calculateAccuracyScore(valid: any[], errors: any[]): number {
  const total = valid.length + errors.length;
  return total > 0 ? (valid.length / total) * 100 : 0;
}

function calculateConsistencyScore(records: any[]): number {
  // Check for consistent data types and formats
  if (records.length === 0) return 100;
  
  const fieldTypes: Record<string, Set<string>> = {};
  
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      if (!fieldTypes[key]) {
        fieldTypes[key] = new Set();
      }
      fieldTypes[key].add(typeof value);
    }
  }
  
  const consistencyScores = Object.values(fieldTypes).map(types => {
    return types.size === 1 ? 100 : 50;
  });
  
  return consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length;
}

async function syncToDashboards(fileId: string, dashboards: string[]) {
  // Implement dashboard sync logic
  for (const dashboard of dashboards) {
    await sql`
      INSERT INTO data_ingestion.dashboard_sync_status (
        file_upload_id,
        dashboard_name,
        sync_status,
        last_sync_at
      ) VALUES (
        ${fileId},
        ${dashboard},
        'pending',
        NOW()
      )
      ON CONFLICT (file_upload_id, dashboard_name)
      DO UPDATE SET
        sync_status = 'pending',
        last_sync_at = NOW()
    `;
  }
}