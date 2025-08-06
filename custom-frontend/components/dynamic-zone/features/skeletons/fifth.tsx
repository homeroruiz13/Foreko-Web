"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const SkeletonFive = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJkb3RzIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPgo8L3N2Zz4=')] opacity-40" />
      </div>

      {/* Analytics visualization */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        {/* Header metrics */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xl font-bold text-purple-400">87%</div>
            <div className="text-xs text-gray-400">Profit Margin</div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-xl font-bold text-pink-400">↑ 23%</div>
            <div className="text-xs text-gray-400">Growth</div>
          </div>
        </div>

        {/* Center content - analytics chart mockup */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            {/* Simple bar chart */}
            <div className="flex items-end space-x-2">
              <div className="w-3 h-8 bg-purple-500/50 rounded-t" />
              <div className="w-3 h-12 bg-purple-500/70 rounded-t" />
              <div className="w-3 h-6 bg-purple-500/40 rounded-t" />
              <div className="w-3 h-16 bg-purple-500 rounded-t" />
              <div className="w-3 h-10 bg-purple-500/60 rounded-t" />
            </div>
          </div>
          <div className="text-xs text-center text-gray-300">
            <div className="font-medium">ANALYTICS</div>
            <div className="text-xs text-gray-400">Real-time insights</div>
          </div>
        </div>

        {/* Bottom metrics */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-lg font-bold text-blue-400">5.2K</div>
            <div className="text-xs text-gray-400">Data Points</div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-lg font-bold text-green-400">Fast</div>
            <div className="text-xs text-gray-400">Processing</div>
          </div>
        </div>
      </div>

      {/* Animated trend lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M 20,70 Q 40,50 60,60 T 80,40"
            stroke="url(#trendFlow)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
};