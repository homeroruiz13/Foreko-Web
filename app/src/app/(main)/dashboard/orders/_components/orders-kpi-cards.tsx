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

interface OrderKPI {
  title: string;
  value: number;
  unit: string;
  target: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  subtext: string;
  status: 'good' | 'warning' | 'poor';
}

interface OrdersKPICardsProps {
  kpis: OrderKPI[];
  loading?: boolean;
}

export function OrdersKPICards({ kpis, loading = false }: OrdersKPICardsProps) {
  const formatValue = (value: number, unit: string) => {
    if (!value && value !== 0) return '--';
    
    switch (unit) {
      case '%':
        return `${value.toFixed(1)}%`;
      case 'days':
        return `${value.toFixed(1)} days`;
      case '$':
        return `$${value.toLocaleString()}`;
      default:
        return value.toFixed(1);
    }
  };

  const getPerformanceBadge = (change: number, status: string, trend: string) => {
    if (!change || change === 0) {
      return (
        <Badge variant="outline">
          <IconTrendingUp />
          No change
        </Badge>
      );
    }

    const isPositive = change > 0;
    const isGood = status === 'good';
    const Icon = trend === 'up' ? IconTrendingUp : IconTrendingDown;

    return (
      <Badge 
        variant="outline" 
        className={cn(
          isGood 
            ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400" 
            : status === 'warning'
            ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
        )}
      >
        <Icon className="h-3 w-3" />
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </Badge>
    );
  };

  const getFooterContent = (kpi: OrderKPI) => {
    const isGood = kpi.status === 'good';
    const isWarning = kpi.status === 'warning';
    const trend = kpi.trend;
    const Icon = trend === 'up' ? IconTrendingUp : IconTrendingDown;
    
    return {
      message: isGood 
        ? `${trend === 'up' ? 'Trending up' : 'Improving'} this month`
        : isWarning
        ? `Close to target threshold`
        : `Needs immediate attention`,
      description: kpi.subtext,
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
      {kpis.map((kpi, index) => {
        const footerContent = getFooterContent(kpi);
        const borderColor = kpi.status === 'good' 
          ? "border-l-green-500" 
          : kpi.status === 'warning'
          ? "border-l-amber-500"
          : "border-l-red-500";
        const bgColor = kpi.status === 'good'
          ? "bg-green-50/50 dark:bg-green-950/20"
          : kpi.status === 'warning'
          ? "bg-amber-50/50 dark:bg-amber-950/20"
          : "bg-red-50/50 dark:bg-red-950/20";
        const textColor = kpi.status === 'good'
          ? "text-green-600 dark:text-green-400"
          : kpi.status === 'warning'
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

        return (
          <Card 
            key={index} 
            className={cn(
              "@container/card transition-colors border-l-4",
              borderColor,
              bgColor
            )}
          >
            <CardHeader>
              <CardDescription>{kpi.title}</CardDescription>
              <CardTitle className={cn(
                "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
                textColor
              )}>
                {formatValue(kpi.value, kpi.unit)}
              </CardTitle>
              <CardAction>
                {getPerformanceBadge(kpi.change, kpi.status, kpi.trend)}
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {footerContent.message} <footerContent.icon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Target: {formatValue(kpi.target, kpi.unit)} • {footerContent.description}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}