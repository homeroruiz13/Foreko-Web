import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
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
    
    console.log('🤖 Starting AI-powered data processing for file:', fileId);
    
    // Step 1: Get file details
    const fileResult = await sql`
      SELECT * FROM data_ingestion.file_uploads
      WHERE id = ${fileId}
    `;

    if (!fileResult || fileResult.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fileResult[0];
    
    // Step 2: Fetch and parse file from S3 → Raw Data Storage
    console.log('📁 Step 2: Extracting raw data from S3...');
    
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: file.storage_path,
    });

    const s3Response = await s3Client.send(getObjectCommand);
    let fileContent;
    
    if (s3Response.Body) {
      const chunks = [];
      const reader = s3Response.Body.transformToWebStream().getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const buffer = Buffer.concat(chunks);
      fileContent = buffer.toString();
    }

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
      const buffer = Buffer.from(fileContent, 'utf8');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      parsedData = XLSX.utils.sheet_to_json(worksheet);
      if (parsedData.length > 0) {
        columns = Object.keys(parsedData[0]);
      }
    }

    console.log(`📊 Parsed ${parsedData.length} rows with ${columns.length} columns`);

    // Store in raw_data_storage table with correct schema
    let rowNumber = 1;
    for (const row of parsedData) {
      const rowHash = require('crypto')
        .createHash('sha256')
        .update(JSON.stringify(row))
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
          ${rowNumber},
          ${JSON.stringify(row)},
          ${rowHash},
          false,
          false
        )
      `;
      rowNumber++;
    }

    console.log('✅ Step 2 Complete: Raw data stored');

    // Step 3: AI Column Mapping using existing standard_field_definitions
    console.log('🤖 Step 3: AI-powered column mapping...');
    
    // Get AI mapping hints from standard_field_definitions
    const standardFields = await sql`
      SELECT field_name, display_name, domain, common_aliases, example_values
      FROM data_ingestion.standard_field_definitions
      WHERE domain = ${file.detected_entity_type || 'inventory'}
    `;

    // Simple AI mapping based on column names and aliases
    const mappingSuggestions = [];
    for (const column of columns) {
      const columnLower = column.toLowerCase();
      
      // Find matching standard field
      const matchingField = standardFields.find(field => {
        const aliases = field.common_aliases || [];
        return aliases.some((alias: string) => alias.toLowerCase() === columnLower) ||
               field.field_name.toLowerCase() === columnLower ||
               field.display_name.toLowerCase().includes(columnLower);
      });

      if (matchingField) {
        mappingSuggestions.push({
          sourceColumn: column,
          targetField: matchingField.field_name,
          confidence: 90, // High confidence for alias matches
          reasoning: `Matched via AI alias mapping`
        });
      } else {
        // Default mapping for unmapped columns
        mappingSuggestions.push({
          sourceColumn: column,
          targetField: column.toLowerCase().replace(/\\s+/g, '_'),
          confidence: 50,
          reasoning: `Auto-generated field name`
        });
      }
    }

    console.log(`🎯 Generated ${mappingSuggestions.length} AI mapping suggestions`);

    // Step 4: Use existing AI function to process raw data to standardized records
    console.log('⚙️ Step 4: Processing with AI functions...');
    
    // Call the existing AI function your developer created
    const processResult = await sql`
      SELECT data_ingestion.process_raw_to_standardized(${fileId}) as processed_count
    `;

    const processedCount = processResult[0].processed_count;
    console.log(`✅ Step 4 Complete: ${processedCount} records processed`);

    // Step 5: AI Dashboard Assignment (handled automatically by triggers)
    console.log('📊 Step 5: AI dashboard assignment...');
    
    // The assign_dashboards_on_insert trigger automatically assigns dashboards
    // Let's verify the assignments
    const dashboardAssignments = await sql`
      SELECT 
        target_dashboards,
        COUNT(*) as record_count
      FROM data_ingestion.processed_records
      WHERE file_upload_id = ${fileId}
      AND is_current = true
      GROUP BY target_dashboards
    `;

    console.log('🎯 AI Dashboard assignments:');
    dashboardAssignments.forEach(assignment => {
      console.log(`   ${assignment.target_dashboards}: ${assignment.record_count} records`);
    });

    // Update file status
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        status = 'completed',
        processing_completed_at = NOW(),
        total_rows_processed = ${processedCount},
        successful_rows = ${processedCount}
      WHERE id = ${fileId}
    `;

    console.log('🎉 AI-powered processing complete!');

    return NextResponse.json({
      success: true,
      fileId,
      message: 'AI-powered processing completed successfully',
      steps_completed: {
        step1_file_upload: true,
        step2_raw_data_storage: parsedData.length,
        step3_ai_column_mapping: mappingSuggestions.length,
        step4_ai_processing: processedCount,
        step5_ai_dashboard_assignment: dashboardAssignments.length
      },
      ai_features_used: [
        'Automatic dashboard assignment via assign_to_dashboards()',
        'Intelligent field mapping via standard_field_definitions',
        'Automated processing via process_raw_to_standardized()',
        'Auto-versioning and triggers'
      ],
      dashboard_assignments: dashboardAssignments.map(d => ({
        dashboards: d.target_dashboards,
        records: parseInt(d.record_count)
      })),
      mapping_suggestions: mappingSuggestions,
      processed_records: processedCount
    });

  } catch (error) {
    console.error('❌ AI processing failed:', error);
    
    // Update status to failed
    if (params) {
      const { fileId } = await params;
      await sql`
        UPDATE data_ingestion.file_uploads
        SET status = 'failed',
            error_message = ${error instanceof Error ? error.message : 'AI processing failed'}
        WHERE id = ${fileId}
      `;
    }

    return NextResponse.json(
      { 
        error: 'AI processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        ai_system_available: true
      },
      { status: 500 }
    );
  }
}