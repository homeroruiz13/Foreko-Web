"use client";
import React from "react";

export function SkeletonOne() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KPC9zdmc+')] opacity-30" />
      </div>

      {/* Data visualization - inventory dashboard mockup */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        {/* Header metrics */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-400">1,247</div>
            <div className="text-xs text-gray-400">Items in Stock</div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-2xl font-bold text-yellow-400">23</div>
            <div className="text-xs text-gray-400">Low Stock</div>
          </div>
        </div>

        {/* Center content - live data indicator */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
          </div>
          <div className="text-sm text-center text-gray-300">
            <div className="font-medium">LIVE DATA</div>
            <div className="text-xs text-gray-400">Updated 30s ago</div>
          </div>
        </div>

        {/* Bottom metrics */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-lg font-bold text-blue-400">$12,847</div>
            <div className="text-xs text-gray-400">Daily Revenue</div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-lg font-bold text-purple-400">89%</div>
            <div className="text-xs text-gray-400">Order Accuracy</div>
          </div>
        </div>
      </div>

      {/* Animated data flow lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dataFlow1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M 10,20 Q 50,10 90,20"
            stroke="url(#dataFlow1)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 10,80 Q 50,90 90,80"
            stroke="url(#dataFlow1)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
