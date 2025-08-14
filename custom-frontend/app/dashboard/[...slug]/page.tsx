'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function DashboardSlugPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Client-side redirect to avoid prefetch CORS issues
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://hub.foreko.app';
    const slug = Array.isArray(params.slug) ? params.slug.join('/') : (params.slug || 'default');
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    
    window.location.href = `${dashboardUrl}/dashboard/${slug}${queryString}`;
  }, [params, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}