import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './middleware/auth-middleware';

export function middleware(request: NextRequest) {
  // First check authentication
  const authResponse = authMiddleware(request);
  if (authResponse) {
    return authResponse;
  }

  const response = NextResponse.next();

  // Handle CORS for dashboard routes and API routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://foreko.app', 
      'https://www.foreko.app',
      'https://hub.foreko.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : '',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/data-ingestion/:path*']
};