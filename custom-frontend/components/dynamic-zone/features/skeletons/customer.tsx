"use client";
import React from "react";

export const CustomerSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-purple-900/20 to-violet-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Top Customer</div>
            <div className="text-sm font-bold text-purple-400">Sarah M.</div>
          </div>
          <div className="text-right">
            <div className="text-lg text-purple-400">78%</div>
            <div className="text-xs text-gray-400">Repeat Rate</div>
          </div>
        </div>

        {/* Channel breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">🛒 Online</span>
            <span className="text-purple-400">65%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">🏪 In-Store</span>
            <span className="text-blue-400">35%</span>
          </div>
        </div>

        <div className="bg-purple-500/20 px-2 py-1 rounded text-xs text-purple-400 text-center">
          💡 AI Loyalty Suggestion
        </div>
      </div>
    </div>
  );
};