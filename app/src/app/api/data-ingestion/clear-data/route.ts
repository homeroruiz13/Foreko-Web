import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const getCurrentUser = () => ({
  id: '4fc3b921-5af1-46a1-97f0-0b6a7245073d',
  email: 'plomerin@gmail.com',
  name: 'Homero Ruiz',
  companyId: 'e5d153c6-c9ed-4566-a1a4-dcd560009ef8'
});

export async function DELETE(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const user = getCurrentUser();

    // Get all files for this company to delete from S3
    const files = await sql`
      SELECT s3_key, s3_url 
      FROM data_ingestion.file_uploads 
      WHERE company_id = ${user.companyId}::UUID
      AND s3_key IS NOT NULL
    `;

    console.log(`Found ${files.length} files to delete from S3`);

    // Delete files from S3
    let s3DeleteCount = 0;
    for (const file of files) {
      if (file.s3_key) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: file.s3_key,
          });
          await s3Client.send(deleteCommand);
          s3DeleteCount++;
          console.log(`Deleted from S3: ${file.s3_key}`);
        } catch (s3Error) {
          console.error(`Failed to delete from S3: ${file.s3_key}`, s3Error);
        }
      }
    }

    // Truncate all data_ingestion schema tables for complete clean slate
    const truncateResults = {
      processingErrors: 0,
      userColumnMappings: 0,
      aiMappingSuggestions: 0,
      processingQueue: 0,
      processedRecords: 0,
      fileUploads: 0
    };

    // Get all table names in data_ingestion schema first
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'data_ingestion'
      ORDER BY table_name
    `;

    console.log('Found data_ingestion tables:', tables.map(t => t.table_name));

    // Truncate each table - start with dependent tables first
    const tablesToTruncate = [
      'processing_errors',
      'user_column_mappings', 
      'ai_mapping_suggestions',
      'processing_queue',
      'processed_records',
      'file_uploads'
    ];

    for (const tableName of tablesToTruncate) {
      try {
        const result = await sql`TRUNCATE TABLE data_ingestion.${sql.unsafe(tableName)} CASCADE`;
        console.log(`Truncated data_ingestion.${tableName}`);
        truncateResults[tableName as keyof typeof truncateResults] = 1;
      } catch (error) {
        console.log(`Failed to truncate data_ingestion.${tableName}:`, error);
        // Try deleting all rows if truncate fails
        try {
          const deleteResult = await sql`DELETE FROM data_ingestion.${sql.unsafe(tableName)}`;
          console.log(`Deleted all rows from data_ingestion.${tableName}`);
          truncateResults[tableName as keyof typeof truncateResults] = 1;
        } catch (deleteError) {
          console.log(`Table data_ingestion.${tableName} doesn't exist or couldn't be cleared`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All data cleared successfully',
      details: {
        s3FilesDeleted: s3DeleteCount,
        tablesTruncated: truncateResults,
        availableTables: tables.map(t => t.table_name)
      }
    });

  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
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

    const user = getCurrentUser();

    // Get count of files to be deleted
    const fileCount = await sql`
      SELECT COUNT(*) as count 
      FROM data_ingestion.file_uploads 
      WHERE company_id = ${user.companyId}::UUID
    `;

    // Get some sample files
    const sampleFiles = await sql`
      SELECT id, original_filename, status, created_at 
      FROM data_ingestion.file_uploads 
      WHERE company_id = ${user.companyId}::UUID
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    return NextResponse.json({
      filesToDelete: parseInt(fileCount[0].count),
      sampleFiles: sampleFiles
    });

  } catch (error) {
    console.error('Error getting data info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get data info', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}