import { NextRequest, NextResponse } from 'next/server';

interface FileProcessingStatus {
  id: string;
  status: 'uploaded' | 'analyzing' | 'mapping_required' | 'mapping_confirmed' | 'processing' | 'completed' | 'failed' | 'cancelled';
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
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Mock processing status (in real implementation, query your database)
    const mockStatus: FileProcessingStatus = {
      id: fileId,
      status: fileId === 'upload-2' ? 'mapping_required' : 'completed',
      progress: fileId === 'upload-2' ? 60 : 100,
      currentStep: fileId === 'upload-2' ? 'AI Column Detection Complete' : 'Processing Complete',
      estimatedCompletion: fileId === 'upload-2' ? new Date(Date.now() + 300000).toISOString() : undefined,
      errors: fileId === 'upload-2' ? [] : undefined,
      columnDetections: fileId === 'upload-2' ? [
        {
          columnName: 'Product Name',
          suggestedField: 'item_name',
          confidence: 95,
          dataType: 'text'
        },
        {
          columnName: 'Ingredient',
          suggestedField: 'ingredient_name', 
          confidence: 98,
          dataType: 'text'
        },
        {
          columnName: 'Qty',
          suggestedField: 'quantity',
          confidence: 92,
          dataType: 'decimal'
        },
        {
          columnName: 'Unit',
          suggestedField: 'unit_of_measure',
          confidence: 89,
          dataType: 'text'
        },
        {
          columnName: 'Cost',
          suggestedField: 'unit_cost',
          confidence: 94,
          dataType: 'currency'
        }
      ] : undefined
    };

    return NextResponse.json(mockStatus);

  } catch (error) {
    console.error('Error fetching file status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file status' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
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
      case 'confirm_mapping':
        if (!columnMappings) {
          return NextResponse.json(
            { error: 'Column mappings are required' },
            { status: 400 }
          );
        }

        // In real implementation:
        // 1. Update user_column_mappings table
        // 2. Set file status to 'mapping_confirmed'
        // 3. Queue file for processing
        // 4. Update processing_queue table

        return NextResponse.json({
          success: true,
          message: 'Column mapping confirmed. File queued for processing.',
          status: 'processing',
          estimatedCompletion: new Date(Date.now() + 180000).toISOString() // 3 minutes
        });

      case 'cancel_processing':
        // Update file status to 'cancelled'
        return NextResponse.json({
          success: true,
          message: 'File processing cancelled.',
          status: 'cancelled'
        });

      case 'retry_processing':
        // Retry failed processing
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
      { error: 'Failed to update file status' },
      { status: 500 }
    );
  }
}