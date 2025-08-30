'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAuthFromUrl, getStoredAuth, clearAuth, clearAllAuthAndRedirect, type AuthData } from '@/lib/auth';

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
        // Clear expired auth but don't redirect automatically
        clearAuth();
        setAuth(null);
        setIsLoading(false);
        return;
      }
      setAuth(storedAuth);
      setIsLoading(false);
      return;
    }

    // No auth found - just set loading to false, don't auto-redirect
    setAuth(null);
    setIsLoading(false);
  }, []);

  // Helper function to get auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    if (!auth) return {};
    
    // Encode auth data for API calls
    const authString = btoa(JSON.stringify(auth));
    return {
      'X-Auth-Token': authString,
    };
  }, [auth]);

  // Helper function to get auth query params for API calls
  const getAuthParams = useCallback(() => {
    if (!auth) return '';
    
    // Encode auth data for URL params
    const authString = btoa(JSON.stringify(auth));
    return `auth=${encodeURIComponent(authString)}`;
  }, [auth]);

  return {
    auth,
    isLoading,
    isAuthenticated: !!auth,
    getAuthHeaders,
    getAuthParams,
    logout: clearAllAuthAndRedirect,
  };
}