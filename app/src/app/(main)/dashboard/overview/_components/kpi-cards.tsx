'use client';

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

interface KPICardsProps {
  kpis: KPIData[];
  loading?: boolean;
}

export function KPICards({ kpis, loading }: KPICardsProps) {
  // Filter for tile KPIs (top 4)
  const tileKpis = kpis.filter(kpi => kpi.is_tile).slice(0, 4);

  const formatValue = (value: number, unit: string) => {
    if (!value && value !== 0) return '--';
    
    switch (unit) {
      case '%':
        return `${value.toFixed(1)}%`;
      case 'x':
        return `${value.toFixed(1)}x`;
      case 'days':
        return `${value.toFixed(1)} days`;
      case '$':
        return `$${value.toLocaleString()}`;
      case 'score':
        return value.toFixed(1);
      default:
        return value.toFixed(1);
    }
  };

  const getPerformanceBadge = (change: number | null, performance: string, goodDirection: string) => {
    if (!change || change === 0) {
      return (
        <Badge variant="outline">
          <IconTrendingUp />
          No change
        </Badge>
      );
    }

    const isPositive = change > 0;
    const isGood = performance === 'good';
    const Icon = isPositive ? IconTrendingUp : IconTrendingDown;

    return (
      <Badge variant="outline" className={cn(isGood ? "border-green-500/20 bg-green-500/10 text-green-700" : "border-red-500/20 bg-red-500/10 text-red-700")}>
        <Icon className="h-3 w-3" />
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </Badge>
    );
  };

  const getFooterContent = (kpi: KPIData) => {
    const isGood = kpi.performance === 'good';
    const trend = kpi.percentage_change && kpi.percentage_change > 0 ? 'up' : 'down';
    const Icon = trend === 'up' ? IconTrendingUp : IconTrendingDown;
    
    return {
      message: isGood 
        ? `${trend === 'up' ? 'Trending up' : 'Improving'} this month`
        : `${trend === 'up' ? 'Needs attention' : 'Declining'} this period`,
      description: isGood 
        ? 'Performance exceeds targets'
        : 'Requires immediate focus',
      icon: Icon
    };
  };

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded mt-2" />
            </CardHeader>
            <CardFooter>
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {tileKpis.map((kpi) => {
        const footerContent = getFooterContent(kpi);
        return (
          <Card key={kpi.kpi_name} className={cn(
            "@container/card transition-colors",
            kpi.performance === 'good' 
              ? "border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20" 
              : "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
          )}>
            <CardHeader>
              <CardDescription>{kpi.display_name}</CardDescription>
              <CardTitle className={cn(
                "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
                kpi.performance === 'good' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {formatValue(kpi.kpi_value, kpi.unit_of_measure)}
              </CardTitle>
              <CardAction>
                {getPerformanceBadge(kpi.percentage_change, kpi.performance, kpi.good_direction)}
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {footerContent.message} <footerContent.icon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Target: {formatValue(kpi.target_value, kpi.unit_of_measure)} • {footerContent.description}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}