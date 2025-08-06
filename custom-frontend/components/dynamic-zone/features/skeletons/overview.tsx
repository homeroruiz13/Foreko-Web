"use client";
import React from "react";

export const OverviewSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-lg">
      {/* Business Health Score */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Health Score</div>
            <div className="text-2xl font-bold text-green-400">87</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Center metrics */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Inventory</span>
            <span className="text-green-400">Good</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Orders</span>
            <span className="text-yellow-400">Watch</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Cash Flow</span>
            <span className="text-green-400">Strong</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-400">Quick Overview</div>
        </div>
      </div>
    </div>
  );
};