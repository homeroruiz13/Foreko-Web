"use client";
import React from "react";

export const MobileFirstSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-800/20 to-gray-800/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-center items-center">
        {/* Phone mockup */}
        <div className="relative">
          <div className="w-16 h-28 bg-gray-700 rounded-lg border border-gray-600 flex flex-col">
            {/* Phone screen */}
            <div className="bg-gray-600 h-4 rounded-t-md flex items-center justify-center">
              <div className="w-6 h-0.5 bg-gray-500 rounded-full" />
            </div>
            
            <div className="flex-1 p-2 space-y-1">
              <div className="h-1 bg-blue-500/60 rounded w-full" />
              <div className="h-1 bg-green-500/60 rounded w-3/4" />
              <div className="h-1 bg-purple-500/60 rounded w-1/2" />
            </div>
            
            {/* Notification badge */}
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <div className="text-xs text-white font-bold">5</div>
            </div>
          </div>
        </div>

        <div className="mt-2 text-center">
          <div className="text-xs text-gray-400">📱 Touch Optimized</div>
          <div className="text-xs text-blue-400">iOS • Android</div>
        </div>
      </div>
    </div>
  );
};