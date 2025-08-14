'use client';

import { useEffect } from 'react';

export default function DashboardPage() {
  useEffect(() => {
    // Client-side redirect to avoid prefetch CORS issues
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://hub.foreko.app';
    window.location.href = `${dashboardUrl}/dashboard/default`;
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}