import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

/**
 * Next.js 16 Proxy
 * Handles Auth0 routes (/auth/*) and enforces session security.
 */
export async function proxy(request: NextRequest) {
  // Always run auth0.middleware first — it handles login/callback/logout
  // routes AND manages session rolling/cookies for all other routes.
  const authRes = await auth0.middleware(request);

  const path = request.nextUrl.pathname;

  // Let Auth0 SDK handle its own routes without interference
  if (path.startsWith("/auth")) {
    return authRes;
  }

  // Public routes — no session required
  if (path === "/") {
    return authRes;
  }

  // Protected routes — require a valid session
  const session = await auth0.getSession(request);
  if (!session) {
    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin),
    );
  }

  return authRes;
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
