"use client";
import React from "react";

export const OneClickSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-lime-900/20 to-green-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Quick Actions</div>
            <div className="text-sm font-bold text-lime-400">👆 Ready</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <div className="bg-lime-500/20 px-2 py-1 rounded text-xs text-lime-400 flex justify-between">
            <span>Approve Reorder</span>
            <span>✓</span>
          </div>
          <div className="bg-blue-500/20 px-2 py-1 rounded text-xs text-blue-400 flex justify-between">
            <span>Switch Carrier</span>
            <span>🚚</span>
          </div>
          <div className="bg-purple-500/20 px-2 py-1 rounded text-xs text-purple-400 flex justify-between">
            <span>Launch Promo</span>
            <span>🎯</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-400">Single Click Execute</div>
        </div>
      </div>
    </div>
  );
};