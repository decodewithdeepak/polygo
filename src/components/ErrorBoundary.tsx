/**
 * ErrorBoundary — Catches unhandled JavaScript errors in the component tree.
 *
 * WHAT ERROR WE'RE CATCHING:
 * React rendering errors — any uncaught exception thrown during render,
 * lifecycle methods, or constructors of any child component. Examples:
 *   - TypeError from accessing a property on undefined data
 *   - Network-related errors that bubble up from failed mutations
 *   - Unexpected null returns from Convex queries
 *
 * WHAT THE USER SEES INSTEAD:
 * A friendly error screen with a "Try Again" button, instead of a blank
 * white page or cryptic error message. This preserves trust — the user
 * knows the app hit an issue but can recover without refreshing manually.
 *
 * WHY A CLASS COMPONENT:
 * React Error Boundaries MUST be class components — there is no hook
 * equivalent for componentDidCatch / getDerivedStateFromError (as of React 19).
 * This is one of the very few cases where a class component is still required.
 *
 * PLACEMENT:
 * This wraps the main layout content so that errors in any child route
 * (conversation pages, sidebar, etc.) are caught here rather than crashing
 * the entire application.
 */

"use client";

import React from "react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    /**
     * getDerivedStateFromError — Static lifecycle method called when a
     * descendant component throws. We use it to update state so the next
     * render shows the fallback UI instead of the broken component tree.
     */
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    /**
     * componentDidCatch — Called with error details after an error is thrown.
     * This is where you'd log to an error reporting service (Sentry, LogRocket, etc.).
     * For now, we log to the console so developers can debug locally.
     */
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }

    /**
     * handleReset — Clears the error state so the component tree re-renders.
     * This gives users a "try again" without a full page refresh — the app
     * re-mounts from this boundary downward, which often fixes transient errors.
     */
    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // ─── Fallback UI ──────────────────────────────────────────────
            // What the user sees instead of a broken page.
            // Uses the same dark theme styling as the rest of the app so it
            // doesn't feel jarring or disconnected.
            return (
                <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-white">
                    <div className="flex flex-col items-center gap-4 text-center">
                        {/* Visual indicator — emoji is universally understood */}
                        <span className="text-5xl">😵</span>

                        <h2 className="text-xl font-semibold">
                            Something went wrong
                        </h2>

                        <p className="max-w-md text-sm text-zinc-400">
                            An unexpected error occurred. Click the button below
                            to try again, or refresh the page if the problem
                            persists.
                        </p>

                        {/* Error details — always shown for detailed logs as requested */}
                        {this.state.error && (
                            <div className="mt-4 w-full max-w-2xl overflow-hidden rounded-lg border border-red-500/30 bg-red-950/20 text-left">
                                <div className="border-b border-red-500/30 bg-red-950/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-400">
                                    Error Logs
                                </div>
                                <pre className="max-h-60 overflow-auto p-4 text-[10px] leading-relaxed text-red-300 selection:bg-red-500/30">
                                    <div className="font-bold mb-1">{this.state.error.name}: {this.state.error.message}</div>
                                    {this.state.error.stack}
                                </pre>
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="mt-6 rounded-lg bg-zinc-100 text-zinc-900 px-8 py-3 text-sm font-semibold transition-all hover:bg-white active:scale-95"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        // No error — render children normally
        return this.props.children;
    }
}
