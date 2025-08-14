export interface AuthData {
  userId: string;
  email: string;
  name: string;
  sessionId: string;
  expiresAt: string;
}

export function getAuthFromUrl(): AuthData | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const authString = urlParams.get('auth');
  
  if (!authString) return null;
  
  try {
    const decoded = atob(authString);
    const authData = JSON.parse(decoded);
    
    // Store in localStorage for subsequent requests
    localStorage.setItem('foreko_auth', JSON.stringify(authData));
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    return authData;
  } catch (error) {
    console.error('Failed to decode auth data:', error);
    return null;
  }
}

export function getStoredAuth(): AuthData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('foreko_auth');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get stored auth:', error);
    return null;
  }
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('foreko_auth');
    // Also clear any other auth-related storage
    localStorage.removeItem('auth-token');
    localStorage.removeItem('session-token');
    // Clear session storage as well
    sessionStorage.clear();
  }
}

export function clearAllAuthAndRedirect() {
  clearAuth();
  // Clear URL parameters that might contain auth data
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.delete('auth');
    window.history.replaceState({}, document.title, url.pathname);
    
    // Force redirect to main app with force logout
    window.location.href = 'https://foreko.app/en/sign-in?force=true';
  }
}