"use client";
import React from "react";

export const ScalableSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-violet-900/20 to-purple-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Scale</div>
            <div className="text-lg font-bold text-violet-400">∞</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-violet-400">Growth Ready</div>
          </div>
        </div>

        {/* Scale indicators */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">SKUs</span>
            <span className="text-violet-400">10 → 10K+</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Locations</span>
            <span className="text-violet-400">1 → Multi</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Users</span>
            <span className="text-violet-400">Role-based</span>
          </div>
        </div>

        <div className="bg-violet-500/20 px-2 py-1 rounded text-xs text-violet-400 text-center">
          📈 Grows With You
        </div>
      </div>
    </div>
  );
};