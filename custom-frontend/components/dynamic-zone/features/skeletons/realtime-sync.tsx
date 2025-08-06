"use client";
import React from "react";

export const RealtimeSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-cyan-900/20 to-sky-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Sync Status</div>
            <div className="text-sm font-bold text-cyan-400">🔄 Live</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-cyan-400">Last sync</div>
            <div className="text-xs text-gray-400">2 sec ago</div>
          </div>
        </div>

        {/* Sync indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Shopify</span>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">QuickBooks</span>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Square</span>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>

        <div className="bg-cyan-500/20 px-2 py-1 rounded text-xs text-cyan-400 text-center">
          ⚡ Zero Delay Updates
        </div>
      </div>
    </div>
  );
};