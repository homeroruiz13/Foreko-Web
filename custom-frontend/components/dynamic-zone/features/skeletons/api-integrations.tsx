"use client";
import React from "react";

export const APISkeleton = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-lg">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase">Integrations</div>
            <div className="text-lg font-bold text-indigo-400">50+</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-indigo-400">Active</div>
            <div className="text-sm text-indigo-400">7</div>
          </div>
        </div>

        {/* Integration grid */}
        <div className="grid grid-cols-3 gap-1">
          <div className="w-4 h-4 bg-green-500/30 rounded border border-green-500" />
          <div className="w-4 h-4 bg-blue-500/30 rounded border border-blue-500" />
          <div className="w-4 h-4 bg-purple-500/30 rounded border border-purple-500" />
          <div className="w-4 h-4 bg-orange-500/30 rounded border border-orange-500" />
          <div className="w-4 h-4 bg-red-500/30 rounded border border-red-500" />
          <div className="w-4 h-4 bg-yellow-500/30 rounded border border-yellow-500" />
        </div>

        <div className="bg-indigo-500/20 px-2 py-1 rounded text-xs text-indigo-400 text-center">
          🔗 REST API Ready
        </div>
      </div>
    </div>
  );
};