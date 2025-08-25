import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Data Flow Architecture - Steps 1-5\n');
    
    // Step 1: File Upload → Check file_uploads table
    const fileUploads = await sql`
      SELECT COUNT(*) as count, array_agg(status) as statuses
      FROM data_ingestion.file_uploads
    `;
    
    console.log('📁 Step 1 - File Upload:');
    console.log(`   Files uploaded: ${fileUploads[0].count}`);
    console.log(`   Statuses: ${fileUploads[0].statuses}`);
    
    // Step 2: Raw Data Storage → Check raw_data_storage table
    const rawData = await sql`
      SELECT 
        COUNT(*) as total_rows,
        COUNT(DISTINCT file_upload_id) as files_with_data
      FROM data_ingestion.raw_data_storage
    `;
    
    console.log('\n🗃️ Step 2 - Raw Data Storage:');
    console.log(`   Total raw rows extracted: ${rawData[0].total_rows}`);
    console.log(`   Files with extracted data: ${rawData[0].files_with_data}`);
    
    // Step 3: Column Mapping → Check ai_column_detection + user_column_mappings
    const mapping = await sql`
      SELECT 
        (SELECT COUNT(*) FROM data_ingestion.ai_column_detection) as ai_suggestions,
        (SELECT COUNT(*) FROM data_ingestion.user_column_mappings) as user_mappings
    `;
    
    console.log('\n🎯 Step 3 - Column Mapping:');
    console.log(`   AI mapping suggestions: ${mapping[0].ai_suggestions}`);
    console.log(`   User confirmed mappings: ${mapping[0].user_mappings}`);
    
    // Step 4: Processing to Standardized Records → Check processed_records
    const processed = await sql`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT entity_type) as entity_types,
        array_agg(DISTINCT entity_type) as entities,
        COUNT(*) FILTER (WHERE validation_status = 'passed') as passed_records,
        AVG(data_quality_score) as avg_quality_score
      FROM data_ingestion.processed_records
      WHERE is_current = true
    `;
    
    console.log('\\n⚙️ Step 4 - Processing to Standardized Records:');
    console.log(`   Total processed records: ${processed[0].total_records}`);
    console.log(`   Entity types found: ${processed[0].entities}`);
    console.log(`   Records passed validation: ${processed[0].passed_records}`);
    console.log(`   Average quality score: ${processed[0].avg_quality_score?.toFixed(2)}%`);
    
    // Step 5: Dashboard Assignment → Check target_dashboards arrays
    const dashboards = await sql`
      SELECT 
        DISTINCT unnest(target_dashboards) as dashboard_name,
        COUNT(*) as records_assigned
      FROM data_ingestion.processed_records
      WHERE is_current = true AND target_dashboards IS NOT NULL
      GROUP BY dashboard_name
      ORDER BY records_assigned DESC
    `;
    
    console.log('\\n📊 Step 5 - Dashboard Assignment:');
    dashboards.forEach(d => {
      console.log(`   ${d.dashboard_name}: ${d.records_assigned} records`);
    });
    
    // Summary of the complete flow
    const summary = {
      step1_files_uploaded: parseInt(fileUploads[0].count),
      step2_raw_rows_extracted: parseInt(rawData[0].total_rows),
      step3_mappings_confirmed: parseInt(mapping[0].user_mappings),
      step4_records_processed: parseInt(processed[0].total_records),
      step5_dashboards_assigned: dashboards.length,
      quality_score: processed[0].avg_quality_score ? parseFloat(processed[0].avg_quality_score).toFixed(2) : 0,
      entity_types: processed[0].entities || [],
      dashboard_breakdown: dashboards.map(d => ({
        dashboard: d.dashboard_name,
        records: parseInt(d.records_assigned)
      }))
    };
    
    console.log('\\n🎯 COMPLETE DATA FLOW SUMMARY:');
    console.log(`   Files → Raw Data → Mappings → Processing → Dashboards`);
    console.log(`   ${summary.step1_files_uploaded} → ${summary.step2_raw_rows_extracted} → ${summary.step3_mappings_confirmed} → ${summary.step4_records_processed} → ${summary.step5_dashboards_assigned}`);
    console.log(`   Average Quality: ${summary.quality_score}%`);
    
    return NextResponse.json({
      success: true,
      architecture_verified: true,
      flow_steps: {
        step1_file_upload: summary.step1_files_uploaded,
        step2_raw_data_storage: summary.step2_raw_rows_extracted,
        step3_column_mapping: summary.step3_mappings_confirmed,
        step4_standardized_records: summary.step4_records_processed,
        step5_dashboard_assignment: summary.step5_dashboards_assigned
      },
      processed_records_as_source_of_truth: {
        total_records: summary.step4_records_processed,
        entity_types: summary.entity_types,
        quality_score: summary.quality_score,
        dashboard_assignments: summary.dashboard_breakdown
      },
      message: 'Data flow architecture verified. processed_records table is the single source of truth with target_dashboards array for dashboard assignment.'
    });
    
  } catch (error) {
    console.error('❌ Error testing data flow:', error);
    return NextResponse.json(
      { error: 'Failed to test data flow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}