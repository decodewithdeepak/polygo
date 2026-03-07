"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import SplashScreen from "@/components/SplashScreen";
import { useEffect, useState } from "react";
import { MessageSquare, Globe, Zap, ArrowRight, Shield, Sparkles } from "lucide-react";

export default function RootPage() {
    const { user, isLoading, error } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading && user) {
            // If already logged in, go straight to conversations
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
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0b10] text-white selection:bg-purple-500/30 font-sans">
            {/* --- Premium CSS Background (No Images) --- */}
            {/* Animated Gradient Orbs */}
            <div className="absolute -top-[10%] -left-[10%] h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse" />
            <div className="absolute top-[20%] -right-[5%] h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px] animate-pulse [animation-delay:2s]" />
            <div className="absolute bottom-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            {/* Navigation Header */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2.5 group cursor-default">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-110">
                        <Globe className="h-6 w-6 text-white" />
                    </div>
                </div>
                <button
                    onClick={handleLogin}
                    className="group relative overflow-hidden rounded-full bg-white/5 px-6 py-2 text-sm font-medium transition-all hover:bg-white/10 border border-white/10"
                >
                    <span className="relative z-10">Sign In</span>
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 text-center">
                {/* Badge */}
                <div className="mb-6 flex animate-fade-in items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-xs font-medium text-purple-400 backdrop-blur-sm">
                    <Zap className="h-3 w-3" />
                    <span>Real-time translation powered by Gemini AI</span>
                </div>

                {/* Title */}
                <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
                    <span className="block italic text-zinc-400">Translate words,</span>
                    <span className="bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">
                        preserve meaning.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="mt-8 max-w-2xl text-lg text-zinc-400 md:text-xl">
                    Break down language barriers with Polygo. Seamlessly chat in any language with real-time AI translation that understands nuance and context.
                </p>

                {/* CTA Buttons */}
                <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
                    <button
                        onClick={handleLogin}
                        className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 text-base font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Get Started for Free
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button className="flex h-14 items-center justify-center px-8 text-base font-semibold text-zinc-300 transition-colors hover:text-white">
                        See how it works
                    </button>
                </div>

                {/* Feature Tags */}
                <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="flex items-center gap-3 text-zinc-500">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/5">
                            <Globe className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium italic">100+ Languages</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-500">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/5">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium italic">Gemini Pro Integration</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-500">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/5">
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium italic">Secure & Private</span>
                    </div>
                </div>
            </main>

            {/* Foreground decorative elements */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,11,16,0)_0%,rgba(10,11,16,1)_100%)] opacity-60" />
        </div>
    );
}
