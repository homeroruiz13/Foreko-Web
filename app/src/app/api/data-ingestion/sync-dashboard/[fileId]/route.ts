import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

interface Params {
  params: Promise<{ fileId: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { fileId } = await params;
    const body = await request.json();
    const { dashboardIds = [], syncAll = false } = body;

    // Get processed records for this file
    const processedRecords = await sql`
      SELECT * FROM data_ingestion.processed_records
      WHERE file_upload_id = ${fileId}
      AND validation_status = 'passed'
    `;

    if (!processedRecords || processedRecords.length === 0) {
      return NextResponse.json(
        { error: 'No processed records found for this file' },
        { status: 404 }
      );
    }

    // Get file info
    const fileInfo = await sql`
      SELECT * FROM data_ingestion.file_uploads
      WHERE id = ${fileId}
    `;

    if (!fileInfo || fileInfo.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fileInfo[0];
    const entityType = file.detected_entity_type;

    // Determine target dashboards
    let targetDashboards = dashboardIds;
    
    if (syncAll || targetDashboards.length === 0) {
      // Auto-determine dashboards based on entity type
      const dashboardMap: { [key: string]: string[] } = {
        'inventory': ['inventory_management', 'executive_dashboard'],
        'orders': ['order_management', 'sales_analytics', 'executive_dashboard'],
        'suppliers': ['supplier_management', 'procurement'],
        'customers': ['customer_analytics', 'crm'],
        'sales': ['sales_analytics', 'revenue_dashboard', 'executive_dashboard'],
        'purchases': ['procurement', 'expense_management'],
        'recipes': ['recipe_management', 'cost_analysis'],
        'ingredients': ['inventory_management', 'recipe_management'],
        'menu_items': ['menu_management', 'sales_analytics'],
      };
      
      targetDashboards = dashboardMap[entityType] || ['executive_dashboard'];
    }

    let syncedCount = 0;
    const syncResults = [];

    for (const dashboardId of targetDashboards) {
      try {
        // Check if dashboard exists
        const dashboard = await sql`
          SELECT * FROM data_ingestion.dashboard_registry
          WHERE dashboard_id = ${dashboardId}
        `;

        if (dashboard.length === 0) continue;

        // Sync data to appropriate operational tables based on entity type
        for (const record of processedRecords) {
          const data = JSON.parse(record.standardized_data);
          
          // Here you would insert into the actual operational tables
          // This is a simplified example - you'd map to your actual tables
          switch (entityType) {
            case 'inventory':
              // Insert into inventory table
              await syncInventoryData(data, file.company_id);
              break;
            case 'orders':
              // Insert into orders table
              await syncOrderData(data, file.company_id);
              break;
            case 'customers':
              // Insert into customers table
              await syncCustomerData(data, file.company_id);
              break;
            // Add more cases as needed
          }
          
          syncedCount++;
        }

        // Update dashboard sync status
        await sql`
          INSERT INTO data_ingestion.dashboard_sync_status (
            file_upload_id,
            dashboard_id,
            sync_status,
            records_synced,
            synced_at
          ) VALUES (
            ${fileId},
            ${dashboardId},
            'completed',
            ${syncedCount},
            NOW()
          )
          ON CONFLICT (file_upload_id, dashboard_id) 
          DO UPDATE SET
            sync_status = 'completed',
            records_synced = ${syncedCount},
            synced_at = NOW()
        `;

        syncResults.push({
          dashboardId,
          status: 'success',
          recordsSynced: syncedCount
        });

      } catch (error) {
        console.error(`Error syncing to dashboard ${dashboardId}:`, error);
        
        // Record sync failure
        await sql`
          INSERT INTO data_ingestion.dashboard_sync_status (
            file_upload_id,
            dashboard_id,
            sync_status,
            error_message,
            synced_at
          ) VALUES (
            ${fileId},
            ${dashboardId},
            'failed',
            ${error instanceof Error ? error.message : 'Sync failed'},
            NOW()
          )
          ON CONFLICT (file_upload_id, dashboard_id) 
          DO UPDATE SET
            sync_status = 'failed',
            error_message = ${error instanceof Error ? error.message : 'Sync failed'},
            synced_at = NOW()
        `;

        syncResults.push({
          dashboardId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update file status to indicate sync completion
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        status = 'synced',
        processing_completed_at = NOW()
      WHERE id = ${fileId}
    `;

    return NextResponse.json({
      success: true,
      fileId,
      totalRecords: processedRecords.length,
      syncedCount,
      dashboards: syncResults,
      message: `Successfully synced ${syncedCount} records to ${syncResults.filter(r => r.status === 'success').length} dashboards.`
    });

  } catch (error) {
    console.error('Dashboard sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync to dashboards', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper functions for syncing to operational tables
async function syncInventoryData(data: any, companyId: string) {
  // Example: Insert into your actual inventory table
  // This would map the standardized fields to your operational schema
  try {
    await sql`
      INSERT INTO inventory (
        company_id,
        item_name,
        sku_code,
        quantity,
        unit_of_measure,
        unit_cost,
        location,
        supplier_name,
        created_at
      ) VALUES (
        ${companyId},
        ${data.item_name},
        ${data.sku_code},
        ${data.quantity},
        ${data.unit_of_measure},
        ${data.unit_cost},
        ${data.location},
        ${data.supplier_name},
        NOW()
      )
      ON CONFLICT (company_id, sku_code) 
      DO UPDATE SET
        quantity = ${data.quantity},
        unit_cost = ${data.unit_cost},
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('Error syncing inventory data:', error);
    throw error;
  }
}

async function syncOrderData(data: any, companyId: string) {
  // Example: Insert into your actual orders table
  try {
    await sql`
      INSERT INTO orders (
        company_id,
        order_id,
        customer_name,
        order_date,
        item_name,
        quantity,
        unit_price,
        total_amount,
        created_at
      ) VALUES (
        ${companyId},
        ${data.order_id},
        ${data.customer_name},
        ${data.order_date},
        ${data.item_name},
        ${data.quantity},
        ${data.unit_price},
        ${data.total_amount},
        NOW()
      )
      ON CONFLICT (company_id, order_id) 
      DO UPDATE SET
        total_amount = ${data.total_amount},
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('Error syncing order data:', error);
    throw error;
  }
}

async function syncCustomerData(data: any, companyId: string) {
  // Example: Insert into your actual customers table
  try {
    await sql`
      INSERT INTO customers (
        company_id,
        customer_name,
        email,
        phone,
        address,
        created_at
      ) VALUES (
        ${companyId},
        ${data.customer_name},
        ${data.email},
        ${data.phone},
        ${data.address},
        NOW()
      )
      ON CONFLICT (company_id, email) 
      DO UPDATE SET
        phone = ${data.phone},
        address = ${data.address},
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('Error syncing customer data:', error);
    throw error;
  }
}