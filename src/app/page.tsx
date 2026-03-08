"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import SplashScreen from "@/components/SplashScreen";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function RootPage() {
    const { user, isLoading } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading && user) {
            window.location.href = "/conversations";
        }
    }, [user, isLoading]);

    if (isLoading || !mounted) {
        return <SplashScreen onComplete={() => { }} />;
    }

    const handleLogin = () => {
        window.location.href = "/api/auth/login";
    };

    return (
        <div className="min-h-screen w-full bg-zinc-950 text-white font-sans">
            {/* Nav */}
            <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <Logo className="h-5 w-5 text-zinc-300" />
                    <span className="text-sm font-semibold tracking-tight text-zinc-100">Polygo</span>
                </div>
                <button
                    onClick={handleLogin}
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero */}
            <main className="flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center max-w-3xl mx-auto">
                <p className="mb-6 text-xs uppercase tracking-widest text-zinc-500">
                    Real-time multilingual chat
                </p>

                <h1 className="text-4xl font-semibold tracking-tight text-zinc-100 md:text-5xl">
                    Translate words,<br />preserve meaning.
                </h1>

                <p className="mt-5 max-w-md text-base text-zinc-500">
                    Chat in any language. Messages are translated in real-time with AI that understands nuance and context.
                </p>

                <div className="mt-10 flex items-center gap-3">
                    <button
                        onClick={handleLogin}
                        className="group flex items-center gap-2 rounded-md bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
                    >
                        Get Started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {/* Features */}
                <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left w-full">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                        <p className="text-sm font-medium text-zinc-200">33 Languages</p>
                        <p className="mt-1 text-xs text-zinc-500">Indic and foreign languages supported out of the box.</p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                        <p className="text-sm font-medium text-zinc-200">AI Translation</p>
                        <p className="mt-1 text-xs text-zinc-500">Powered by Sarvam and Gemini for accurate translations.</p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                        <p className="text-sm font-medium text-zinc-200">Real-time</p>
                        <p className="mt-1 text-xs text-zinc-500">Messages translate instantly as they arrive.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
