'use client';

import * as React from "react";
import { Line, LineChart, Bar, BarChart, XAxis, CartesianGrid, YAxis, PieChart, Pie, Sector, Label, Cell } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { TrendingUp, TrendingDown } from "lucide-react";
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
  ChartStyle,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrdersChartsProps {
  revenueTrend: any[];
  orderStatus: any[];
  orderSource: any;
  stockoutPrevention: any[];
  loading?: boolean;
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
}

export function OrdersCharts({ 
  revenueTrend, 
  orderStatus, 
  orderSource, 
  stockoutPrevention, 
  loading = false,
  timeRange,
  onTimeRangeChange
}: OrdersChartsProps) {
  // State for interactive pie chart
  const [activeStatus, setActiveStatus] = React.useState('all');
  const activeIndex = React.useMemo(
    () => {
      if (activeStatus === 'all') return -1;
      return orderStatus.findIndex((item) => item.name.toLowerCase() === activeStatus);
    },
    [activeStatus, orderStatus]
  );
  
  // Calculate total orders
  const totalOrders = React.useMemo(
    () => orderStatus.reduce((sum, item) => sum + item.value, 0),
    [orderStatus]
  );
  
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded mt-2" />
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <div className="aspect-auto h-[200px] w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate trend for color coding
  const calculateTrend = (data: any[]) => {
    if (!data || data.length < 2) return 'neutral';
    const lastValue = data[data.length - 1].thisYear;
    const firstValue = data[0].thisYear;
    return lastValue > firstValue ? 'up' : 'down';
  };

  const trend = calculateTrend(revenueTrend);
  const trendColor = trend === 'up' ? 'hsl(142, 76%, 36%)' : trend === 'down' ? 'hsl(0, 84%, 60%)' : 'hsl(var(--chart-1))';

  const revenueConfig = {
    thisYear: {
      label: "This Year",
      color: trendColor,
    },
    lastYear: {
      label: "Last Year",
      color: "hsl(var(--muted-foreground))",
    },
  } satisfies ChartConfig;

  const orderSourceConfig = {
    manual: {
      label: "Manual Orders",
      color: "hsl(var(--chart-1))",
    },
    ai: {
      label: "AI Orders",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const stockoutConfig = {
    rate: {
      label: "Prevention Rate",
      color: "hsl(142, 76%, 36%)",
    },
    target: {
      label: "Target",
      color: "hsl(var(--muted-foreground))",
    },
  } satisfies ChartConfig;

  const orderSourceData = [
    { name: 'Manual', value: orderSource.manual.count, fill: "hsl(var(--chart-1))" },
    { name: 'AI', value: orderSource.ai.count, fill: "hsl(var(--chart-2))" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Trend Chart */}
      <Card className="@container/card md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Revenue Trend
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : null}
          </CardTitle>
          <CardDescription>
            {timeRange === '7d' ? 'Last 7 days' : 
             timeRange === '30d' ? 'Last 30 days' : 
             timeRange === '90d' ? 'Last 90 days' : 
             'Last 12 months'}
          </CardDescription>
          <CardAction>
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-24" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="12m">12 months</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={revenueConfig} className="aspect-auto h-[200px] w-full">
            <LineChart 
              data={revenueTrend}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="month" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    formatter={(value: any) => `$${(value / 1000).toFixed(0)}k`}
                  />
                }
              />
              <Line
                dataKey="thisYear"
                type="monotone"
                stroke={trendColor}
                strokeWidth={2}
                dot={{
                  fill: trendColor,
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Order Status Distribution - Interactive Pie Chart */}
      <Card className="@container/card flex flex-col">
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Current distribution</CardDescription>
          </div>
          <Select 
            value={activeStatus} 
            onValueChange={setActiveStatus}
          >
            <SelectTrigger
              className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
              aria-label="Select status"
              size="sm"
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              <SelectItem
                value="all"
                className="rounded-lg [&_span]:flex"
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  All Orders
                </div>
              </SelectItem>
              {orderStatus.map((item) => (
                <SelectItem
                  key={item.name.toLowerCase()}
                  value={item.name.toLowerCase()}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                    {item.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-1 pt-2 pb-1">
          <ChartContainer
            config={{
              delivered: { label: "Delivered", color: "#10b981" },
              shipped: { label: "Shipped", color: "#3b82f6" },
              processing: { label: "Processing", color: "#f59e0b" },
              pending: { label: "Pending", color: "#6b7280" },
              delayed: { label: "Delayed", color: "#ef4444" },
            }}
            className="mx-auto aspect-square h-[240px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={orderStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={105}
                strokeWidth={2}
                stroke="hsl(var(--background))"
                activeIndex={activeIndex}
                activeShape={(
                  { outerRadius = 0, ...props }: PieSectorDataItem
                ) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 4} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 10}
                      innerRadius={outerRadius + 6}
                    />
                  </g>
                )}
              >
                {orderStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const displayValue = activeStatus === 'all' 
                        ? totalOrders 
                        : activeIndex >= 0 
                          ? orderStatus[activeIndex].value 
                          : totalOrders;
                      const displayLabel = activeStatus === 'all' 
                        ? 'Total' 
                        : activeIndex >= 0
                          ? orderStatus[activeIndex].name
                          : 'Orders';
                      
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy - 5}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {displayValue}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 18}
                            className="fill-muted-foreground text-xs"
                          >
                            {displayLabel}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Order Source Comparison */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Order Source</CardTitle>
          <CardDescription>Manual vs AI orders</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={orderSourceConfig} className="aspect-auto h-[200px] w-full">
            <BarChart 
              data={orderSourceData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    className="w-[150px]"
                    formatter={(value: any) => `${value} orders`}
                  />
                }
              />
              <Bar 
                dataKey="value" 
                radius={8}
                fillOpacity={0.8}
              />
            </BarChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Manual</p>
              <p className="text-lg font-semibold">{orderSource.manual.count}</p>
              <p className="text-xs text-muted-foreground">${(orderSource.manual.value / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI</p>
              <p className="text-lg font-semibold">{orderSource.ai.count}</p>
              <p className="text-xs text-muted-foreground">${(orderSource.ai.value / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stockout Prevention Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Stockout Prevention</CardTitle>
          <CardDescription>Weekly prevention rate</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={stockoutConfig} className="aspect-auto h-[200px] w-full">
            <LineChart 
              data={stockoutPrevention}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="week" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[80, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    formatter={(value: any) => `${value.toFixed(1)}%`}
                  />
                }
              />
              <Line
                dataKey="rate"
                type="monotone"
                stroke="var(--color-rate)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
              />
              <Line
                dataKey="target"
                type="monotone"
                stroke="var(--color-target)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}