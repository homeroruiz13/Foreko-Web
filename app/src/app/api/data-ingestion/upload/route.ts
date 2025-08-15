import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { z } from 'zod';

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

// Mock user and company data (replace with actual auth)
const getCurrentUser = () => ({
  id: '4fc3b921-5af1-46a1-97f0-0b6a7245073d',
  email: 'plomerin@gmail.com',
  name: 'Homero Ruiz',
  companyId: 'company-123'
});

export async function POST(request: NextRequest) {
  try {
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

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', user.companyId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadDir, filename);

    // Save file to disk
    await writeFile(filepath, buffer);

    // Simulate initial file analysis (in real implementation, this would be more sophisticated)
    const detectEntityType = (filename: string, mimeType: string): string => {
      const name = filename.toLowerCase();
      if (name.includes('recipe') || name.includes('bom')) return 'recipes';
      if (name.includes('ingredient')) return 'ingredients';
      if (name.includes('menu') || name.includes('product')) return 'menu_items';
      if (name.includes('inventory') || name.includes('stock')) return 'inventory';
      if (name.includes('order')) return 'orders';
      if (name.includes('supplier') || name.includes('vendor')) return 'suppliers';
      if (name.includes('customer')) return 'customers';
      if (name.includes('sale')) return 'sales';
      if (name.includes('purchase')) return 'purchases';
      return entityType || 'unknown';
    };

    // Basic file analysis (this would be more sophisticated in real implementation)
    const detectedEntityType = detectEntityType(file.name, file.type);
    const estimatedRowCount = Math.floor(file.size / 100); // Rough estimate
    const hasHeaderRow = fileType === 'csv' || fileType === 'excel';

    // Create file upload record (in real implementation, this would use your database)
    const fileUploadRecord = {
      id: crypto.randomUUID(),
      companyId: user.companyId,
      uploadedBy: user.id,
      originalFilename: file.name,
      fileSizeBytes: file.size,
      fileType: fileType,
      fileHash: fileHash,
      storagePath: filepath,
      mimeType: file.type,
      status: 'uploaded',
      priority: priority,
      detectedEntityType: detectedEntityType,
      detectedRowCount: estimatedRowCount,
      detectedColumnCount: null, // Would be determined during processing
      hasHeaderRow: hasHeaderRow,
      detectedDelimiter: fileType === 'csv' ? ',' : null,
      detectedEncoding: 'UTF-8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real implementation, you would:
    // 1. Insert into data_ingestion.file_uploads table
    // 2. Queue the file for AI analysis
    // 3. Start column detection process
    // 4. Create processing queue entry

    // Mock response that matches your schema
    const response = {
      success: true,
      fileUpload: fileUploadRecord,
      message: 'File uploaded successfully and queued for processing',
      nextSteps: {
        estimatedProcessingTime: `${Math.ceil(estimatedRowCount / 1000)} minutes`,
        requiresColumnMapping: true,
        canPreview: true,
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    const user = getCurrentUser();

    // Mock file upload history (in real implementation, query data_ingestion.file_uploads)
    const mockUploads = [
      {
        id: 'upload-1',
        originalFilename: 'inventory_sample.csv',
        fileType: 'csv',
        status: 'completed',
        detectedEntityType: 'inventory',
        fileSizeBytes: 15420,
        dataQualityScore: 92.5,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        processingDurationMs: 2340,
      },
      {
        id: 'upload-2',
        originalFilename: 'recipes_export.xlsx',
        fileType: 'excel',
        status: 'mapping_required',
        detectedEntityType: 'recipes',
        fileSizeBytes: 87234,
        dataQualityScore: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        processingDurationMs: null,
      }
    ];

    return NextResponse.json({
      uploads: mockUploads,
      total: mockUploads.length,
      page: 1,
      hasMore: false,
    });

  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload history' },
      { status: 500 }
    );
  }
}