'use client';

import * as React from "react";
import { Line, LineChart, Bar, BarChart, Area, AreaChart, XAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartDataPoint {
  date: string;
  on_time_delivery: number;
  cycle_time: number;
  supplier_score: number;
  supplier_quality?: number;
  supplier_delivery?: number;
  supplier_communication?: number;
  supplier_price?: number;
  cost_variance: number;
  on_time_target: number;
  cycle_time_target: number;
  supplier_target: number;
  cost_variance_target: number;
}

interface ExecutiveChartsProps {
  data: ChartDataPoint[];
  loading?: boolean;
  onTimeRangeChange?: (range: string) => void;
  currentTimeRange?: string;
}

export function ExecutiveCharts({ allData, loading }: ExecutiveChartsProps) {
  // Independent time ranges for each chart
  const [timeRanges, setTimeRanges] = React.useState({
    onTimeDelivery: '30d',
    cycleTime: '30d',
    costVariance: '30d'
  });
  
  const handleTimeRangeChange = (chart: string, value: string) => {
    setTimeRanges(prev => ({
      ...prev,
      [chart]: value
    }));
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <div className="h-5 w-40 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded mt-2" />
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <div className="aspect-auto h-[280px] w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get data for each chart based on its time range
  const getChartData = (chartName: keyof typeof timeRanges) => {
    const range = timeRanges[chartName];
    const data = allData[range as keyof typeof allData] || [];
    return data.map(point => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  };

  const onTimeData = getChartData('onTimeDelivery');
  const cycleTimeData = getChartData('cycleTime');
  const costVarianceData = getChartData('costVariance');

  // Get latest data points for performance assessment
  const latestOnTime = onTimeData[onTimeData.length - 1] || onTimeData[0];
  const latestCycleTime = cycleTimeData[cycleTimeData.length - 1] || cycleTimeData[0];
  const latestCostVariance = costVarianceData[costVarianceData.length - 1] || costVarianceData[0];
  
  // Determine performance colors (green = good, red = bad)
  const getPerformanceColor = (value: number, target: number, higherIsBetter: boolean) => {
    const isGood = higherIsBetter ? value >= target : value <= target;
    return isGood ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"; // Green or Red
  };

  const onTimeConfig = {
    on_time_delivery: {
      label: "On-Time Delivery",
      color: getPerformanceColor(latestOnTime?.on_time_delivery || 0, latestOnTime?.on_time_target || 90, true),
    },
    on_time_target: {
      label: "Target",
      color: "hsl(var(--muted-foreground))",
    },
  } satisfies ChartConfig;

  const cycleTimeConfig = {
    cycle_time: {
      label: "Cycle Time",
      color: getPerformanceColor(latestCycleTime?.cycle_time || 0, latestCycleTime?.cycle_time_target || 7, false),
    },
    cycle_time_target: {
      label: "Target",
      color: "hsl(var(--muted-foreground))",
    },
  } satisfies ChartConfig;

  const costVarianceConfig = {
    cost_variance: {
      label: "Cost Variance",
      color: getPerformanceColor(latestCostVariance?.cost_variance || 0, latestCostVariance?.cost_variance_target || 5, false),
    },
    cost_variance_target: {
      label: "Target",
      color: "hsl(var(--muted-foreground))",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* On-Time Delivery Chart */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>On-Time Delivery Rate</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Percentage of orders delivered on time
            </span>
            <span className="@[540px]/card:hidden">On-time deliveries</span>
          </CardDescription>
          <CardAction>
            <Select value={timeRanges.onTimeDelivery} onValueChange={(v) => handleTimeRangeChange('onTimeDelivery', v)}>
              <SelectTrigger className="w-32" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={onTimeConfig} className="aspect-auto h-[280px] w-full">
            <LineChart 
              data={onTimeData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      });
                    }}
                  />
                }
              />
              <Line
                dataKey="on_time_delivery"
                type="monotone"
                stroke="var(--color-on_time_delivery)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
              />
              <Line
                dataKey="on_time_target"
                type="monotone"
                stroke="var(--color-on_time_target)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Order Cycle Time Chart */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Order Cycle Time</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Average days from order to delivery
            </span>
            <span className="@[540px]/card:hidden">Cycle time trends</span>
          </CardDescription>
          <CardAction>
            <Select value={timeRanges.cycleTime} onValueChange={(v) => handleTimeRangeChange('cycleTime', v)}>
              <SelectTrigger className="w-32" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={cycleTimeConfig} className="aspect-auto h-[280px] w-full">
            <BarChart 
              data={cycleTimeData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      });
                    }}
                  />
                }
              />
              <Bar 
                dataKey="cycle_time" 
                fill="var(--color-cycle_time)"
                radius={8}
                fillOpacity={0.8}
              />
              <Line
                dataKey="cycle_time_target"
                type="monotone"
                stroke="var(--color-cycle_time_target)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cost Variance Chart */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Cost Variance</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Percentage variance from budgeted costs
            </span>
            <span className="@[540px]/card:hidden">Cost variance</span>
          </CardDescription>
          <CardAction>
            <Select value={timeRanges.costVariance} onValueChange={(v) => handleTimeRangeChange('costVariance', v)}>
              <SelectTrigger className="w-32" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={costVarianceConfig} className="aspect-auto h-[280px] w-full">
            <AreaChart 
              data={costVarianceData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <defs>
                <linearGradient id="fillCostVariance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-cost_variance)" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="var(--color-cost_variance)" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="fillToleranceUpper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-cost_variance_target)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-cost_variance_target)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      });
                    }}
                  />
                }
              />
              <Area
                dataKey="cost_variance_target"
                type="natural"
                fill="url(#fillToleranceUpper)"
                stroke="var(--color-cost_variance_target)"
                strokeWidth={1}
                strokeDasharray="3 3"
                stackId="tolerance"
              />
              <Area
                dataKey="cost_variance"
                type="natural"
                fill="url(#fillCostVariance)"
                stroke="var(--color-cost_variance)"
                strokeWidth={3}
                stackId="variance"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}