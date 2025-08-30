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
      // Get KPIs from the pre-calculated kpi_metrics table
      const result = await sql`
        SELECT 
          km.kpi_name,
          CASE km.kpi_name
            WHEN 'stock_out_rate' THEN 'Stock-out Rate'
            WHEN 'inventory_turnover' THEN 'Inventory Turnover'
            WHEN 'perfect_fill_rate' THEN 'Perfect Fill Rate'
            WHEN 'expedite_rate' THEN 'Expedite Rate'
            WHEN 'on_time_delivery_rate' THEN 'On-Time Delivery'
            WHEN 'order_cycle_time' THEN 'Order Cycle Time'
            WHEN 'supplier_performance_score' THEN 'Supplier Performance'
            WHEN 'cost_variance' THEN 'Cost Variance'
            ELSE km.kpi_name
          END as display_name,
          km.kpi_value,
          km.target_value,
          km.previous_value,
          CASE km.kpi_name
            WHEN 'stock_out_rate' THEN '%'
            WHEN 'inventory_turnover' THEN 'x'
            WHEN 'perfect_fill_rate' THEN '%'
            WHEN 'expedite_rate' THEN '%'
            WHEN 'on_time_delivery_rate' THEN '%'
            WHEN 'order_cycle_time' THEN 'days'
            WHEN 'supplier_performance_score' THEN 'score'
            WHEN 'cost_variance' THEN '%'
            ELSE ''
          END as unit_of_measure,
          CASE km.kpi_name
            WHEN 'stock_out_rate' THEN 'down'
            WHEN 'inventory_turnover' THEN 'up'
            WHEN 'perfect_fill_rate' THEN 'up'
            WHEN 'expedite_rate' THEN 'down'
            WHEN 'on_time_delivery_rate' THEN 'up'
            WHEN 'order_cycle_time' THEN 'down'
            WHEN 'supplier_performance_score' THEN 'up'
            WHEN 'cost_variance' THEN 'down'
            ELSE 'up'
          END as good_direction,
          CASE 
            WHEN km.kpi_name IN ('stock_out_rate', 'expedite_rate', 'order_cycle_time', 'cost_variance') THEN
              CASE WHEN km.kpi_value <= km.target_value THEN 'good' ELSE 'poor' END
            ELSE  
              CASE WHEN km.kpi_value >= km.target_value THEN 'good' ELSE 'poor' END
          END as performance,
          CASE km.kpi_name
            WHEN 'stock_out_rate' THEN true
            WHEN 'inventory_turnover' THEN true
            WHEN 'perfect_fill_rate' THEN true
            WHEN 'expedite_rate' THEN true
            ELSE false
          END as is_tile,
          CASE km.kpi_name
            WHEN 'stock_out_rate' THEN 1
            WHEN 'inventory_turnover' THEN 2
            WHEN 'perfect_fill_rate' THEN 3
            WHEN 'expedite_rate' THEN 4
            WHEN 'on_time_delivery_rate' THEN 5
            WHEN 'order_cycle_time' THEN 6
            WHEN 'supplier_performance_score' THEN 7
            WHEN 'cost_variance' THEN 8
            ELSE 99
          END as sort_order,
          km.period_start,
          km.period_end,
          km.metadata
        FROM executive.kpi_metrics km
        WHERE km.company_id = ${auth.userId}
        AND km.period_type = 'monthly'
        ORDER BY 
          CASE km.kpi_name
            WHEN 'stock_out_rate' THEN 1
            WHEN 'inventory_turnover' THEN 2
            WHEN 'perfect_fill_rate' THEN 3
            WHEN 'expedite_rate' THEN 4
            WHEN 'on_time_delivery_rate' THEN 5
            WHEN 'order_cycle_time' THEN 6
            WHEN 'supplier_performance_score' THEN 7
            WHEN 'cost_variance' THEN 8
            ELSE 99
          END;
      `;
      
      // Process and return real data
      const kpis = result.map(row => ({
        kpi_name: row.kpi_name,
        display_name: row.display_name,
        kpi_value: parseFloat(row.kpi_value) || 0,
        target_value: parseFloat(row.target_value) || 0,
        previous_value: parseFloat(row.previous_value) || 0, 
        unit_of_measure: row.unit_of_measure,
        good_direction: row.good_direction,
        category: 'operational',
        is_tile: row.is_tile,
        chart_type: row.is_tile ? null : (row.sort_order === 6 ? 'bar' : row.sort_order === 7 ? 'area' : 'line'),
        sort_order: row.sort_order,
        period_start: row.period_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        period_end: row.period_end || new Date(),
        percentage_change: row.previous_value ? ((parseFloat(row.kpi_value) - parseFloat(row.previous_value)) / parseFloat(row.previous_value) * 100) : 0,
        performance: row.performance || 'stable'
      }));

      return NextResponse.json({
        kpis,
        companyId: auth.userId,
        dataSource: 'database'
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      // Return default data if database query fails  
      const defaultKpis = [
        {
          kpi_name: 'stock_out_rate',
          display_name: 'Stock-out Rate',
          kpi_value: 0,
          target_value: 5,
          previous_value: 0,
          unit_of_measure: '%',
          good_direction: 'down',
          category: 'operational',
          is_tile: true,
          chart_type: null,
          sort_order: 1,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          period_end: new Date(),
          percentage_change: 0,
          performance: 'stable'
        },
        {
          kpi_name: 'inventory_turnover',
          display_name: 'Inventory Turnover',
          kpi_value: 0,
          target_value: 12,
          previous_value: 0,
          unit_of_measure: 'x',
          good_direction: 'up',
          category: 'efficiency',
          is_tile: true,
          chart_type: null,
          sort_order: 2,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          period_end: new Date(),
          percentage_change: 0,
          performance: 'stable'
        },
        {
          kpi_name: 'perfect_fill_rate',
          display_name: 'Perfect Fill Rate',
          kpi_value: 95,
          target_value: 95,
          previous_value: 0,
          unit_of_measure: '%',
          good_direction: 'up',
          category: 'service',
          is_tile: true,
          chart_type: null,
          sort_order: 3,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          period_end: new Date(),
          percentage_change: 0,
          performance: 'stable'
        },
        {
          kpi_name: 'expedite_rate',
          display_name: 'Expedite Rate',
          kpi_value: 0,
          target_value: 10,
          previous_value: 0,
          unit_of_measure: '%',
          good_direction: 'down',
          category: 'operational',
          is_tile: true,
          chart_type: null,
          sort_order: 4,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          period_end: new Date(),
          percentage_change: 0,
          performance: 'stable'
        }
      ];

      return NextResponse.json({
        kpis: defaultKpis,
        companyId: auth.userId,
        dataSource: 'fallback_error',
        error: 'Database query failed'
      });
    }

  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}