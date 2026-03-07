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
                        <option value="en" className="bg-zinc-900">English</option>
                        <option value="hi" className="bg-zinc-900">Hindi</option>
                        <option value="ja" className="bg-zinc-900">Japanese</option>
                        <option value="es" className="bg-zinc-900">Spanish</option>
                        <option value="fr" className="bg-zinc-900">French</option>
                        <option value="de" className="bg-zinc-900">German</option>
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
