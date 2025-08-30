// app/api/data-ingestion/analyze-opus/route.ts
// API route that uses ONLY Opus for data analysis

import { NextRequest, NextResponse } from 'next/server';
import { ClaudeMappingService } from '@/services/claude-mapping-service';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  console.log('🚀 Starting Opus-powered analysis');
  
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { fileUploadId, companyId, columns, sampleData } = body;
    
    if (!fileUploadId || !companyId || !columns || !sampleData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log(`📁 Processing file: ${fileUploadId}`);
    console.log(`🏢 Company: ${companyId}`);
    console.log(`📊 Columns: ${columns.length}`);
    console.log(`📈 Sample rows: ${sampleData.length}`);
    
    // Initialize Opus-powered Claude service
    const claudeService = new ClaudeMappingService(process.env.ANTHROPIC_API_KEY!);
    
    // Step 1: Entity Detection with Opus
    console.log('\n📍 Step 1: Entity detection with Opus...');
    const entityResult = await claudeService.detectEntityType(
      columns.map((col: string) => ({
        columnName: col,
        dataType: 'string',
        sampleValues: sampleData.slice(0, 3).map((row: any) => row[col]),
        nullPercentage: 0,
        uniquePercentage: 1
      })),
      `file_${fileUploadId}`,
      { companyId }
    );
    console.log(`✅ Entity detected: ${entityResult.entityType} (${(entityResult.confidence * 100).toFixed(0)}% confidence)`);
    
    // Step 2: Load standard fields for the detected entity type
    console.log('\n📋 Step 2: Loading standard fields...');
    const standardFields = await sql`
      SELECT 
        field_name,
        display_name,
        data_type,
        is_required,
        domain,
        common_aliases,
        example_values
      FROM data_ingestion.standard_field_definitions
      WHERE domain = ${entityResult.entityType}
         OR domain IN ('common', 'universal')
      ORDER BY domain, field_name
    `;
    console.log(`✅ Loaded ${standardFields.length} standard fields`);
    
    // Step 3: Column Mapping with Opus
    console.log('\n🗺️ Step 3: Column mapping with Opus...');
    const mappingResult = await claudeService.suggestColumnMappings(
      columns.map((col: string) => ({
        columnName: col,
        dataType: 'string',
        sampleValues: sampleData.slice(0, 5).map((row: any) => row[col]),
        nullPercentage: 0,
        uniquePercentage: 1
      })),
      entityResult.entityType,
      companyId,
      fileUploadId
    );
    console.log(`✅ Mapped ${mappingResult.length} columns`);
    
    // Step 4: Data Validation with Opus
    console.log('\n✔️ Step 4: Data validation with Opus...');
    const validationResult = await claudeService.validateAndTransformData(
      sampleData,
      mappingResult,
      entityResult.entityType
    );
    console.log(`✅ Validated data: ${validationResult.valid.length} valid, ${validationResult.errors.length} errors`);
    
    // Step 5: Store results in database
    console.log('\n💾 Step 5: Storing analysis results...');
    
    // Store entity detection
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        detected_entity_type = ${entityResult.entityType},
        entity_confidence = ${entityResult.confidence},
        processing_status = 'mapped',
        model_used = 'claude-3-opus-20240229',
        updated_at = NOW()
      WHERE id = ${fileUploadId}
    `;
    
    // Store mappings
    for (const mapping of mappingResult) {
      await sql`
        INSERT INTO data_ingestion.user_column_mappings (
          file_upload_id,
          company_id,
          source_column,
          target_field,
          mapping_confidence,
          is_confirmed,
          created_by,
          model_used
        ) VALUES (
          ${fileUploadId},
          ${companyId},
          ${mapping.sourceColumn},
          ${mapping.targetField},
          ${mapping.confidence},
          ${mapping.confidence > 0.9},
          'opus-ai',
          'claude-3-opus-20240229'
        )
        ON CONFLICT (file_upload_id, source_column)
        DO UPDATE SET
          target_field = EXCLUDED.target_field,
          mapping_confidence = EXCLUDED.mapping_confidence,
          is_confirmed = EXCLUDED.is_confirmed,
          updated_at = NOW()
      `;
    }
    
    // Store validation results
    await sql`
      INSERT INTO data_ingestion.data_quality_metrics (
        file_upload_id,
        company_id,
        total_records,
        valid_records,
        error_records,
        completeness_score,
        overall_quality_score,
        ai_model_used,
        created_at
      ) VALUES (
        ${fileUploadId},
        ${companyId},
        ${sampleData.length},
        ${validationResult.valid.length},
        ${validationResult.errors.length},
        ${validationResult.valid.length / sampleData.length},
        ${validationResult.valid.length / sampleData.length},
        'claude-3-opus-20240229',
        NOW()
      )
    `;
    
    console.log('✅ Results stored successfully');
    
    // Calculate processing metrics
    const processingTime = Date.now() - startTime;
    const estimatedTokens = (JSON.stringify(columns).length + JSON.stringify(sampleData).length) / 4;
    const estimatedCost = (estimatedTokens / 1000000) * 15 + (estimatedTokens / 1000000) * 75 * 0.2; // Rough estimate
    
    console.log(`\n📊 Processing complete in ${processingTime}ms`);
    console.log(`💰 Estimated Opus cost: $${estimatedCost.toFixed(4)}`);
    
    // Return comprehensive response
    return NextResponse.json({
      success: true,
      fileUploadId,
      results: {
        entityDetection: {
          type: entityResult.entityType,
          confidence: entityResult.confidence,
          reasoning: entityResult.reasoning
        },
        mappings: mappingResult.map(m => ({
          source: m.sourceColumn,
          target: m.targetField,
          confidence: m.confidence,
          requiresReview: m.requiresManualReview
        })),
        validation: {
          totalRecords: sampleData.length,
          validRecords: validationResult.valid.length,
          errorRecords: validationResult.errors.length,
          qualityScore: validationResult.valid.length / sampleData.length
        }
      },
      metadata: {
        model: 'claude-3-opus-20240229',
        processingTimeMs: processingTime,
        estimatedCost: estimatedCost.toFixed(4),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('❌ Opus analysis failed:', error);
    
    // Detailed error response
    let errorMessage = 'Analysis failed';
    let errorDetails = error.message;
    
    if (error.status === 404) {
      errorMessage = 'Model not found';
      errorDetails = 'The Opus model name may be incorrect. Using: claude-3-opus-20240229';
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed';
      errorDetails = 'Please check your ANTHROPIC_API_KEY';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded';
      errorDetails = 'Too many requests. Please wait and try again.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        model: 'claude-3-opus-20240229',
        timestamp: new Date().toISOString()
      },
      { status: error.status || 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    service: 'Opus Data Analysis API',
    status: 'ready',
    model: 'claude-3-opus-20240229',
    pricing: {
      input: '$15 per million tokens',
      output: '$75 per million tokens'
    },
    endpoints: {
      analyze: '/api/data-ingestion/analyze-opus'
    }
  });
}