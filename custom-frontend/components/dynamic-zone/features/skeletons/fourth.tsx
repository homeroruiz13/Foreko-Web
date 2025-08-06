"use client";
import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import StarBackground from "@/components/decorations/star-background";
import ShootingStars from "@/components/decorations/shooting-star";
import { motion } from "framer-motion";

var loopInterval: NodeJS.Timeout;
export const SkeletonFour = () => {
  const features = useMemo(
    () => [
      {
        title: "$49/mo",
        content: "Starter Plan",
        className: "left-4 top-4",
      },
      {
        title: "No Setup",
        content: "Ready in 30min",
        className: "left-1/2 top-8 transform -translate-x-1/2",
      },
      {
        title: "Cloud-Based",
        content: "No IT Required",
        className: "right-4 top-4",
      },
      {
        title: "ROI",
        content: "300% in Year 1",
        className: "left-8 top-1/2 transform -translate-y-1/2",
      },
      {
        title: "Support",
        content: "24/7 Available",
        className: "right-8 top-1/2 transform -translate-y-1/2",
      },
      {
        title: "Scale",
        content: "Grows with you",
        className: "left-4 bottom-4",
      },
      {
        title: "Updates",
        content: "Always included",
        className: "left-1/2 bottom-8 transform -translate-x-1/2",
      },
      {
        title: "Free Trial",
        content: "14 Days",
        className: "right-4 bottom-4",
      },
    ],
    []
  );

  const [active, setActive] = useState(features[0]);

  useEffect(() => {
    loopInterval = setInterval(() => {
      setActive(features[Math.floor(Math.random() * features.length)]);
    }, 3000);
    return () => clearInterval(loopInterval);
  }, [features]);

  return (
    <div className="p-6 overflow-hidden h-full relative flex flex-col group bg-gradient-to-br from-green-900/20 to-blue-900/20">
      <StarBackground />
      <ShootingStars />

      {/* Center cost visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-green-400">$49</div>
          <div className="text-sm text-gray-300">per month</div>
          <div className="text-xs text-gray-500">vs $15k+ for custom software</div>
        </div>
      </div>

      {/* Floating feature badges */}
      {features.map((feature) => (
        <div
          className={cn(
            "absolute p-3 rounded-lg bg-gray-800/80 border border-gray-600/50 opacity-60 transition-all duration-300",
            feature.className,
            active.title === feature.title && "opacity-100 scale-110 border-green-400/50 bg-green-900/20"
          )}
          key={feature.title}
        >
          <div className="text-xs font-medium text-white">{feature.title}</div>
          <div className="text-xs text-gray-400">{feature.content}</div>
          {active.title === feature.title && (
            <motion.div
              layoutId="bubble"
              className="absolute inset-0 rounded-lg border-2 border-green-400/50"
            ></motion.div>
          )}
        </div>
      ))}

      {/* ROI indicator */}
      <div className="absolute bottom-4 right-4 text-right">
        <div className="text-lg font-bold text-green-400">300%</div>
        <div className="text-xs text-gray-400">First Year ROI</div>
      </div>
    </div>
  );
};
