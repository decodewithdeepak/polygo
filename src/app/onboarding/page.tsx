"use client";

import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ArrowRight, Check } from "lucide-react";
import Logo from "@/components/ui/Logo";

const LANGUAGE_GROUPS = [
    {
        label: "Indic Languages",
        languages: [
            { code: "en", name: "English", native: "English" },
            { code: "hi", name: "Hindi", native: "हिन्दी" },
            { code: "bn", name: "Bengali", native: "বাংলা" },
            { code: "ta", name: "Tamil", native: "தமிழ்" },
            { code: "te", name: "Telugu", native: "తెలుగు" },
            { code: "mr", name: "Marathi", native: "मराठी" },
            { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
            { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
            { code: "ml", name: "Malayalam", native: "മലയാളം" },
            { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
            { code: "ur", name: "Urdu", native: "اردو" },
            { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
            { code: "as", name: "Assamese", native: "অসমীয়া" },
            { code: "mai", name: "Maithili", native: "मैथिली" },
            { code: "ne", name: "Nepali", native: "नेपाली" },
            { code: "sa", name: "Sanskrit", native: "संस्कृतम्" },
            { code: "kok", name: "Konkani", native: "कोंकणी" },
            { code: "doi", name: "Dogri", native: "डोगरी" },
            { code: "sd", name: "Sindhi", native: "سنڌي" },
            { code: "sat", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
            { code: "ks", name: "Kashmiri", native: "कॉशुर" },
            { code: "mni", name: "Manipuri", native: "মৈতৈলোন্" },
            { code: "brx", name: "Bodo", native: "बड़ो" },
        ],
    },
    {
        label: "Foreign Languages",
        languages: [
            { code: "ja", name: "Japanese", native: "日本語" },
            { code: "es", name: "Spanish", native: "Español" },
            { code: "fr", name: "French", native: "Français" },
            { code: "de", name: "German", native: "Deutsch" },
            { code: "zh", name: "Chinese", native: "中文" },
            { code: "ko", name: "Korean", native: "한국어" },
            { code: "pt", name: "Portuguese", native: "Português" },
            { code: "ru", name: "Russian", native: "Русский" },
            { code: "ar", name: "Arabic", native: "العربية" },
            { code: "it", name: "Italian", native: "Italiano" },
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
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
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
        <div className="min-h-screen w-full bg-zinc-950 text-white font-sans">
            <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-2 mb-12">
                    <Logo className="h-5 w-5 text-zinc-300" />
                    <span className="text-sm font-semibold tracking-tight text-zinc-100">Polygo</span>
                </div>

                {/* Hero */}
                <div className="mb-10">
                    <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
                        Welcome, {user.name || user.email}
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
                        Choose your preferred language
                    </h1>
                    <p className="mt-2 max-w-md text-sm text-zinc-500">
                        Messages from others will be translated into this language. You can change it anytime.
                    </p>
                </div>

                {/* Language Groups */}
                <div className="flex-1 space-y-8">
                    {LANGUAGE_GROUPS.map((group) => (
                        <div key={group.label}>
                            <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
                                {group.label}
                            </h2>
                            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {group.languages.map((lang) => {
                                    const isSelected = selected === lang.code;
                                    return (
                                        <button
                                            key={lang.code}
                                            onClick={() => setSelected(lang.code)}
                                            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${isSelected
                                                    ? "border-zinc-500 bg-zinc-800"
                                                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
                                                }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className={`text-sm font-medium truncate ${isSelected ? "text-zinc-100" : "text-zinc-300"}`}>
                                                    {lang.name}
                                                </div>
                                                <div className="text-xs truncate text-zinc-600">
                                                    {lang.native}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                                                    <Check className="h-2.5 w-2.5 text-zinc-900" />
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
                <div className="sticky bottom-0 mt-8 flex justify-center pb-6 pt-6 bg-zinc-950">
                    <button
                        onClick={handleContinue}
                        disabled={!selected || saving}
                        className={`group flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-colors ${selected
                                ? "bg-zinc-100 text-zinc-900 hover:bg-white"
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            }`}
                    >
                        {saving ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
