'use client';

import { useEffect, useState } from 'react';
import { getAuthFromUrl, getStoredAuth, clearAllAuthAndRedirect, type AuthData } from '@/lib/auth';

export function useAuth() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First try to get auth from URL
    const urlAuth = getAuthFromUrl();
    if (urlAuth) {
      setAuth(urlAuth);
      setIsLoading(false);
      return;
    }

    // Then try to get from localStorage
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      // Check if auth is expired
      if (storedAuth.expiresAt && new Date(storedAuth.expiresAt) < new Date()) {
        clearAllAuthAndRedirect();
        return;
      }
      setAuth(storedAuth);
      setIsLoading(false);
      return;
    }

    // No auth found - redirect to login
    setIsLoading(false);
    clearAllAuthAndRedirect();
  }, []);

  // Helper function to get auth headers for API calls
  const getAuthHeaders = () => {
    if (!auth) return {};
    
    // Encode auth data for API calls
    const authString = btoa(JSON.stringify(auth));
    return {
      'X-Auth-Token': authString,
    };
  };

  // Helper function to get auth query params for API calls
  const getAuthParams = () => {
    if (!auth) return '';
    
    // Encode auth data for URL params
    const authString = btoa(JSON.stringify(auth));
    return `auth=${encodeURIComponent(authString)}`;
  };

  return {
    auth,
    isLoading,
    isAuthenticated: !!auth,
    getAuthHeaders,
    getAuthParams,
    logout: clearAllAuthAndRedirect,
  };
}