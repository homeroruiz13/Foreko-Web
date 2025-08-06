"use client";
import React from "react";

export const InventorySkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Stock Levels</div>
            <div className="text-lg font-bold text-blue-400">1,247</div>
          </div>
          <div className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-400">
            12 Low
          </div>
        </div>

        {/* Stock bars */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-2 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-400">SKU A</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-2 bg-red-500 rounded-full" />
            <span className="text-xs text-gray-400">SKU B</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-2 bg-yellow-500 rounded-full" />
            <span className="text-xs text-gray-400">SKU C</span>
          </div>
        </div>

        <div className="bg-blue-500/20 px-2 py-1 rounded text-xs text-blue-400 text-center">
          AI Reorder Ready
        </div>
      </div>
    </div>
  );
};