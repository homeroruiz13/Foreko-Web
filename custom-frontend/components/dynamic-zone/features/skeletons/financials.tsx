"use client";
import React from "react";

export const FinancialsSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Cash Flow</div>
            <div className="text-lg font-bold text-emerald-400">$24.8K</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-emerald-400">↗ +12%</div>
            <div className="text-xs text-gray-400">vs last month</div>
          </div>
        </div>

        {/* Cash flow chart mockup */}
        <div className="flex items-end justify-center space-x-1 h-8">
          <div className="w-1 h-4 bg-emerald-500/50 rounded" />
          <div className="w-1 h-6 bg-emerald-500/70 rounded" />
          <div className="w-1 h-3 bg-emerald-500/40 rounded" />
          <div className="w-1 h-8 bg-emerald-500 rounded" />
          <div className="w-1 h-5 bg-emerald-500/60 rounded" />
          <div className="w-1 h-7 bg-emerald-500/80 rounded" />
        </div>

        <div className="flex justify-between text-xs">
          <div>
            <div className="text-gray-400">Profit Margin</div>
            <div className="text-emerald-400">18.2%</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400">Savings Found</div>
            <div className="text-yellow-400">$1.2K</div>
          </div>
        </div>
      </div>
    </div>
  );
};