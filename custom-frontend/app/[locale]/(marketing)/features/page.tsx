"use client";
import { Container } from "../../../../components/container";
import { Heading } from "../../../../components/elements/heading";
import { Subheading } from "../../../../components/elements/subheading";
import { FeatureIconContainer } from "../../../../components/dynamic-zone/features/feature-icon-container";
import { GradientContainer } from "../../../../components/gradient-container";
import {
  Card,
  CardDescription,
  CardSkeletonContainer,
  CardTitle,
} from "../../../../components/dynamic-zone/features/card";
import { IconDashboard } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import skeleton components with SSR disabled
const OverviewSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/overview").then(mod => ({ default: mod.OverviewSkeleton })), { ssr: false });
const InventorySkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/inventory").then(mod => ({ default: mod.InventorySkeleton })), { ssr: false });
const LogisticsSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/logistics").then(mod => ({ default: mod.LogisticsSkeleton })), { ssr: false });
const FinancialsSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/financials").then(mod => ({ default: mod.FinancialsSkeleton })), { ssr: false });
const CustomerSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/customer").then(mod => ({ default: mod.CustomerSkeleton })), { ssr: false });
const AIEngineSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/ai-engine").then(mod => ({ default: mod.AIEngineSkeleton })), { ssr: false });
const RealtimeSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/realtime-sync").then(mod => ({ default: mod.RealtimeSkeleton })), { ssr: false });
const APISkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/api-integrations").then(mod => ({ default: mod.APISkeleton })), { ssr: false });
const MobileFirstSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/mobile-first").then(mod => ({ default: mod.MobileFirstSkeleton })), { ssr: false });
const OneClickSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/one-click").then(mod => ({ default: mod.OneClickSkeleton })), { ssr: false });
const CostOptimizationSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/cost-optimization").then(mod => ({ default: mod.CostOptimizationSkeleton })), { ssr: false });
const ScalableSkeleton = dynamic(() => import("../../../../components/dynamic-zone/features/skeletons/scalable").then(mod => ({ default: mod.ScalableSkeleton })), { ssr: false });

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error in skeleton component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">Component unavailable</div>;
    }

    return this.props.children;
  }
}


// Feature data for the 12 comprehensive dashboard boxes
const featuresData = {
  overview_dashboard: {
    title: "Overview Dashboard",
    description: "Real-time business health score with key metrics, alerts, and performance indicators at a glance."
  },
  inventory_dashboard: {
    title: "Inventory Management", 
    description: "Complete stock level monitoring with AI-powered reorder suggestions and demand forecasting."
  },
  logistics_dashboard: {
    title: "Logistics Control",
    description: "End-to-end shipment tracking, carrier management, and delivery optimization tools."
  },
  financials_dashboard: {
    title: "Financial Analytics",
    description: "Cash flow analysis, profit margins, cost breakdowns, and financial health monitoring."
  },
  customer_dashboard: {
    title: "Customer Insights",
    description: "Customer behavior analytics, satisfaction metrics, and relationship management tools."
  },
  ai_automation: {
    title: "AI Engine",
    description: "Machine learning recommendations for inventory, pricing, promotions, and business decisions."
  },
  real_time_sync: {
    title: "Real-Time Sync",
    description: "Live data synchronization across all platforms, ensuring accuracy and consistency."
  },
  api_integrations: {
    title: "API Integrations",
    description: "Seamless connections with ERPs, marketplaces, accounting software, and business tools."
  },
  mobile_optimized: {
    title: "Mobile-First Design",
    description: "Full functionality on any device with responsive design and native mobile experience."
  },
  one_click_actions: {
    title: "One-Click Actions",
    description: "Execute complex business operations with single-click approvals and automated workflows."
  },
  cost_savings: {
    title: "Cost Optimization",
    description: "AI-driven cost analysis identifying savings opportunities and efficiency improvements."
  },
  scalable_growth: {
    title: "Scalable Growth",
    description: "Infrastructure that grows with your business from startup to enterprise scale."
  }
};

export default function FeaturesPage() {
  return (
    <GradientContainer className="md:my-20">
      <Container className="py-20 max-w-7xl mx-auto relative z-40">
        <FeatureIconContainer className="flex justify-center items-center overflow-hidden">
          <IconDashboard className="h-6 w-6 text-white" />
        </FeatureIconContainer>
        <Heading className="pt-4">Complete Feature Suite</Heading>
        <Subheading className="max-w-3xl mx-auto">
          Discover all of Foreko&apos;s powerful capabilities designed to transform your inventory management and business operations
        </Subheading>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
          {/* Core Dashboard Features */}
          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <OverviewSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.overview_dashboard.title}</CardTitle>
            <CardDescription>
              {featuresData.overview_dashboard.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <InventorySkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.inventory_dashboard.title}</CardTitle>
            <CardDescription>
              {featuresData.inventory_dashboard.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <LogisticsSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.logistics_dashboard.title}</CardTitle>
            <CardDescription>
              {featuresData.logistics_dashboard.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <FinancialsSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.financials_dashboard.title}</CardTitle>
            <CardDescription>
              {featuresData.financials_dashboard.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <CustomerSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.customer_dashboard.title}</CardTitle>
            <CardDescription>
              {featuresData.customer_dashboard.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <AIEngineSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.ai_automation.title}</CardTitle>
            <CardDescription>
              {featuresData.ai_automation.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <RealtimeSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.real_time_sync.title}</CardTitle>
            <CardDescription>
              {featuresData.real_time_sync.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <APISkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.api_integrations.title}</CardTitle>
            <CardDescription>
              {featuresData.api_integrations.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <MobileFirstSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.mobile_optimized.title}</CardTitle>
            <CardDescription>
              {featuresData.mobile_optimized.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <OneClickSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.one_click_actions.title}</CardTitle>
            <CardDescription>
              {featuresData.one_click_actions.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <CostOptimizationSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.cost_savings.title}</CardTitle>
            <CardDescription>
              {featuresData.cost_savings.description}
            </CardDescription>
          </Card>

          <Card className="md:col-span-1">
            <CardSkeletonContainer showGradient={false}>
              <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                <ErrorBoundary>
                  <ScalableSkeleton />
                </ErrorBoundary>
              </React.Suspense>
            </CardSkeletonContainer>
            <CardTitle>{featuresData.scalable_growth.title}</CardTitle>
            <CardDescription>
              {featuresData.scalable_growth.description}
            </CardDescription>
          </Card>
        </div>
      </Container>
    </GradientContainer>
  );
}