import { NextRequest, NextResponse } from "next/server";

/**
 * Log Bridge Endpoint
 * Allows the client to send logs/errors to the server terminal.
 */
export async function POST(req: NextRequest) {
  try {
    const { level, message, data } = await req.json();
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[Client:${level.toUpperCase()}] [${timestamp}]`;

    if (level === "error") {
      console.error(prefix, message, data || "");
    } else if (level === "warn") {
      console.warn(prefix, message, data || "");
    } else {
      console.log(prefix, message, data || "");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
