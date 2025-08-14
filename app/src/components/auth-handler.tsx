"use client";

import { useEffect, useState } from 'react';
import { getAuthFromUrl, getStoredAuth, type AuthData } from '@/lib/auth';

export function AuthHandler({ children }: { children: React.ReactNode }) {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get auth from URL first, then from storage
    const urlAuth = getAuthFromUrl();
    const storedAuth = urlAuth || getStoredAuth();
    
    setAuthData(storedAuth);
    setIsLoading(false);

    if (!storedAuth) {
      // No auth found, redirect back to main app
      window.location.href = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000/sign-in';
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <a 
            href={process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000/sign-in'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* User info header */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="text-sm text-blue-800">
          Welcome back, <strong>{authData.name}</strong> ({authData.email})
          <span className="ml-4 text-blue-600">Session expires: {new Date(authData.expiresAt).toLocaleDateString()}</span>
        </div>
      </div>
      {children}
    </div>
  );
}