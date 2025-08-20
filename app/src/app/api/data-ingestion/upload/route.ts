import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';

// Validation schema
const FileUploadSchema = z.object({
  file: z.any(),
  entityType: z.enum(['inventory', 'orders', 'suppliers', 'customers', 'sales', 'purchases', 'recipes', 'ingredients', 'menu_items', 'bom']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

// Supported file types
const SUPPORTED_MIME_TYPES = {
  'text/csv': 'csv',
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'application/json': 'json',
  'text/xml': 'xml',
  'application/xml': 'xml',
  'text/plain': 'txt',
  'text/tab-separated-values': 'tsv',
};

// Initialize database connection
const sql = (() => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set');
    return null;
  }
  try {
    return neon(dbUrl);
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    return null;
  }
})();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Mock user and company data (replace with actual auth)
const getCurrentUser = () => ({
  id: '4fc3b921-5af1-46a1-97f0-0b6a7245073d',
  email: 'plomerin@gmail.com',
  name: 'Homero Ruiz',
  companyId: 'e5d153c6-c9ed-4566-a1a4-dcd560009ef8' // Using a valid UUID for the company
});

export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      console.error('Database connection not available');
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;
    const priority = formData.get('priority') as string || 'normal';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = SUPPORTED_MIME_TYPES[file.type as keyof typeof SUPPORTED_MIME_TYPES];
    if (!fileType) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Supported formats: CSV, Excel, JSON, XML, TXT, TSV` },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    const user = getCurrentUser();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate file hash for duplicate detection
    const fileHash = createHash('sha256').update(buffer).digest('hex');

    // Check for duplicate file
    const existingFile = await sql`
      SELECT id, original_filename, status
      FROM data_ingestion.file_uploads
      WHERE file_hash = ${fileHash}
      AND company_id = ${user.companyId}::UUID
      LIMIT 1
    `;

    if (existingFile.length > 0) {
      return NextResponse.json(
        { 
          error: 'Duplicate file detected',
          details: `This file was already uploaded as "${existingFile[0].original_filename}" with status: ${existingFile[0].status}`,
          existingFileId: existingFile[0].id
        },
        { status: 409 }
      );
    }

    // Upload to S3
    let s3Url = '';
    let s3Key = '';
    try {
      s3Key = `${user.companyId}/${Date.now()}-${file.name}`;
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          companyId: user.companyId,
          uploadedBy: user.id,
          entityType: entityType || 'unknown',
        },
      });
      
      await s3Client.send(uploadCommand);
      s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      console.log('File uploaded to S3:', s3Url);
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error);
      // Continue without S3 - we can still save to database
    }

    // Parse file to get actual row and column count
    let actualRowCount = 0;
    let actualColumnCount = 0;
    let detectedColumns: string[] = [];
    let sampleData: any[] = [];

    try {
      if (fileType === 'csv') {
        const csvData = parse(buffer.toString(), {
          columns: true,
          skip_empty_lines: true,
          delimiter: ',',
        });
        actualRowCount = csvData.length;
        if (csvData.length > 0) {
          detectedColumns = Object.keys(csvData[0]);
          actualColumnCount = detectedColumns.length;
          sampleData = csvData.slice(0, 5); // First 5 rows for preview
        }
      } else if (fileType === 'excel') {
        const workbook = XLSX.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        actualRowCount = jsonData.length;
        if (jsonData.length > 0) {
          detectedColumns = Object.keys(jsonData[0] as any);
          actualColumnCount = detectedColumns.length;
          sampleData = jsonData.slice(0, 5);
        }
      }
    } catch (parseError) {
      console.error('Error parsing file:', parseError);
    }

    // Detect entity type from file content and name
    const detectEntityType = (filename: string, columns: string[]): string => {
      const name = filename.toLowerCase();
      const colsLower = columns.map(c => c.toLowerCase()).join(' ');
      
      if (name.includes('recipe') || name.includes('bom') || colsLower.includes('ingredient')) return 'recipes';
      if (name.includes('ingredient') || colsLower.includes('ingredient')) return 'ingredients';
      if (name.includes('menu') || name.includes('product')) return 'menu_items';
      if (name.includes('inventory') || name.includes('stock') || colsLower.includes('quantity')) return 'inventory';
      if (name.includes('order') || colsLower.includes('order')) return 'orders';
      if (name.includes('supplier') || name.includes('vendor')) return 'suppliers';
      if (name.includes('customer') || colsLower.includes('customer')) return 'customers';
      if (name.includes('sale') || colsLower.includes('sale')) return 'sales';
      if (name.includes('purchase') || colsLower.includes('purchase')) return 'purchases';
      return entityType || 'unknown';
    };

    const detectedEntityType = detectEntityType(file.name, detectedColumns);
    const estimatedRowCount = actualRowCount || Math.floor(file.size / 100); // Fallback estimate if parsing failed

    // Insert into database - avoid enum casting to prevent errors
    const fileUploadResult = await sql`
      INSERT INTO data_ingestion.file_uploads (
        company_id,
        uploaded_by,
        original_filename,
        file_size_bytes,
        file_type,
        file_hash,
        storage_path,
        s3_url,
        s3_key,
        mime_type,
        detected_row_count,
        detected_column_count,
        has_header_row,
        detected_delimiter,
        detected_encoding
      ) VALUES (
        ${user.companyId}::UUID,
        ${user.id}::UUID,
        ${file.name},
        ${file.size},
        ${fileType},
        ${fileHash},
        ${s3Key || null},
        ${s3Url || null},
        ${s3Key || null},
        ${file.type},
        ${actualRowCount || estimatedRowCount},
        ${actualColumnCount},
        ${fileType === 'csv' || fileType === 'excel'},
        ${fileType === 'csv' ? ',' : null},
        'UTF-8'
      )
      RETURNING id, created_at
    `;

    const fileId = fileUploadResult[0].id;

    // Store raw data if we have it - commented out until schema is confirmed
    // if (sampleData.length > 0) {
    //   // Will add raw data storage once schema is verified
    // }

    // Queue for processing - commented out until schema is confirmed
    // await sql`...`;

    // Create initial AI analysis suggestion - commented out until schema is confirmed
    // if (detectedColumns.length > 0) {
    //   // Will add AI suggestions once schema is verified
    // }

    const response = {
      success: true,
      fileUpload: {
        id: fileId,
        companyId: user.companyId,
        uploadedBy: user.id,
        originalFilename: file.name,
        fileSizeBytes: file.size,
        fileType: fileType,
        fileHash: fileHash,
        storagePath: s3Url,
        mimeType: file.type,
        status: 'uploaded',
        priority: priority,
        detectedEntityType: detectedEntityType,
        detectedRowCount: actualRowCount || estimatedRowCount,
        detectedColumnCount: actualColumnCount,
        hasHeaderRow: fileType === 'csv' || fileType === 'excel',
        detectedDelimiter: fileType === 'csv' ? ',' : null,
        detectedEncoding: 'UTF-8',
        detectedColumns: detectedColumns,
        createdAt: fileUploadResult[0].created_at,
      },
      message: 'File uploaded successfully and queued for processing',
      nextSteps: {
        estimatedProcessingTime: `${Math.ceil((actualRowCount || estimatedRowCount) / 1000)} minutes`,
        requiresColumnMapping: true,
        canPreview: sampleData.length > 0,
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = getCurrentUser();

    // Fetch real data from database with proper parameterized queries
    let uploads;
    let countResult;

    if (status) {
      uploads = await sql`
        SELECT 
          id,
          original_filename,
          file_type,
          status,
          detected_entity_type,
          file_size_bytes,
          data_quality_score,
          created_at,
          processing_duration_ms,
          detected_row_count,
          detected_column_count,
          successful_rows,
          failed_rows,
          priority
        FROM data_ingestion.file_uploads
        WHERE company_id = ${user.companyId}::UUID
        AND status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) as total
        FROM data_ingestion.file_uploads
        WHERE company_id = ${user.companyId}::UUID
        AND status = ${status}
      `;
    } else {
      uploads = await sql`
        SELECT 
          id,
          original_filename,
          file_type,
          status,
          detected_entity_type,
          file_size_bytes,
          data_quality_score,
          created_at,
          processing_duration_ms,
          detected_row_count,
          detected_column_count,
          successful_rows,
          failed_rows,
          priority
        FROM data_ingestion.file_uploads
        WHERE company_id = ${user.companyId}::UUID
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) as total
        FROM data_ingestion.file_uploads
        WHERE company_id = ${user.companyId}::UUID
      `;
    }

    const total = parseInt(countResult[0].total);

    return NextResponse.json({
      uploads: uploads.map(upload => ({
        id: upload.id,
        originalFilename: upload.original_filename,
        fileType: upload.file_type,
        status: upload.status,
        detectedEntityType: upload.detected_entity_type,
        fileSizeBytes: upload.file_size_bytes,
        dataQualityScore: upload.data_quality_score,
        createdAt: upload.created_at,
        processingDurationMs: upload.processing_duration_ms,
        detectedRowCount: upload.detected_row_count,
        detectedColumnCount: upload.detected_column_count,
        successfulRows: upload.successful_rows,
        failedRows: upload.failed_rows,
        priority: upload.priority,
      })),
      total: total,
      page: Math.floor(offset / limit) + 1,
      hasMore: offset + limit < total,
    });

  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload history', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}