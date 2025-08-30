'use client';

import * as React from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  date: string;
  supplier_score: number;
  supplier_quality?: number;
  supplier_delivery?: number;
  supplier_communication?: number;
  supplier_price?: number;
}

interface SupplierPerformanceChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

export function SupplierPerformanceChart({ data, loading }: SupplierPerformanceChartProps) {
  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardFooter>
          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
        </CardFooter>
      </Card>
    );
  }

  // Format data for charts
  const formattedData = data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Get latest data point for performance assessment
  const latestData = formattedData[formattedData.length - 1] || formattedData[0];

  const totalScore = Math.round(
    ((latestData?.supplier_quality || 87) +
    (latestData?.supplier_delivery || 82) +
    (latestData?.supplier_communication || 86) +
    (latestData?.supplier_price || 84)) / 4
  );

  const current = latestData?.supplier_score || 85;
  const previous = formattedData[formattedData.length - 8]?.supplier_score || 83;
  const change = ((current - previous) / previous * 100).toFixed(1);
  const isPositive = current >= previous;
  const isGood = totalScore >= 85;

  return (
    <Card className={`@container/card transition-colors border-l-4 ${
      isGood 
        ? "border-l-green-500 bg-green-50/50 dark:bg-green-950/20" 
        : "border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
    }`}>
      <CardHeader>
        <CardDescription>Supplier Performance</CardDescription>
        <CardTitle className={cn(
          "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
          isGood ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          <div className="flex items-center justify-between">
            <span>{totalScore}</span>
            <ChartContainer
            config={{
              quality: {
                label: "Quality",
                color: (latestData?.supplier_quality || 87) >= 85 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
              },
              delivery: {
                label: "Delivery",
                color: (latestData?.supplier_delivery || 82) >= 85 ? "hsl(142, 76%, 40%)" : "hsl(0, 84%, 55%)",
              },
              communication: {
                label: "Communication",
                color: (latestData?.supplier_communication || 86) >= 85 ? "hsl(142, 76%, 44%)" : "hsl(0, 84%, 50%)",
              },
              price: {
                label: "Price",
                color: (latestData?.supplier_price || 84) >= 85 ? "hsl(142, 76%, 48%)" : "hsl(0, 84%, 45%)",
              },
            }}
            className="h-[60px] w-[100px]"
          >
            <RadialBarChart
              data={[{
                quality: latestData?.supplier_quality || 87,
                delivery: latestData?.supplier_delivery || 82,
                communication: latestData?.supplier_communication || 86,
                price: latestData?.supplier_price || 84,
              }]}
              endAngle={180}
              innerRadius={20}
              outerRadius={35}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} />
              <RadialBar
                dataKey="quality"
                stackId="a"
                cornerRadius={2}
                fill="var(--color-quality)"
                className="stroke-transparent"
              />
              <RadialBar
                dataKey="delivery"
                fill="var(--color-delivery)"
                stackId="a"
                cornerRadius={2}
                className="stroke-transparent"
              />
              <RadialBar
                dataKey="communication"
                fill="var(--color-communication)"
                stackId="a"
                cornerRadius={2}
                className="stroke-transparent"
              />
              <RadialBar
                dataKey="price"
                fill="var(--color-price)"
                stackId="a"
                cornerRadius={2}
                className="stroke-transparent"
              />
            </RadialBarChart>
          </ChartContainer>
          </div>
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className={cn(isPositive ? "border-green-500/20 bg-green-500/10 text-green-700" : "border-red-500/20 bg-red-500/10 text-red-700")}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{Math.abs(parseFloat(change))}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {isPositive ? "Trending up" : "Trending down"} this week
          {isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
        </div>
        <div className="text-muted-foreground">
          Target: 85 • Q:{Math.round(latestData?.supplier_quality || 87)} D:{Math.round(latestData?.supplier_delivery || 82)} C:{Math.round(latestData?.supplier_communication || 86)} P:{Math.round(latestData?.supplier_price || 84)}
        </div>
      </CardFooter>
    </Card>
  );
}