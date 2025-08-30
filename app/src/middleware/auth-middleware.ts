import { NextResponse, type NextRequest } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";

export function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check for authentication via URL params or cookies
  const authData = getAuthFromRequest(req);
  const isLoggedIn = authData || req.cookies.get("auth-token") || req.cookies.get("foreko_auth");

  // Allow dashboard pages to load without authentication
  // The pages themselves will handle showing login prompts
  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    // Don't redirect, let the page handle authentication
    return NextResponse.next();
  }

  // API routes still require authentication
  if (!isLoggedIn && (pathname.startsWith("/api/data-ingestion") || pathname.startsWith("/api/executive"))) {
    return NextResponse.json(
      { error: 'Unauthorized: Please sign in to access this resource' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
