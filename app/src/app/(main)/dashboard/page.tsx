'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function Page() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated, getAuthParams } = useAuth();

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!isAuthenticated) {
        router.replace('/dashboard/data-import');
        return;
      }

      try {
        // Check if user has uploaded files
        const authParams = getAuthParams();
        const response = await fetch(`/api/data-ingestion/upload?${authParams}`);
        
        if (response.ok) {
          const result = await response.json();
          // If user has uploaded files, redirect to overview
          if (result.uploads && result.uploads.length > 0) {
            router.replace('/dashboard/overview');
          } else {
            // Otherwise, redirect to data-import
            router.replace('/dashboard/data-import');
          }
        } else {
          // If check fails, default to data-import
          router.replace('/dashboard/data-import');
        }
      } catch (error) {
        console.error('Error checking uploads:', error);
        // If check fails, default to data-import
        router.replace('/dashboard/data-import');
      } finally {
        setIsChecking(false);
      }
    };

    checkAndRedirect();
  }, [router, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isChecking ? 'Checking your data...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
