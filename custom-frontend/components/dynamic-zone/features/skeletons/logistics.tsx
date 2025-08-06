"use client";
import React from "react";

export const LogisticsSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-orange-900/20 to-amber-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Orders</div>
            <div className="text-lg font-bold text-orange-400">94%</div>
            <div className="text-xs text-gray-400">On Time</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Tracking</div>
            <div className="text-sm text-orange-400">#12847</div>
          </div>
        </div>

        {/* Order status */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Processing</span>
            <span className="text-blue-400">8</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Shipped</span>
            <span className="text-yellow-400">23</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Delivered</span>
            <span className="text-green-400">156</span>
          </div>
        </div>

        <div className="bg-orange-500/20 px-2 py-1 rounded text-xs text-orange-400 text-center">
          📦 Real-time Tracking
        </div>
      </div>
    </div>
  );
};