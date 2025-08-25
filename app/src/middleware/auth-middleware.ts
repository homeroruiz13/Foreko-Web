import { NextResponse, type NextRequest } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";

export function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check for authentication via URL params or cookies
  const authData = getAuthFromRequest(req);
  const isLoggedIn = authData || req.cookies.get("auth-token") || req.cookies.get("foreko_auth");

  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    // Redirect to main app login instead of local login
    const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${mainAppUrl}/en/sign-in`);
  }

  if (!isLoggedIn && pathname.startsWith("/api/data-ingestion")) {
    return NextResponse.json(
      { error: 'Unauthorized: Please sign in to access this resource' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
