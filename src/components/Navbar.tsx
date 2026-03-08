"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { LogOut } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/ui/Logo";

const INDIC_LANGUAGES = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "pa", name: "Punjabi" },
    { code: "ur", name: "Urdu" },
    { code: "or", name: "Odia" },
    { code: "as", name: "Assamese" },
    { code: "mai", name: "Maithili" },
    { code: "ne", name: "Nepali" },
    { code: "sa", name: "Sanskrit" },
    { code: "kok", name: "Konkani" },
    { code: "doi", name: "Dogri" },
    { code: "sd", name: "Sindhi" },
    { code: "sat", name: "Santali" },
    { code: "ks", name: "Kashmiri" },
    { code: "mni", name: "Manipuri" },
    { code: "brx", name: "Bodo" },
];

const FOREIGN_LANGUAGES = [
    { code: "ja", name: "Japanese" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ko", name: "Korean" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ar", name: "Arabic" },
    { code: "it", name: "Italian" },
];

export default function Navbar() {
    const { user } = useUser();
    const me = useQuery(api.users.getMe);
    const updateLanguage = useMutation(api.users.updateLanguage);

    const handleLanguageChange = async (lang: string) => {
        try {
            await updateLanguage({ language: lang });
            toast.success(`Language updated`);
        } catch {
            toast.error("Failed to update language");
        }
    };

    return (
        <nav className="flex w-full items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2.5">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Logo className="h-5 w-5 text-zinc-300" />
                    <span className="text-sm font-semibold tracking-tight text-zinc-100">
                        Polygo
                    </span>
                </div>

                <Select
                    value={me?.preferredLanguage || "en"}
                    onValueChange={handleLanguageChange}
                >
                    <SelectTrigger
                        size="sm"
                        className="h-7 w-auto gap-1 border-zinc-700 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 bg-zinc-900 border-zinc-700">
                        <SelectGroup>
                            <SelectLabel>Indic</SelectLabel>
                            {INDIC_LANGUAGES.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">
                                    {lang.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                            <SelectLabel>Foreign</SelectLabel>
                            {FOREIGN_LANGUAGES.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">
                                    {lang.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3">
                {user && (
                    <>
                        <span className="text-xs text-zinc-500 hidden sm:block">
                            {user.name || user.email}
                        </span>
                        <Avatar className="h-7 w-7 border border-zinc-700">
                            <AvatarImage src={user.picture} alt={user.name} />
                            <AvatarFallback className="bg-zinc-800 text-xs text-zinc-300">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <a
                            href="/api/auth/logout"
                            className="flex items-center justify-center rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                            title="Log out"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </a>
                    </>
                )}
            </div>
        </nav>
    );
}
