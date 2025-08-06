"use client";
import React from "react";
import { Container } from "../../container";
import { Heading } from "../../elements/heading";
import { Subheading } from "../../elements/subheading";
import { FeatureIconContainer } from "./feature-icon-container";
import { GradientContainer } from "../../gradient-container";
import {
  Card,
  CardDescription,
  CardSkeletonContainer,
  CardTitle,
} from "./card";
import { IconRocket } from "@tabler/icons-react";
import dynamic from "next/dynamic";

// Dynamically import skeleton components with SSR disabled
const SkeletonOne = dynamic(() => import("./skeletons/first").then(mod => ({ default: mod.SkeletonOne })), { ssr: false });
const SkeletonTwo = dynamic(() => import("./skeletons/second").then(mod => ({ default: mod.SkeletonTwo })), { ssr: false });
const SkeletonThree = dynamic(() => import("./skeletons/third").then(mod => ({ default: mod.SkeletonThree })), { ssr: false });
const SkeletonFour = dynamic(() => import("./skeletons/fourth").then(mod => ({ default: mod.SkeletonFour })), { ssr: false });

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

const wordToNumber: { [key: string]: number } = {
  one: 1,
  two: 2,
  three: 3
};

function convertWordToNumber(word: string) {
  return wordToNumber[word.toLowerCase()] || 1;
}

export const Features = ({ heading, sub_heading, globe_card, ray_card, graph_card, social_media_card }: { heading: string, sub_heading: string, globe_card: any, ray_card: any, graph_card: any, social_media_card: any }) => {
  return (
    <GradientContainer className="md:my-20">
      <Container className="py-20 max-w-7xl mx-auto relative z-40">
        <FeatureIconContainer className="flex justify-center items-center overflow-hidden">
          <IconRocket className="h-6 w-6 text-white" />
        </FeatureIconContainer>
        <Heading className="pt-4">{heading}</Heading>
        <Subheading className="max-w-3xl mx-auto">
          {sub_heading}
        </Subheading>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
          {globe_card && (
            <Card className="md:col-span-1" >
              <CardTitle>{globe_card.title}</CardTitle>
              <CardDescription>
                {globe_card.description}
              </CardDescription>
              <CardSkeletonContainer>
                <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                  <ErrorBoundary>
                    <SkeletonOne />
                  </ErrorBoundary>
                </React.Suspense>
              </CardSkeletonContainer>
            </Card>
          )}

          {ray_card && (
            <Card className="md:col-span-1" >
              <CardSkeletonContainer className="max-w-[16rem] mx-auto">
                <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                  <ErrorBoundary>
                    <SkeletonTwo />
                  </ErrorBoundary>
                </React.Suspense>
              </CardSkeletonContainer>
              <CardTitle>{ray_card.title}</CardTitle>
              <CardDescription>
                {ray_card.description}
              </CardDescription>
            </Card>
          )}

          {graph_card && (
            <Card className="md:col-span-1" >
              <CardSkeletonContainer
                showGradient={false}
                className="max-w-[16rem] mx-auto"
              >
                <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                  <ErrorBoundary>
                    <SkeletonThree />
                  </ErrorBoundary>
                </React.Suspense>
              </CardSkeletonContainer>
              <CardTitle>{graph_card.title}</CardTitle>
              <CardDescription>
                {graph_card.description}
              </CardDescription>
            </Card>
          )}

          {social_media_card && (
            <Card className="md:col-span-1" >
              <CardSkeletonContainer showGradient={false}>
                <React.Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />}>
                  <ErrorBoundary>
                    <SkeletonFour />
                  </ErrorBoundary>
                </React.Suspense>
              </CardSkeletonContainer>
              <CardTitle>{social_media_card.title}</CardTitle>
              <CardDescription>
                {social_media_card.description}
              </CardDescription>
            </Card>
          )}
        </div>
      </Container>
    </GradientContainer >
  );
};
