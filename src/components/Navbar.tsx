/**
 * Navbar Component
 *
 * This component renders the top navigation bar of the application.
 * It has one simple job: display the app logo on the left side and
 * the logged-in user's info (name + avatar with dropdown) on the right.
 *
 * We use Clerk's `useUser()` hook to get the current user's data,
 * and Clerk's `<UserButton />` to render the avatar with a built-in
 * dropdown menu that handles sign-out, account management, etc.
 */

"use client"; // Required because we use Clerk hooks (useUser) which run in the browser

import { UserButton, useUser } from "@clerk/nextjs";
import { MessageSquare, Globe } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function Navbar() {
    // useUser() returns the currently signed-in user's data from Clerk
    // We destructure `user` to access their name, avatar, etc.
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
        <nav
            className="flex w-full items-center justify-between border-b border-gray-700 bg-[#1a1d27] px-6 py-3"
        // Full-width flex container with:
        // - justify-between: pushes logo to the left, user info to the right
        // - items-center: vertically centers everything
        // - border-b border-gray-700: subtle bottom border to separate navbar from content
        >
            {/* ===== LEFT SIDE: App Logo + Name ===== */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-cyan-400" />
                    <span className="text-lg font-semibold text-white">
                        LinguaBridge
                    </span>
                </div>

                {/* Language Selector */}
                <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-3 py-1.5 border border-gray-700">
                    <Globe className="h-4 w-4 text-zinc-400" />
                    <select
                        value={me?.preferredLanguage || "en"}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-transparent text-xs font-medium text-white outline-none cursor-pointer"
                    >
                        <option value="en" className="bg-gray-800">English</option>
                        <option value="hi" className="bg-gray-800">Hindi</option>
                        <option value="ja" className="bg-gray-800">Japanese</option>
                        <option value="es" className="bg-gray-800">Spanish</option>
                        <option value="fr" className="bg-gray-800">French</option>
                        <option value="de" className="bg-gray-800">German</option>
                    </select>
                </div>
            </div>

            {/* ===== RIGHT SIDE: User Name + Avatar ===== */}
            <div className="flex items-center gap-3">
                {/* Show the user's full name if available, otherwise show their email */}
                {user && (
                    <span className="text-sm text-zinc-300">
                        {user.fullName || user.primaryEmailAddress?.emailAddress}
                    </span>
                )}

                {/*
         * Why we use Clerk's <UserButton /> instead of building our own logout button:
         *
         * 1. It handles sign-out securely — Clerk manages session tokens, cookies,
         *    and cleanup automatically. Building this manually is error-prone.
         *
         * 2. It provides a pre-built dropdown with "Manage Account", "Sign Out",
         *    and other options — saving us from building a custom dropdown UI.
         *
         * 3. It renders the user's avatar automatically and syncs with Clerk's
         *    session state, so it always shows the correct user.
         *
         * 4. It follows security best practices (CSRF protection, proper token
         *    invalidation) that would be complex to implement ourselves.
         */}
                <UserButton
                    afterSwitchSessionUrl="/sign-in"
                    appearance={{
                        elements: {
                            avatarBox: "h-8 w-8", // Control avatar size with Tailwind classes
                        },
                    }}
                />
            </div>
        </nav>
    );
}
