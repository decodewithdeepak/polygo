import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

/**
 * Bridge endpoint to provide the Auth0 ID Token to the Convex client.
 * This allows Convex to verify the user's identity using the server-side session.
 */
export async function GET() {
  try {
    // In App Router handlers, calling getSession() without arguments
    // is the most reliable way as it automatically uses next/headers.
    const session = await auth0.getSession();

    if (!session) {
      console.warn(
        "[Token Bridge] No session found (User might not be logged in)",
      );
      return NextResponse.json({ token: null });
    }

    if (!session.idToken) {
      console.warn(
        "[Token Bridge] Session found for " +
          session.user?.email +
          " but idToken is missing. Check scopes.",
      );
      return NextResponse.json({ token: null });
    }

    console.log(
      "[Token Bridge] Successfully retrieved token for:",
      session.user?.email,
    );
    return NextResponse.json({ token: session.idToken });
  } catch (error) {
    console.error("[Token Bridge] Critical error:", error);
    return NextResponse.json({ token: null }, { status: 500 });
  }
}
