"use client";
import React from "react";

export const CostOptimizationSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-yellow-900/20 to-amber-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Cost Savings</div>
            <div className="text-lg font-bold text-yellow-400">$2.4K</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-yellow-400">💰 Found</div>
          </div>
        </div>

        {/* Savings opportunities */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Overstock</span>
            <span className="text-yellow-400">-$800</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Shipping</span>
            <span className="text-yellow-400">-$600</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Bulk Orders</span>
            <span className="text-yellow-400">-$1,000</span>
          </div>
        </div>

        <div className="bg-yellow-500/20 px-2 py-1 rounded text-xs text-yellow-400 text-center">
          🎯 AI Cost Hunter
        </div>
      </div>
    </div>
  );
};