import { useMutation, useQuery } from "convex/react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { usePresence } from "@/hooks/usePresence";

export default function UserStoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeUser = useMutation(api.users.store);
    const me = useQuery(api.users.getMe);
    const { user, isLoading } = useUser();
    const isAuthenticated = !!user;
    const [isRegistered, setIsRegistered] = useState(false);

    const remoteLog = async (level: string, message: string, data?: any) => {
        try {
            await fetch("/api/debug/log", {
                method: "POST",
                body: JSON.stringify({ level, message, data }),
            });
        } catch (e) {
            // Fallback to browser if bridge fails
            console[level as "log" | "error" | "warn"](message, data);
        }
    };

    useEffect(() => {
        // Wait for Auth0 to fully load AND confirm the user is authenticated
        if (!isLoading && isAuthenticated) {
            remoteLog("log", "[UserStore] Registering user with Convex...");
            storeUser()
                .then((id) => {
                    remoteLog("log", "[UserStore] Registration successful", { userId: id });
                    setIsRegistered(true);
                })
                .catch((err) => {
                    remoteLog("error", "[UserStore] Registration failed", err.message || err);
                });
        }
    }, [
        isLoading,
        isAuthenticated,
        storeUser,
        user?.name,
        user?.picture,
    ]);

    // Redirect to onboarding if user hasn't completed it
    useEffect(() => {
        if (isRegistered && me && me.hasCompletedOnboarding === false) {
            // Only redirect if not already on the onboarding page
            if (!window.location.pathname.startsWith("/onboarding")) {
                window.location.href = "/onboarding";
            }
        }
    }, [isRegistered, me]);

    usePresence(isRegistered);

    return <>{children}</>;
}