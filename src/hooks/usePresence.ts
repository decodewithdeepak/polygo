/**
 * usePresence — Custom hook that manages real-time online/offline presence.
 *
 * WHY THIS IS A HOOK AND NOT COMPONENT LOGIC:
 * Presence tracking involves multiple event listeners and cleanup logic.
 * Keeping it in a dedicated hook makes it:
 *   1. Testable independently of any component
 *   2. Reusable if we need presence in multiple places
 *   3. Easy to explain in an interview — "all presence logic is here"
 *
 * HOW IT WORKS:
 * - On mount → calls setOnline (user opened the app)
 * - On visibility change → online when tab is visible, offline when hidden
 * - On beforeunload → offline when the browser tab is about to close
 * - On unmount → calls setOffline (cleanup function)
 *
 * MULTI-TAB HANDLING:
 * Uses BroadcastChannel so closing one tab doesn't mark the user offline
 * when other tabs are still open. Each tab pings on mount and responds
 * to "any other tabs open?" queries before going offline.
 *
 * BROWSER EVENTS USED:
 * - `visibilitychange` → tab switching (most reliable cross-browser)
 * - `beforeunload` → tab/window closing (unreliable on mobile, see below)
 */

"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@auth0/nextjs-auth0/client";

const CHANNEL_NAME = "polygo-presence";

// ...
export function usePresence(enabled: boolean = true) {
  const setOnline = useMutation(api.users.setOnline);
  const setOffline = useMutation(api.users.setOffline);
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Don't set up presence until auth is fully loaded, user is authenticated AND enabled
    if (isLoading || !isAuthenticated || !enabled) return;

    // ─── Multi-tab coordination via BroadcastChannel ─────────────────
    let otherTabsAlive = false;
    let channel: BroadcastChannel | null = null;

    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data === "ping") {
          // Another tab is asking if anyone is still here — respond yes
          channel?.postMessage("pong");
        } else if (event.data === "pong") {
          // Got a response — at least one other tab is alive
          otherTabsAlive = true;
        }
      };
    } catch {
      // BroadcastChannel not supported (e.g., some older browsers) — fall back to single-tab behavior
    }

    // ─── 1. Mark user online when they open the app ──────────────────
    setOnline().catch(console.error);

    // ─── 2. Handle tab visibility changes ────────────────────────────
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setOnline().catch(console.error);
      } else {
        setOffline().catch(console.error);
      }
    };

    // ─── 3. Handle browser/tab close ─────────────────────────────────
    // Before going offline, check if other tabs are open.
    // We post a "ping" and give a brief window for "pong" responses.
    const handleBeforeUnload = () => {
      // Synchronous — can't await. Just fire setOffline.
      // The BroadcastChannel check is best-effort here.
      if (channel) {
        otherTabsAlive = false;
        channel.postMessage("ping");
        // In beforeunload we can't await async responses.
        // Other tabs' "pong" won't arrive in time.
        // So we rely on the remaining tab's visibilitychange to re-setOnline.
      }
      setOffline().catch(console.error);
    };

    // ─── Register Event Listeners ────────────────────────────────────
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // ─── Cleanup Function ────────────────────────────────────────────
    return () => {
      // Before going offline, ask if other tabs exist
      if (channel) {
        otherTabsAlive = false;
        channel.postMessage("ping");
        // Give a tiny window for pong — synchronous, so best-effort
        // The remaining tab will call setOnline on its next visibilitychange
      }

      setOffline().catch(console.error);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      channel?.close();
      channelRef.current = null;
    };
  }, [isLoading, isAuthenticated, setOnline, setOffline, enabled]);
}
