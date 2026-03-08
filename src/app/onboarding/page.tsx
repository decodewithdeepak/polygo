"use client";

import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Globe, ArrowRight, Check, Sparkles } from "lucide-react";
import Logo from "@/components/ui/Logo";

const LANGUAGE_GROUPS = [
    {
        label: "Indic Languages",
        languages: [
            { code: "en", name: "English", native: "English", flag: "🇬🇧" },
            { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
            { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
            { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
            { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
            { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
            { code: "gu", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
            { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
            { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
            { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
            { code: "ur", name: "Urdu", native: "اردو", flag: "🇵🇰" },
            { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
            { code: "as", name: "Assamese", native: "অসমীয়া", flag: "🇮🇳" },
            { code: "mai", name: "Maithili", native: "मैथिली", flag: "🇮🇳" },
            { code: "ne", name: "Nepali", native: "नेपाली", flag: "🇳🇵" },
            { code: "sa", name: "Sanskrit", native: "संस्कृतम्", flag: "🇮🇳" },
            { code: "kok", name: "Konkani", native: "कोंकणी", flag: "🇮🇳" },
            { code: "doi", name: "Dogri", native: "डोगरी", flag: "🇮🇳" },
            { code: "sd", name: "Sindhi", native: "سنڌي", flag: "🇮🇳" },
            { code: "sat", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", flag: "🇮🇳" },
            { code: "ks", name: "Kashmiri", native: "कॉशुर", flag: "🇮🇳" },
            { code: "mni", name: "Manipuri", native: "মৈতৈলোন্", flag: "🇮🇳" },
            { code: "brx", name: "Bodo", native: "बड़ो", flag: "🇮🇳" },
        ],
    },
    {
        label: "Foreign Languages",
        languages: [
            { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
            { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
            { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
            { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
            { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
            { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
            { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
            { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
            { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
            { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
        ],
    },
];

export default function OnboardingPage() {
    const { user, isLoading } = useUser();
    const completeOnboarding = useMutation(api.users.completeOnboarding);
    const [selected, setSelected] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0b10]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        window.location.href = "/api/auth/login";
        return null;
    }

    const handleContinue = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await completeOnboarding({ language: selected });
            window.location.href = "/conversations";
        } catch {
            setSaving(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0b10] text-white font-sans">
            {/* Background effects */}
            <div className="absolute -top-[10%] -left-[10%] h-150 w-150 rounded-full bg-purple-600/10 blur-[120px]" />
            <div className="absolute top-[40%] -right-[5%] h-100 w-100 rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px]" />

            <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-16">
                    <Logo className="h-6 w-6 text-zinc-100" />
                    <span className="text-lg font-bold tracking-tight text-white">Polygo</span>
                </div>

                {/* Hero */}
                <div className="mb-12 text-center">
                    <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-xs font-medium text-purple-400">
                        <Sparkles className="h-3 w-3" />
                        <span>Welcome, {user.name || user.email}!</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                        Choose your <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">preferred language</span>
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-500">
                        Messages from others will be translated into this language. You can always change it later.
                    </p>
                </div>

                {/* Language Groups */}
                <div className="flex-1 space-y-10">
                    {LANGUAGE_GROUPS.map((group) => (
                        <div key={group.label}>
                            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                <Globe className="h-3.5 w-3.5" />
                                {group.label}
                            </h2>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {group.languages.map((lang) => {
                                    const isSelected = selected === lang.code;
                                    return (
                                        <button
                                            key={lang.code}
                                            onClick={() => setSelected(lang.code)}
                                            className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${isSelected
                                                    ? "border-purple-500/60 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-800/60"
                                                }`}
                                        >
                                            <span className="text-xl leading-none">{lang.flag}</span>
                                            <div className="min-w-0 flex-1">
                                                <div className={`text-sm font-medium truncate ${isSelected ? "text-purple-200" : "text-zinc-200"}`}>
                                                    {lang.name}
                                                </div>
                                                <div className={`text-xs truncate ${isSelected ? "text-purple-400/70" : "text-zinc-600"}`}>
                                                    {lang.native}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Continue Button */}
                <div className="sticky bottom-0 mt-10 flex justify-center pb-8 pt-6 bg-linear-to-t from-[#0a0b10] via-[#0a0b10] to-transparent">
                    <button
                        onClick={handleContinue}
                        disabled={!selected || saving}
                        className={`group flex h-14 items-center justify-center gap-2 rounded-full px-10 text-base font-bold transition-all ${selected
                                ? "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            }`}
                    >
                        {saving ? (
                            <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
