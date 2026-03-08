/**
 * API Key authentication for the Polygo public API.
 *
 * External apps authenticate with: Authorization: Bearer <POLYGO_API_KEY>
 * The key is validated against the POLYGO_API_KEY environment variable.
 */

import { NextRequest, NextResponse } from "next/server";

export type ApiError = {
  success: false;
  error: { code: string; message: string };
};

export function unauthorized(message = "Invalid or missing API key"): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "UNAUTHORIZED", message } },
    { status: 401 },
  );
}

export function badRequest(message: string): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "BAD_REQUEST", message } },
    { status: 400 },
  );
}

export function serverError(message = "Internal server error"): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "SERVER_ERROR", message } },
    { status: 500 },
  );
}

/**
 * Validates the API key from the Authorization header.
 * Returns null if valid, or a NextResponse error if invalid.
 */
export function validateApiKey(req: NextRequest): NextResponse<ApiError> | null {
  const apiKey = process.env.POLYGO_API_KEY;
  if (!apiKey) {
    console.error("[Polygo API] POLYGO_API_KEY not set in environment");
    return serverError("API not configured");
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorized("Missing Authorization: Bearer <key> header");
  }

  const token = authHeader.slice(7);
  if (token !== apiKey) {
    return unauthorized();
  }

  return null; // Valid
}
