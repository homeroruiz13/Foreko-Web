"use client";
import React from "react";

export const AIEngineSkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-pink-900/20 to-rose-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">AI Engine</div>
            <div className="text-sm font-bold text-pink-400">🤖 Active</div>
          </div>
          <div className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          </div>
        </div>

        {/* AI recommendations */}
        <div className="space-y-2">
          <div className="bg-pink-500/10 p-2 rounded text-xs">
            <div className="text-pink-400 font-medium">Recommendation:</div>
            <div className="text-gray-300">Reorder Widget A in 3 days</div>
          </div>
        </div>

        <div className="flex justify-between text-xs">
          <div>
            <div className="text-gray-400">Predictions</div>
            <div className="text-pink-400">127</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400">Accuracy</div>
            <div className="text-pink-400">94%</div>
          </div>
        </div>
      </div>
    </div>
  );
};