"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import SplashScreen from "@/components/SplashScreen";
import { useEffect, useState } from "react";
import { ArrowRight, Globe, Zap, BookOpen, Mic } from "lucide-react";
import Logo from "@/components/ui/Logo";

const MARQUEE_ROW_1 = [
    "English", "हिन्दी", "বাংলা", "தமிழ்", "తెలుగు",
    "मराठी", "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ",
    "اردو", "ଓଡ଼ିଆ", "অসমীয়া", "मैथिली", "नेपाली", "संस्कृतम्", "कोंकणी",
];
const MARQUEE_ROW_2 = [
    "डोगरी", "سنڌي", "ᱥᱟᱱᱛᱟᱲᱤ", "कॉशुर", "মৈতৈলোন্", "बड़ो",
    "日本語", "Español", "Français", "Deutsch", "中文", "한국어", "Português", "Русский", "العربية", "Italiano",
];

const FEATURES = [
    {
        icon: Globe,
        title: "34 Languages",
        desc: "All 22 official Indian languages plus 12 global ones — every script, every tongue.",
    },
    {
        icon: Zap,
        title: "Dual AI Engine",
        desc: "Sarvam AI for Indic speed. Gemini 2.0 Flash for global reach. Smart routing, zero latency.",
    },
    {
        icon: BookOpen,
        title: "Cultural Insights",
        desc: "Every message teaches grammar and culture. Learn natively as you chat in real-time.",
    },
    {
        icon: Mic,
        title: "Voice Personas",
        desc: "6 Sarvam TTS voices with sentiment-aware pacing. Your messages, spoken with emotion.",
    },
];

export default function RootPage() {
    const { user, isLoading } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!isLoading && user) {
            window.location.href = "/conversations";
        }
    }, [user, isLoading]);

    if (isLoading || !mounted) {
        return <SplashScreen onComplete={() => { }} />;
    }

    const handleLogin = () => { window.location.href = "/auth/login"; };

    return (
        <>
            <style>{`
                @keyframes marquee-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @keyframes marquee-right {
                    from { transform: translateX(-50%); }
                    to { transform: translateX(0); }
                }
                .marquee-left { animation: marquee-left 35s linear infinite; }
                .marquee-right { animation: marquee-right 40s linear infinite; }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up-1 { animation: fade-up 0.65s ease 0.05s both; }
                .fade-up-2 { animation: fade-up 0.65s ease 0.2s both; }
                .fade-up-3 { animation: fade-up 0.65s ease 0.35s both; }
                .fade-up-4 { animation: fade-up 0.65s ease 0.5s both; }
            `}</style>

            <div className="min-h-screen w-full bg-zinc-950 text-white font-sans overflow-x-hidden">

                {/* Nav */}
                <nav className="flex items-center justify-between px-6 py-5 md:px-12 max-w-6xl mx-auto">
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-6 text-zinc-300" />
                        <span className="text-base font-semibold tracking-tight text-zinc-100">Polygo</span>
                    </div>
                    <button
                        onClick={handleLogin}
                        className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                        Sign In
                    </button>
                </nav>

                {/* Hero */}
                <section className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center w-full">
                    {/* Text content */}
                    <div className="px-6 pb-12 text-center max-w-4xl mx-auto">
                        <p className="fade-up-1 mb-5 text-xs uppercase tracking-[0.25em] text-zinc-500">
                            Real-time multilingual chat
                        </p>
                        <h1 className="fade-up-2 text-5xl font-semibold tracking-tight text-zinc-100 md:text-7xl leading-[1.05]">
                            Every language.<br />
                            <span className="text-zinc-500">One conversation.</span>
                        </h1>
                        <p className="fade-up-3 mt-6 max-w-xl mx-auto text-base text-zinc-400 leading-relaxed">
                            Chat in Hindi, reply in Japanese - Polygo translates every message in real-time,
                            preserving nuance, tone, and meaning across 34 languages.
                        </p>
                        <div className="fade-up-4 mt-10 flex items-center justify-center gap-4">
                            <button
                                onClick={handleLogin}
                                className="group flex items-center gap-2 rounded-md bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
                            >
                                Start Chatting
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </div>

                    {/* Language marquee */}
                    <div className="relative w-full overflow-hidden py-5 border-y border-zinc-800/50 bg-zinc-900/20">
                        <div className="flex mb-2.5">
                            <div className="marquee-left flex shrink-0 gap-3 pr-3">
                                {[...MARQUEE_ROW_1, ...MARQUEE_ROW_1].map((lang, i) => (
                                    <span key={i} className="whitespace-nowrap text-sm text-zinc-400 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex">
                            <div className="marquee-right flex shrink-0 gap-3 pr-3">
                                {[...MARQUEE_ROW_2, ...MARQUEE_ROW_2].map((lang, i) => (
                                    <span key={i} className="whitespace-nowrap text-sm text-zinc-400 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-zinc-950 to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-zinc-950 to-transparent" />
                    </div>
                </section>

                {/* Chat demo */}
                <section className="px-6 py-20 max-w-lg mx-auto">
                    <p className="text-center text-xs uppercase tracking-[0.2em] text-zinc-600 mb-10">See it in action</p>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                            <div className="h-7 w-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">Y</div>
                            <div>
                                <p className="text-sm font-medium text-zinc-200">Yuki</p>
                                <p className="text-[10px] text-green-400">● Online</p>
                            </div>
                        </div>
                        <div className="p-4 space-y-5">
                            {/* Received message with nuance tip */}
                            <div className="flex items-end gap-2">
                                <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">Y</div>
                                <div className="max-w-[80%]">
                                    <div className="rounded-2xl rounded-bl-sm bg-zinc-800 border border-zinc-700/50 px-3.5 py-2.5 relative">
                                        <p className="text-sm text-white">やあ！元気？😊</p>
                                        <p className="text-[9px] text-zinc-500 mt-1">12:12 PM · Translated</p>
                                        <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-600 bg-zinc-900 text-[10px] font-bold text-white shadow">i</div>
                                    </div>
                                    {/* Nuance tooltip */}
                                    <div className="mt-2 w-52 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px]">
                                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">Language Insight</p>
                                        <p className="text-zinc-300 leading-relaxed">"やあ" is casual — used between close friends, rarely in formal settings.</p>
                                    </div>
                                    <p className="mt-1 ml-1 text-[10px] text-zinc-600 italic">→ "Hey! How are you? 😊"</p>
                                </div>
                            </div>
                            {/* Sent message */}
                            <div className="flex justify-end">
                                <div className="rounded-2xl rounded-br-sm bg-zinc-100 px-3.5 py-2.5 max-w-[80%]">
                                    <p className="text-sm text-zinc-900">मैं ठीक हूँ! तुम कैसे हो? 😄</p>
                                    <p className="text-[9px] text-zinc-500 mt-1">12:14 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="px-6 py-12 max-w-5xl mx-auto">
                    <p className="text-center text-xs uppercase tracking-[0.2em] text-zinc-600 mb-3">Built different</p>
                    <h2 className="text-center text-2xl font-semibold text-zinc-100 mb-10 md:text-3xl">
                        Not just translation — <span className="text-zinc-500">understanding</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/70">
                                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
                                    <Icon className="h-4 w-4 text-zinc-300" />
                                </div>
                                <p className="text-sm font-semibold text-zinc-200 mb-1">{title}</p>
                                <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="px-6 py-16 max-w-3xl mx-auto">
                    <p className="text-center text-xs uppercase tracking-[0.2em] text-zinc-600 mb-3">Simple by design</p>
                    <h2 className="text-center text-2xl font-semibold text-zinc-100 mb-12 md:text-3xl">How it works</h2>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
                        {[
                            { step: "01", title: "Choose your language", desc: "Pick from 34 languages. Seen in your own script." },
                            { step: "02", title: "Chat normally", desc: "Write in your language. Recipients see their own." },
                            { step: "03", title: "Learn as you go", desc: "Hover any message for grammar and cultural insights." },
                        ].map(({ step, title, desc }) => (
                            <div key={step}>
                                <p className="text-5xl font-bold text-zinc-800 mb-3">{step}</p>
                                <p className="text-sm font-semibold text-zinc-200 mb-1.5">{title}</p>
                                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="px-6 py-24 text-center border-t border-zinc-800/50">
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-600 mb-4">Break the language barrier</p>
                    <h2 className="text-3xl font-semibold text-zinc-100 mb-8 md:text-4xl">
                        Start a conversation<br />in any language.
                    </h2>
                    <button
                        onClick={handleLogin}
                        className="group inline-flex items-center gap-2 rounded-md bg-zinc-100 px-7 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
                    >
                        Get Started Free
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <p className="mt-5 text-xs text-zinc-700">Powered by Sarvam AI + Google Gemini</p>
                </section>

            </div>
        </>
    );
}
