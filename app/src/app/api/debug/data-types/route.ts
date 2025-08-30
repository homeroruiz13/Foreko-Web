import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get auth from request
    const auth = getAuthFromRequest(request);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Get overview of all data types
      const result = await sql`
        SELECT 
          entity_type,
          entity_subtype,
          COUNT(*) as record_count,
          COUNT(DISTINCT file_upload_id) as file_count,
          array_agg(DISTINCT COALESCE(
            standardized_data->>'order_number',
            standardized_data->>'po_number',
            standardized_data->>'item_name',
            standardized_data->>'ingredient_name',
            standardized_data->>'product_name',
            standardized_data->>'customer_name',
            standardized_data->>'supplier_name',
            'Unknown'
          )) as sample_identifiers
        FROM data_ingestion.processed_records pr
        WHERE pr.company_id = ${auth.userId}
          AND pr.is_current = true
        GROUP BY entity_type, entity_subtype
        ORDER BY record_count DESC
      `;

      // Get sample data from each entity type
      const sampleData = await sql`
        SELECT 
          entity_type,
          jsonb_object_keys(standardized_data) as field_names,
          COUNT(*) as field_count
        FROM data_ingestion.processed_records pr
        WHERE pr.company_id = ${auth.userId}
          AND pr.is_current = true
        GROUP BY entity_type, jsonb_object_keys(standardized_data)
        ORDER BY entity_type, field_count DESC
      `;

      return NextResponse.json({
        entitySummary: result,
        fieldBreakdown: sampleData,
        companyId: auth.userId
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        error: 'Database query failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data types', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}