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

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    try {
      // Get total count from executive.purchase_orders
      const countResult = await sql`
        SELECT COUNT(*) as total
        FROM executive.purchase_orders po
        WHERE po.company_id = ${auth.userId};
      `;
      
      const totalRecords = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalRecords / limit);
      
      // Get real data from executive.purchase_orders with related data
      const result = await sql`
        SELECT 
          po.id,
          po.po_number,
          s.supplier_name as supplier_name,
          s.contact_email as supplier_email,
          s.contact_phone as supplier_phone,
          po.status,
          CASE 
            WHEN po.status = 'delivered' THEN 'Delivered'
            WHEN po.status = 'in_transit' THEN 'In Transit'
            WHEN po.status = 'confirmed' THEN 'Confirmed'
            WHEN po.status = 'delayed' THEN 'Delayed'
            WHEN po.status = 'cancelled' THEN 'Cancelled'
            ELSE 'Pending'
          END as status_display,
          po.order_date,
          po.expected_delivery_date as est_delivery_date,
          po.actual_delivery_date,
          po.total_amount as order_total,
          po.currency,
          po.is_expedited,
          CASE 
            WHEN po.is_expedited = true THEN 'High'
            ELSE 'Normal'
          END as priority_level,
          CASE 
            WHEN po.status = 'delivered' THEN 0
            WHEN po.expected_delivery_date IS NOT NULL THEN
              CASE 
                WHEN po.expected_delivery_date < CURRENT_DATE THEN 
                  CURRENT_DATE - po.expected_delivery_date
                ELSE 
                  po.expected_delivery_date - CURRENT_DATE
              END
            ELSE 7
          END as days_until_delivery,
          CASE 
            WHEN po.status = 'delivered' THEN 100
            WHEN po.status = 'in_transit' THEN 75
            WHEN po.status = 'confirmed' THEN 50
            ELSE 25
          END as completion_percentage,
          po.created_at,
          (
            SELECT STRING_AGG(DISTINCT c.component_name, ', ')
            FROM executive.purchase_order_items poi
            JOIN executive.components c ON poi.component_id = c.id
            WHERE poi.purchase_order_id = po.id
          ) as product_name,
          (
            SELECT STRING_AGG(DISTINCT c.category, ', ')
            FROM executive.purchase_order_items poi
            JOIN executive.components c ON poi.component_id = c.id
            WHERE poi.purchase_order_id = po.id
          ) as product_category,
          (
            SELECT SUM(poi.quantity_ordered)
            FROM executive.purchase_order_items poi
            WHERE poi.purchase_order_id = po.id
          ) as quantity,
          (
            SELECT COUNT(*)
            FROM executive.purchase_order_items poi
            WHERE poi.purchase_order_id = po.id
          ) as line_items_count
        FROM executive.purchase_orders po
        LEFT JOIN executive.suppliers s ON po.supplier_id = s.id
        WHERE po.company_id = ${auth.userId}
        ORDER BY 
          CASE 
            WHEN po.status = 'delayed' THEN 1
            WHEN po.status = 'in_transit' THEN 2
            WHEN po.status = 'confirmed' THEN 3
            WHEN po.status = 'pending' THEN 4
            ELSE 5
          END,
          po.expected_delivery_date ASC NULLS LAST
        LIMIT ${limit} OFFSET ${offset};
      `;
      
      // Process and return real data with pagination info
      const purchaseOrders = result.map(row => ({
        id: row.id,
        po_number: row.po_number || 'N/A',
        product_name: row.product_name || 'Various Items',
        product_category: row.product_category || 'General',
        unit_price: 0, // Not available at PO level
        quantity: parseInt(row.quantity) || 0,
        unit_of_measure: 'EA',
        est_delivery_date: row.est_delivery_date ? new Date(row.est_delivery_date).toISOString().split('T')[0] : null,
        actual_delivery_date: row.actual_delivery_date ? new Date(row.actual_delivery_date).toISOString().split('T')[0] : null,
        status: row.status,
        status_display: row.status_display,
        supplier_name: row.supplier_name || 'Unknown Supplier',
        supplier_email: row.supplier_email || '',
        supplier_phone: row.supplier_phone || '',
        line_total: parseFloat(row.order_total) || 0,
        currency: row.currency || 'USD',
        order_total: parseFloat(row.order_total) || 0,
        days_until_delivery: row.days_until_delivery ? parseInt(row.days_until_delivery) : null,
        is_expedited: Boolean(row.is_expedited),
        priority_level: row.priority_level || 'Normal',
        completion_percentage: parseInt(row.completion_percentage) || 0,
        order_date: row.order_date ? new Date(row.order_date).toISOString().split('T')[0] : null,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        line_items_count: parseInt(row.line_items_count) || 1
      }));

      return NextResponse.json({
        data: purchaseOrders,
        total: totalRecords,
        purchaseOrders,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        companyId: auth.userId,
        dataSource: 'database'
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      // Return empty array if database query fails
      return NextResponse.json({
        data: [],
        total: 0,
        purchaseOrders: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalRecords: 0,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false
        },
        companyId: auth.userId,
        dataSource: 'fallback_error',
        error: 'Database query failed'
      });
    }

  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}