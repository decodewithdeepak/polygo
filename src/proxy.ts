import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

/**
 * Next.js 16 Proxy Middleware
 * Handles Auth0 routes (/api/auth/*) and enforces session security.
 */
export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`[Middleware] Request: ${path}`);

  // 1. Let Auth0 middleware handle its own routes (/api/auth/login, etc.)
  // We EXCLUDE the Convex token bridge from the Auth0 internal middleware
  // so that our custom route handler can actually run.
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return await auth0.middleware(request);
  }

  // 2. Public Route Exception (Landing page)
  if (path === "/") {
    console.log("[Middleware] Public route allowed");
    return NextResponse.next();
  }

  // 3. Enforce Authentication for all other routes
  const session = await auth0.getSession(request);
  if (!session) {
    console.warn(
      `[Middleware] No session found for ${path}. Redirecting to login.`,
    );
    // Redirect to Auth0 login if no session exists
    return NextResponse.redirect(
      new URL("/api/auth/login", request.nextUrl.origin),
    );
  }

  // For protected routes, we still run the Auth0 middleware logic
  // to handle session rolling/cookies, and then proceed.
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
