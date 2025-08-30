'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { KPICards } from "./_components/kpi-cards";
import { ExecutiveCharts } from "./_components/executive-charts";
import { PurchaseOrdersTable } from "./_components/purchase-orders-table";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplierPerformanceChart } from "./_components/supplier-performance-chart";

interface KPIData {
  kpi_name: string;
  display_name: string;
  kpi_value: number;
  target_value: number;
  previous_value: number;
  unit_of_measure: string;
  good_direction: 'up' | 'down' | 'stable';
  percentage_change: number | null;
  performance: 'good' | 'poor' | 'stable';
  is_tile: boolean;
}

interface ChartData {
  date: string;
  on_time_delivery: number;
  cycle_time: number;
  supplier_score: number;
  cost_variance: number;
  on_time_target: number;
  cycle_time_target: number;
  supplier_target: number;
  cost_variance_target: number;
}

// Cache for storing data by time range
const dataCache = new Map<string, ChartData[]>();

export default function OverviewPage() {
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [chartData, setChartData] = useState<{
    '7d': ChartData[];
    '30d': ChartData[];
    '90d': ChartData[];
  }>({
    '7d': [],
    '30d': [],
    '90d': []
  });
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, getAuthParams } = useAuth();

  const fetchChartDataForRange = async (range: string) => {
    // Check cache first
    const cacheKey = `chart-${range}`;
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey)!;
    }

    const authParams = getAuthParams();
    const periodDays = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    
    const response = await fetch(`/api/executive/chart-data?period=${periodDays}&${authParams}`);
    if (!response.ok) throw new Error('Failed to fetch chart data');
    
    const data = await response.json();
    const chartData = data.chartData || [];
    
    // Cache the data
    dataCache.set(cacheKey, chartData);
    
    return chartData;
  };

  const fetchDashboardData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    try {
      if (initialLoad) {
        setLoading(true);
      }
      setError(null);
      const authParams = getAuthParams();

      // Fetch KPIs and all chart data ranges in parallel
      const [kpisResponse, data7d, data30d, data90d] = await Promise.all([
        fetch(`/api/executive/kpis?${authParams}`),
        fetchChartDataForRange('7d'),
        fetchChartDataForRange('30d'),
        fetchChartDataForRange('90d')
      ]);

      if (!kpisResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const kpisData = await kpisResponse.json();

      console.log('KPIs received:', kpisData.kpis);

      setKpis(kpisData.kpis || []);
      setChartData({
        '7d': data7d,
        '30d': data30d,
        '90d': data90d
      });
        
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 5 minutes (clear cache too)
    const interval = setInterval(() => {
      dataCache.clear();
      fetchDashboardData();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Please sign in to view the dashboard</h2>
          <button 
            onClick={() => {
              const mainAppUrl = window.location.hostname === 'hub.foreko.app' 
                ? 'https://www.foreko.app' 
                : (process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000');
              window.location.href = `${mainAppUrl}/en/sign-in`;
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-col gap-8">
      {/* KPI Cards + Supplier Performance - Top Row */}
      <section className="grid grid-cols-1 gap-4 @5xl/main:grid-cols-5">
        <div className="@5xl/main:col-span-4">
          <KPICards kpis={kpis} loading={loading} />
        </div>
        <div className="@5xl/main:col-span-1">
          <SupplierPerformanceChart data={chartData['30d']} loading={loading} />
        </div>
      </section>

      {/* Charts - 3 Additional KPIs in one row */}
      <section>
        <ExecutiveCharts 
          allData={chartData} 
          loading={loading}
        />
      </section>

      {/* Purchase Orders Table */}
      <section>
        <PurchaseOrdersTable loading={loading} />
      </section>
    </div>
  );
}