'use client';

import { useEffect, useState } from 'react';
import { OrdersKPICards } from "./_components/orders-kpi-cards";
import { OrdersCharts } from "./_components/orders-charts";
import { OrdersTable } from "./_components/orders-table";
import { AISuggestionsPanel } from "./_components/ai-suggestions-panel";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for KPIs
const mockKPIs = [
  {
    title: "Order Fill Rate",
    value: 95.2,
    unit: "%",
    target: 95,
    change: 2.3,
    trend: "up" as const,
    subtext: "452 of 475 orders fulfilled",
    status: "good" as const
  },
  {
    title: "Average Cycle Time",
    value: 4.8,
    unit: "days",
    target: 5,
    change: -0.5,
    trend: "down" as const,
    subtext: "Median: 4.2 days",
    status: "good" as const
  },
  {
    title: "On-Time Delivery",
    value: 88.5,
    unit: "%",
    target: 90,
    change: -1.2,
    trend: "down" as const,
    subtext: "52 late deliveries",
    status: "warning" as const
  },
  {
    title: "AI Acceptance Rate",
    value: 72.3,
    unit: "%",
    target: 70,
    change: 5.1,
    trend: "up" as const,
    subtext: "98 of 135 suggestions approved",
    status: "good" as const
  }
];

// Generate mock data based on time range with realistic trends
const generateRevenueTrend = (range: string) => {
  // Random trend direction for demo
  const trendUp = Math.random() > 0.5;
  const baseValue = 50000;
  
  if (range === '7d') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      const trendFactor = trendUp ? (1 + i * 0.05) : (1 - i * 0.03);
      const noise = Math.random() * 5000 - 2500;
      return {
        month: day,
        thisYear: Math.floor(baseValue * 0.3 * trendFactor + noise),
        lastYear: Math.floor(baseValue * 0.28 * (1 + Math.random() * 0.1)),
      };
    });
  } else if (range === '30d') {
    return Array.from({ length: 10 }, (_, i) => {
      const trendFactor = trendUp ? (1 + i * 0.03) : (1 - i * 0.02);
      const noise = Math.random() * 8000 - 4000;
      return {
        month: `Day ${(i * 3) + 1}`,
        thisYear: Math.floor(baseValue * 0.4 * trendFactor + noise),
        lastYear: Math.floor(baseValue * 0.35 * (1 + Math.random() * 0.1)),
      };
    });
  } else if (range === '90d') {
    const weeks = Array.from({ length: 13 }, (_, i) => `Week ${i + 1}`);
    return weeks.map((week, i) => {
      const trendFactor = trendUp ? (1 + i * 0.02) : (1 - i * 0.015);
      const noise = Math.random() * 10000 - 5000;
      return {
        month: week.replace('Week', 'W'),
        thisYear: Math.floor(baseValue * 1.5 * trendFactor + noise),
        lastYear: Math.floor(baseValue * 1.3 * (1 + Math.random() * 0.1)),
      };
    });
  } else { // 12m
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, i) => {
      const trendFactor = trendUp ? (1 + i * 0.025) : (1 - i * 0.01);
      const seasonalFactor = 1 + Math.sin(i * Math.PI / 6) * 0.1;
      const noise = Math.random() * 15000 - 7500;
      return {
        month,
        thisYear: Math.floor(baseValue * 2 * trendFactor * seasonalFactor + noise),
        lastYear: Math.floor(baseValue * 1.8 * (1 + Math.random() * 0.15)),
      };
    });
  }
};

const mockOrderStatus = [
  { name: 'Delivered', value: 45, color: '#10b981' }, // green
  { name: 'Shipped', value: 25, color: '#3b82f6' }, // blue
  { name: 'Processing', value: 15, color: '#f59e0b' }, // amber
  { name: 'Pending', value: 10, color: '#6b7280' }, // gray
  { name: 'Delayed', value: 5, color: '#ef4444' }, // red
];

const mockOrderSource = {
  manual: { count: 312, value: 485000 },
  ai: { count: 168, value: 261000 },
};

const mockStockoutPrevention = Array.from({ length: 4 }, (_, i) => ({
  week: `W${i + 1}`,
  rate: 85 + Math.random() * 10,
  target: 90,
}));

// Mock data for orders table
const mockOrders = Array.from({ length: 25 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(3, '0')}`,
  customer: ['Acme Corp', 'Beta Inc', 'Gamma Ltd', 'Delta Co', 'Epsilon LLC'][i % 5],
  date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  status: ['Shipped', 'Processing', 'Delivered', 'Pending', 'Delayed'][i % 5],
  total: Math.floor(Math.random() * 5000) + 500,
  cycleTime: Math.floor(Math.random() * 7) + 1,
  source: Math.random() > 0.35 ? 'Manual' : 'AI',
}));

// Mock AI suggestions
const mockAISuggestions = [
  {
    id: 1,
    priority: 'high' as const,
    title: 'Order widgets - Low stock alert',
    confidence: 92,
    potentialSaving: 450,
    description: 'Stock levels for Widget A are critically low. Suggested order quantity: 500 units',
  },
  {
    id: 2,
    priority: 'high' as const,
    title: 'Reorder supplies - Trend detected',
    confidence: 87,
    potentialSaving: 280,
    description: 'Historical data suggests increased demand for Supply B next week',
  },
  {
    id: 3,
    priority: 'medium' as const,
    title: 'Bulk order opportunity',
    confidence: 79,
    potentialSaving: 320,
    description: 'Volume discount available for Product C if ordered before month end',
  },
];

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [revenueTrendData, setRevenueTrendData] = useState(() => generateRevenueTrend('30d'));

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update revenue trend data when time range changes
    setRevenueTrendData(generateRevenueTrend(selectedTimeRange));
  }, [selectedTimeRange]);

  return (
    <div className="@container/main flex flex-col gap-8">

      {/* KPI Cards - Top Row */}
      <section>
        <OrdersKPICards kpis={mockKPIs} loading={loading} />
      </section>

      {/* Charts Section - 4 Charts Grid */}
      <section>
        <OrdersCharts 
          revenueTrend={revenueTrendData}
          orderStatus={mockOrderStatus}
          orderSource={mockOrderSource}
          stockoutPrevention={mockStockoutPrevention}
          loading={loading}
          timeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
        />
      </section>

      {/* Main Content Grid - Table and AI Suggestions */}
      <section className="grid grid-cols-1 gap-6 @5xl/main:grid-cols-3 items-start">
        <div className="@5xl/main:col-span-2 max-h-[700px]">
          <OrdersTable orders={mockOrders} loading={loading} />
        </div>
        <div className="@5xl/main:col-span-1 max-h-[700px]">
          <AISuggestionsPanel suggestions={mockAISuggestions} loading={loading} />
        </div>
      </section>
    </div>
  );
}