"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const SkeletonSix = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJoZXgiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+Cjxwb2x5Z29uIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIwLjUiIHBvaW50cz0iMTUsIDUgMjUsIDEwIDI1LCAyMCAxNSwgMjUgNSwgMjAgNSwgMTAiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjaGV4KSIvPgo8L3N2Zz4=')] opacity-30" />
      </div>

      {/* Mobile mockup */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center">
        {/* Phone mockup */}
        <div className="relative">
          <div className="w-20 h-36 bg-gray-800 rounded-lg border-2 border-gray-600 flex flex-col">
            {/* Phone header */}
            <div className="bg-gray-700 h-6 rounded-t-md flex items-center justify-center">
              <div className="w-8 h-1 bg-gray-500 rounded-full" />
            </div>
            
            {/* Phone screen content */}
            <div className="flex-1 p-2 space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-xs text-green-400 font-bold">842</div>
                <div className="text-xs text-red-400">⚠ 12</div>
              </div>
              
              <div className="space-y-1">
                <div className="h-1 bg-blue-500/60 rounded-full w-full" />
                <div className="h-1 bg-purple-500/40 rounded-full w-3/4" />
                <div className="h-1 bg-green-500/60 rounded-full w-1/2" />
              </div>
              
              <div className="text-center">
                <div className="text-xs text-cyan-400 font-bold">$2.1K</div>
                <div className="text-xs text-gray-400">Today</div>
              </div>
            </div>
            
            {/* Notification indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="text-xs text-white font-bold">3</div>
            </div>
          </div>
        </div>

        {/* Mobile features */}
        <div className="mt-4 text-center space-y-2">
          <div className="text-sm font-medium text-gray-300">MOBILE READY</div>
          <div className="flex space-x-4 text-xs text-gray-400">
            <span>📱 iOS</span>
            <span>🤖 Android</span>
            <span>🔔 Push</span>
          </div>
        </div>
      </div>

      {/* Animated connection lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mobileFlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(6, 182, 212, 0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M 10,50 Q 50,30 90,50"
            stroke="url(#mobileFlow)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 10,70 Q 50,90 90,70"
            stroke="url(#mobileFlow)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
};