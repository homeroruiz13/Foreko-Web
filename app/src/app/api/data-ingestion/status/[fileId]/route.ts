import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

interface FileProcessingStatus {
  id: string;
  status: 'uploaded' | 'analyzing' | 'mapping_required' | 'review_required' | 'mapping_confirmed' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  estimatedCompletion?: string;
  errors?: Array<{
    type: string;
    message: string;
    severity: 'warning' | 'error' | 'critical';
  }>;
  columnDetections?: Array<{
    columnName: string;
    suggestedField: string;
    confidence: number;
    dataType: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Fetch real file status from database - only use columns that exist
    const fileUpload = await sql`
      SELECT 
        id,
        status,
        detected_row_count,
        detected_column_count,
        processing_started_at,
        processing_completed_at,
        processing_duration_ms,
        total_rows_processed,
        successful_rows,
        failed_rows,
        data_quality_score,
        error_message
      FROM data_ingestion.file_uploads
      WHERE id = ${fileId}
    `;

    if (fileUpload.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const file = fileUpload[0];

    // Calculate progress based on status
    const getProgress = (status: string) => {
      switch (status) {
        case 'uploaded': return 10;
        case 'analyzing': return 30;
        case 'mapping_required': return 50;
        case 'review_required': return 75;
        case 'mapping_confirmed': return 60;
        case 'processing': return 80;
        case 'completed': return 100;
        case 'completed_with_errors': return 100;
        case 'failed': return 0;
        case 'cancelled': return 0;
        default: return 0;
      }
    };

    // Get current step description
    const getCurrentStep = (status: string) => {
      switch (status) {
        case 'uploaded': return 'File uploaded successfully';
        case 'analyzing': return 'AI analyzing file structure';
        case 'mapping_required': return 'Column mapping review required';
        case 'review_required': return 'AI processed - Review results';
        case 'mapping_confirmed': return 'Column mapping confirmed';
        case 'processing': return 'Processing data';
        case 'completed': return 'Processing complete';
        case 'completed_with_errors': return 'Processing complete with errors';
        case 'failed': return 'Processing failed';
        case 'cancelled': return 'Processing cancelled';
        default: return 'Unknown status';
      }
    };

    // Fetch real AI mapping suggestions from user_column_mappings table
    let columnDetections = undefined;
    if (file.status === 'mapping_required' || file.status === 'review_required' || file.status === 'analyzing') {
      try {
        const mappings = await sql`
          SELECT 
            source_column as "columnName",
            target_field as "suggestedField", 
            confidence_score as "confidence"
          FROM data_ingestion.user_column_mappings 
          WHERE file_upload_id = ${fileId}
          ORDER BY source_column
        `;
        
        if (mappings.length > 0) {
          columnDetections = mappings.map(mapping => ({
            columnName: mapping.columnName,
            suggestedField: mapping.suggestedField,
            confidence: mapping.confidence || 80,
            dataType: 'text' // Default since we don't store this yet
          }));
        }
      } catch (error) {
        console.log('Could not fetch column mappings:', error);
        // Fallback to empty array if table doesn't exist or query fails
        columnDetections = [];
      }
    }

    // Fetch processing errors if any (with error handling for missing table)
    let errors = undefined;
    if (file.status === 'failed' || file.status === 'completed_with_errors') {
      try {
        const processingErrors = await sql`
          SELECT 
            error_type,
            error_message,
            row_number
          FROM data_ingestion.processing_errors
          WHERE file_upload_id = ${fileId}
          LIMIT 10
        `;

        errors = processingErrors.map(err => ({
          type: err.error_type,
          message: err.error_message,
          severity: err.error_type === 'critical' ? 'critical' as const : 
                 err.error_type === 'validation_error' ? 'error' as const : 'warning' as const
        }));
      } catch (error) {
        // Table might not exist yet
        console.log('Processing errors table not available');
      }
    }

    const status: FileProcessingStatus = {
      id: file.id,
      status: file.status,
      progress: getProgress(file.status),
      currentStep: getCurrentStep(file.status),
      estimatedCompletion: file.status === 'processing' && file.processing_started_at
        ? new Date(new Date(file.processing_started_at).getTime() + 180000).toISOString()
        : undefined,
      errors: errors,
      columnDetections: columnDetections
    };

    return NextResponse.json(status);

  } catch (error) {
    console.error('Error fetching file status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const { fileId } = await params;
    const body = await request.json();
    const { action, columnMappings } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'mark_completed':
        // Mark file as completed after user review
        await sql`
          UPDATE data_ingestion.file_uploads
          SET status = 'completed',
              updated_at = NOW()
          WHERE id = ${fileId}
        `;

        return NextResponse.json({
          success: true,
          message: 'File marked as completed.',
          status: 'completed'
        });

      case 'confirm_mapping':
        if (!columnMappings) {
          return NextResponse.json(
            { error: 'Column mappings are required' },
            { status: 400 }
          );
        }

        // Store user column mappings
        for (const mapping of columnMappings) {
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
              95
            )
            ON CONFLICT (file_upload_id, source_column)
            DO UPDATE SET
              target_field = ${mapping.targetField},
              confidence_score = 95
          `;
        }

        // Update file status to mapping_confirmed
        await sql`
          UPDATE data_ingestion.file_uploads
          SET status = 'mapping_confirmed',
              updated_at = NOW()
          WHERE id = ${fileId}
        `;

        // Queue file for processing
        await sql`
          UPDATE data_ingestion.processing_queue
          SET status = 'queued',
              started_at = NULL,
              completed_at = NULL,
              retry_count = 0,
              last_error = NULL
          WHERE file_upload_id = ${fileId}
        `;

        return NextResponse.json({
          success: true,
          message: 'Column mapping confirmed. File queued for processing.',
          status: 'mapping_confirmed',
          estimatedCompletion: new Date(Date.now() + 180000).toISOString()
        });

      case 'cancel_processing':
        // Update file status to 'cancelled'
        await sql`
          UPDATE data_ingestion.file_uploads
          SET status = 'cancelled',
              updated_at = NOW()
          WHERE id = ${fileId}
        `;

        // Mark processing as cancelled
        await sql`
          UPDATE data_ingestion.processing_queue
          SET status = 'cancelled',
              completed_at = NOW(),
              last_error = 'Processing cancelled by user'
          WHERE file_upload_id = ${fileId}
        `;

        return NextResponse.json({
          success: true,
          message: 'File processing cancelled.',
          status: 'cancelled'
        });

      case 'retry_processing':
        // Reset file status for retry
        await sql`
          UPDATE data_ingestion.file_uploads
          SET status = 'uploaded',
              error_message = NULL,
              processing_started_at = NULL,
              processing_completed_at = NULL,
              processing_duration_ms = NULL,
              updated_at = NOW()
          WHERE id = ${fileId}
        `;

        // Get file info for company_id
        const fileInfo = await sql`
          SELECT company_id FROM data_ingestion.file_uploads WHERE id = ${fileId}
        `;
        
        // Requeue for processing
        await sql`
          INSERT INTO data_ingestion.processing_queue (
            file_upload_id,
            company_id,
            priority,
            status,
            max_retries
          ) VALUES (
            ${fileId},
            ${fileInfo[0].company_id},
            200,
            'queued',
            3
          )
          ON CONFLICT (file_upload_id)
          DO UPDATE SET
            status = 'queued',
            retry_count = 0,
            started_at = NULL,
            completed_at = NULL,
            last_error = NULL
        `;

        return NextResponse.json({
          success: true,
          message: 'File processing restarted.',
          status: 'processing',
          estimatedCompletion: new Date(Date.now() + 300000).toISOString()
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating file status:', error);
    return NextResponse.json(
      { error: 'Failed to update file status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}