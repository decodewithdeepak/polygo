"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import SplashScreen from "@/components/SplashScreen";

export default function RootPage() {
    const [showSplash, setShowSplash] = useState(true);
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    const router = useRouter();

    const handleSplashComplete = () => {
        setShowSplash(false);

        if (isLoading) return;

        if (isAuthenticated) {
            router.replace("/conversations");
        } else {
            loginWithRedirect();
        }
    };

    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return null;
}
