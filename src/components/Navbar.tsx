/**
 * Navbar Component
 *
 * This component renders the top navigation bar of the application.
 * It has one simple job: display the app logo on the left side and
 * the logged-in user's info (name + avatar + logout) on the right.
 *
 * We use Auth0's `useAuth0()` hook to get the current user's data,
 * and a custom avatar with a logout button.
 */

"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { MessageSquare, Globe, LogOut } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
    const { user } = useUser();
    const me = useQuery(api.users.getMe);
    const updateLanguage = useMutation(api.users.updateLanguage);

    const handleLanguageChange = async (lang: string) => {
        try {
            await updateLanguage({ language: lang });
            toast.success(`Language changed to ${lang.toUpperCase()}`);
        } catch (error) {
            toast.error("Failed to update language");
        }
    };

    return (
        <nav className="flex w-full items-center justify-between border-b border-gray-700 bg-[#1a1d27] px-6 py-3">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Logo className="h-6 w-6 text-zinc-100" />
                    <span className="text-lg font-bold tracking-tight text-white">
                        Polygo
                    </span>
                </div>

                <div className="flex items-center gap-2 rounded-md bg-zinc-800/40 px-3 py-1.5 border border-zinc-700/50">
                    <Globe className="h-4 w-4 text-zinc-400" />
                    <select
                        value={me?.preferredLanguage || "en"}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-transparent text-xs font-medium text-zinc-200 outline-none cursor-pointer"
                    >
                        <optgroup label="Indic" className="bg-zinc-900">
                            <option value="en" className="bg-zinc-900">English</option>
                            <option value="hi" className="bg-zinc-900">Hindi</option>
                            <option value="bn" className="bg-zinc-900">Bengali</option>
                            <option value="ta" className="bg-zinc-900">Tamil</option>
                            <option value="te" className="bg-zinc-900">Telugu</option>
                            <option value="mr" className="bg-zinc-900">Marathi</option>
                            <option value="gu" className="bg-zinc-900">Gujarati</option>
                            <option value="kn" className="bg-zinc-900">Kannada</option>
                            <option value="ml" className="bg-zinc-900">Malayalam</option>
                            <option value="pa" className="bg-zinc-900">Punjabi</option>
                            <option value="ur" className="bg-zinc-900">Urdu</option>
                            <option value="or" className="bg-zinc-900">Odia</option>
                            <option value="as" className="bg-zinc-900">Assamese</option>
                            <option value="mai" className="bg-zinc-900">Maithili</option>
                            <option value="ne" className="bg-zinc-900">Nepali</option>
                            <option value="sa" className="bg-zinc-900">Sanskrit</option>
                            <option value="kok" className="bg-zinc-900">Konkani</option>
                            <option value="doi" className="bg-zinc-900">Dogri</option>
                            <option value="sd" className="bg-zinc-900">Sindhi</option>
                            <option value="sat" className="bg-zinc-900">Santali</option>
                            <option value="ks" className="bg-zinc-900">Kashmiri</option>
                            <option value="mni" className="bg-zinc-900">Manipuri</option>
                            <option value="brx" className="bg-zinc-900">Bodo</option>
                        </optgroup>
                        <optgroup label="Foreign" className="bg-zinc-900">
                            <option value="ja" className="bg-zinc-900">Japanese</option>
                            <option value="es" className="bg-zinc-900">Spanish</option>
                            <option value="fr" className="bg-zinc-900">French</option>
                            <option value="de" className="bg-zinc-900">German</option>
                            <option value="zh" className="bg-zinc-900">Chinese</option>
                            <option value="ko" className="bg-zinc-900">Korean</option>
                            <option value="pt" className="bg-zinc-900">Portuguese</option>
                            <option value="ru" className="bg-zinc-900">Russian</option>
                            <option value="ar" className="bg-zinc-900">Arabic</option>
                            <option value="it" className="bg-zinc-900">Italian</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-zinc-400 hidden sm:block">
                            {user.name || user.email}
                        </span>
                        <Avatar className="h-8 w-8 border border-zinc-700/50 shadow-sm">
                            <AvatarImage src={user.picture} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <a
                            href="/api/auth/logout"
                            className="flex items-center gap-2 rounded-md bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-all border border-zinc-700/30"
                            title="Log out"
                        >
                            <LogOut className="h-4 w-4" />
                        </a>
                    </div>
                )}
            </div>
        </nav>
    );
}
