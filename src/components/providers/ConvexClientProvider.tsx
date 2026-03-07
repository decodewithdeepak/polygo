"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import { ReactNode, useCallback, useMemo } from "react";
import UserStoreProvider from "./UserStoreProvider";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Custom hook to bridge Auth0 v4 state to Convex.
 */
function useAuth0Bridge() {
    const { user, isLoading } = useUser();

    const fetchAccessToken = useCallback(async () => {
        try {
            // Fetch the ID Token from our secure bridge route (relocated to avoid middleware conflict)
            const response = await fetch("/api/convex/v1/token");
            if (!response.ok) {
                console.error("Failed to fetch Convex access token:", response.statusText);
                return null;
            }
            const data = await response.json();
            return data.token;
        } catch (err) {
            console.error("Error in fetchAccessToken:", err);
            return null;
        }
    }, []);

    return useMemo(() => ({
        isLoading,
        isAuthenticated: !!user,
        fetchAccessToken,
    }), [user, isLoading, fetchAccessToken]);
}

export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ConvexProviderWithAuth client={convex} useAuth={useAuth0Bridge}>
            <UserStoreProvider>{children}</UserStoreProvider>
        </ConvexProviderWithAuth>
    );
}
