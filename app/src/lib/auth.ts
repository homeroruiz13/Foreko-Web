export interface AuthData {
  userId: string;
  email: string;
  name: string;
  sessionId: string;
  expiresAt: string;
  companyId?: string;
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
    let mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';
    
    // Handle different deployed environments
    if (window.location.hostname === 'hub.foreko.app') {
      mainAppUrl = 'https://www.foreko.app';
    }
    
    window.location.href = `${mainAppUrl}/en/sign-in?force=true`;
  }
}

export function getAuthFromRequest(request?: Request): AuthData | null {
  if (!request) return null;
  
  try {
    const url = new URL(request.url);
    const authString = url.searchParams.get('auth');
    
    if (authString) {
      try {
        const decoded = atob(decodeURIComponent(authString));
        const authData = JSON.parse(decoded);
        
        // Validate that we have required fields
        if (authData.userId && authData.email && authData.name) {
          return authData;
        }
      } catch (decodeError) {
        console.error('Failed to decode auth parameter:', decodeError);
      }
    }
    
    // Try to get from cookies if available
    const cookies = request.headers.get('cookie');
    if (cookies) {
      // Try foreko_auth cookie
      const authCookie = cookies.split(';').find(c => c.trim().startsWith('foreko_auth='));
      if (authCookie) {
        try {
          const authValue = authCookie.split('=')[1];
          if (authValue) {
            const decoded = atob(decodeURIComponent(authValue));
            const authData = JSON.parse(decoded);
            
            if (authData.userId && authData.email && authData.name) {
              return authData;
            }
          }
        } catch (cookieError) {
          console.error('Failed to decode auth cookie:', cookieError);
        }
      }
      
      // Try alternative auth cookie names
      const altAuthCookie = cookies.split(';').find(c => c.trim().startsWith('auth-token='));
      if (altAuthCookie) {
        // Handle alternative cookie format if needed
        console.log('Found alternative auth cookie, but no decoder implemented yet');
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get auth from request:', error);
    return null;
  }
}