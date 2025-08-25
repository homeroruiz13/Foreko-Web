import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ClaudeMappingService } from '@/services/claude-mapping-service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { parse as parseCSV } from 'papaparse';
import * as XLSX from 'xlsx';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface Params {
  params: Promise<{ fileId: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { fileId } = await params;
    
    // Get file details from database
    const fileResult = await sql`
      SELECT * FROM data_ingestion.file_uploads
      WHERE id = ${fileId}
    `;

    if (!fileResult || fileResult.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fileResult[0];

    // Update status to processing
    await sql`
      UPDATE data_ingestion.file_uploads
      SET status = 'processing',
          processing_started_at = NOW()
      WHERE id = ${fileId}
    `;

    // Fetch file from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: file.s3_key,
    });

    const s3Response = await s3Client.send(getObjectCommand);
    const fileContent = await s3Response.Body?.transformToString();

    if (!fileContent) {
      throw new Error('Failed to read file content from S3');
    }

    // Parse file based on type
    let parsedData: any[] = [];
    let columns: string[] = [];

    if (file.file_type === 'csv') {
      const parsed = parseCSV(fileContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      parsedData = parsed.data as any[];
      if (parsedData.length > 0) {
        columns = Object.keys(parsedData[0]);
      }
    } else if (file.file_type === 'excel') {
      const buffer = Buffer.from(fileContent, 'base64');
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      parsedData = XLSX.utils.sheet_to_json(worksheet);
      if (parsedData.length > 0) {
        columns = Object.keys(parsedData[0]);
      }
    }

    // Store raw data in raw_data_storage table
    let rawDataCount = 0;
    for (let i = 0; i < parsedData.length; i++) {
      const rowHash = require('crypto')
        .createHash('sha256')
        .update(JSON.stringify(parsedData[i]))
        .digest('hex').substring(0, 64);
        
      await sql`
        INSERT INTO data_ingestion.raw_data_storage (
          file_upload_id,
          company_id,
          row_number,
          raw_row_data,
          row_hash,
          is_header_row,
          processed
        ) VALUES (
          ${fileId},
          ${file.company_id},
          ${i + 1},
          ${JSON.stringify(parsedData[i])},
          ${rowHash},
          false,
          false
        )
      `;
      rawDataCount++;
    }

    // Initialize Claude service for AI analysis
    const claudeService = new ClaudeMappingService(process.env.ANTHROPIC_API_KEY!);

    // Prepare column info for Claude
    const columnInfo = columns.map(col => {
      const values = parsedData.slice(0, 100).map(row => row[col]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
      
      return {
        columnName: col,
        dataType: detectDataType(values),
        sampleValues: values.slice(0, 5),
        nullPercentage: ((values.length - nonNullValues.length) / values.length) * 100,
        uniquePercentage: (new Set(nonNullValues).size / nonNullValues.length) * 100
      };
    });

    // Use Claude to detect entity type
    const entityDetection = await claudeService.detectEntityType(
      columnInfo,
      file.original_filename,
      { companyName: 'Foreko' }
    );

    // Update file with detected entity type (removing non-existent column)
    await sql`
      UPDATE data_ingestion.file_uploads
      SET detected_entity_type = ${entityDetection.entityType}
      WHERE id = ${fileId}
    `;

    // Get column mapping suggestions from Claude
    const mappingSuggestions = await claudeService.suggestColumnMappings(
      columnInfo,
      entityDetection.entityType,
      file.company_id,
      fileId
    );

    // AI column detection results are now stored by the ClaudeMappingService

    // Add to processing queue
    await sql`
      INSERT INTO data_ingestion.processing_queue (
        file_upload_id,
        company_id,
        priority,
        status,
        entity_type,
        estimated_processing_time_ms
      ) VALUES (
        ${fileId},
        ${file.company_id},
        100,
        'queued',
        ${entityDetection.entityType},
        ${parsedData.length * 10}
      )
    `;

    // Update file status
    await sql`
      UPDATE data_ingestion.file_uploads
      SET status = 'mapping_required',
          detected_row_count = ${rawDataCount},
          detected_column_count = ${columns.length}
      WHERE id = ${fileId}
    `;

    return NextResponse.json({
      success: true,
      fileId,
      entityType: entityDetection.entityType,
      confidence: entityDetection.confidence,
      rowCount: rawDataCount,
      columnCount: columns.length,
      mappingSuggestions: mappingSuggestions.map(s => ({
        sourceColumn: s.sourceColumn,
        targetField: s.targetField,
        confidence: s.confidence,
        reasoning: s.reasoning
      })),
      message: 'File analyzed successfully. Please review and confirm column mappings.'
    });

  } catch (error) {
    console.error('Error analyzing file:', error);
    
    // Update status to failed
    if (params) {
      const { fileId } = await params;
      await sql`
        UPDATE data_ingestion.file_uploads
        SET status = 'failed',
            error_message = ${error instanceof Error ? error.message : 'Analysis failed'}
        WHERE id = ${fileId}
      `;
    }

    return NextResponse.json(
      { error: 'Failed to analyze file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to detect data type
function detectDataType(values: any[]): string {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'unknown';
  
  const allNumbers = nonNullValues.every(v => !isNaN(Number(v)));
  const allDates = nonNullValues.every(v => !isNaN(Date.parse(String(v))));
  const allBooleans = nonNullValues.every(v => 
    typeof v === 'boolean' || ['true', 'false', '1', '0'].includes(String(v).toLowerCase())
  );
  
  if (allBooleans) return 'boolean';
  if (allNumbers) {
    const hasDecimals = nonNullValues.some(v => String(v).includes('.'));
    return hasDecimals ? 'decimal' : 'integer';
  }
  if (allDates && nonNullValues.some(v => String(v).includes('-') || String(v).includes('/'))) {
    return 'date';
  }
  
  return 'text';
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { fileId } = await params;
    
    // Get analysis results
    const mappingSuggestions = await sql`
      SELECT * FROM data_ingestion.ai_column_detection
      WHERE file_upload_id = ${fileId}
      ORDER BY confidence_score DESC
    `;

    const fileInfo = await sql`
      SELECT * FROM data_ingestion.file_uploads
      WHERE id = ${fileId}
    `;

    if (!fileInfo || fileInfo.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get sample data
    const sampleData = await sql`
      SELECT * FROM data_ingestion.raw_data_storage
      WHERE file_upload_id = ${fileId}
      ORDER BY row_number
      LIMIT 10
    `;

    return NextResponse.json({
      fileInfo: fileInfo[0],
      mappingSuggestions,
      sampleData: sampleData.map(row => 
        typeof row.raw_row_data === 'string' 
          ? JSON.parse(row.raw_row_data) 
          : row.raw_row_data
      )
    });

  } catch (error) {
    console.error('Error getting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis results' },
      { status: 500 }
    );
  }
}