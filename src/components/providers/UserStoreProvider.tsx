"use client";

import { useMutation } from "convex/react";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { usePresence } from "@/hooks/usePresence";

export default function UserStoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeUser = useMutation(api.users.store);
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        // Wait for Auth0 to fully load AND confirm the user is authenticated
        if (!isLoading && isAuthenticated) {
            storeUser()
                .then(() => setIsRegistered(true))
                .catch((err) =>
                    console.error("Failed to store user:", err)
                );
        }
    }, [
        isLoading,
        isAuthenticated,
        storeUser,
        user?.name,
        user?.picture,
    ]);

    usePresence(isRegistered);

    return <>{children}</>;
}