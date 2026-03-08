/**
 * ChatHeader — Displays who you're chatting with at the top of the conversation.
 * Props: otherUser (name, imageUrl, isOnline) for the other participant.
 *
 * Purely presentational — just displays who you're talking to.
 * No state, no side effects, no data fetching. This makes it easy to
 * test, reuse, and explain in an interview.
 *
 * RESPONSIVE BEHAVIOR:
 * On mobile, a back arrow appears to let users return to the conversation list.
 * The back button is IN the header (not a separate component) because it's
 * visually part of the header on mobile — placing it elsewhere would break
 * the visual flow and require extra layout calculations.
 * On desktop (md+), the back button is hidden because the sidebar is always visible.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ArrowLeft, Trash2 } from "lucide-react";
import Image from "next/image";
import OnlineIndicator from "../ui/OnlineIndicator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChatHeaderProps {
    otherUser: {
        name: string;
        imageUrl: string;
        isOnline: boolean;
    };
    conversationId: Id<"conversations">;
}

export default function ChatHeader({ otherUser, conversationId }: ChatHeaderProps) {
    const router = useRouter();
    const clearChat = useMutation(api.messages.clearChat);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [clearing, setClearing] = useState(false);

    const handleClearChat = async () => {
        setClearing(true);
        try {
            await clearChat({ conversationId });
        } finally {
            setClearing(false);
            setConfirmOpen(false);
        }
    };

    return (
        <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:px-6">
            {/* px-4 on mobile (tighter), md:px-6 on desktop (more breathing room) */}

            {/* ===== Mobile Back Button ===== */}
            {/* md:hidden: only visible on mobile — on desktop the sidebar handles navigation */}
            {/* On mobile the back button replaces the always-visible sidebar. */}
            {/* On desktop both sidebar and chat are visible simultaneously */}
            <button
                onClick={() => router.push("/")}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-700/50 md:hidden"
            // md:hidden: CSS-based hiding — no JS needed, no re-render on resize
            // We use router.push("/") instead of router.back() so the user
            // always lands on the conversation list, not an unpredictable history entry
            >
                <ArrowLeft className="h-5 w-5 text-zinc-400" />
            </button>

            {/* ===== Avatar ===== */}
            <div className="relative">
                {otherUser.imageUrl ? (
                    // Next.js Image automatically optimizes format (WebP)
                    // and prevents layout shift with explicit width/height.
                    // `priority` disables lazy loading — this avatar is at the
                    // top of the chat view, always visible on first paint.
                    <Image
                        src={otherUser.imageUrl}
                        alt={otherUser.name}
                        width={40}
                        height={40}
                        priority
                        className="h-10 w-10 rounded-full object-cover"
                    />
                ) : (
                    // Fallback: first letter of name in a colored circle
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-sm font-semibold text-zinc-100">
                        {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Online/Offline indicator — uses shared OnlineIndicator */}
                {/* "lg" size since the header has more visual space */}
                <span className="absolute bottom-0 right-0 rounded-full border-2 border-[#1a1d27]">
                    <OnlineIndicator isOnline={otherUser.isOnline} size="lg" />
                </span>
            </div>

            {/* ===== Name + Status ===== */}
            <div className="flex-1">
                <h2 className="text-sm font-semibold text-white">
                    {otherUser.name}
                </h2>
                <p className="text-xs text-zinc-400">
                    {otherUser.isOnline ? "Online" : "Offline"}
                </p>
            </div>

            {/* ===== Clear Chat ===== */}
            <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
                <PopoverTrigger asChild>
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400"
                        title="Clear chat"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 bg-zinc-900 border-zinc-700 text-white shadow-xl" side="bottom" align="end">
                    <p className="text-sm font-medium mb-1">Clear this conversation?</p>
                    <p className="text-xs text-zinc-400 mb-3">This will delete all messages for both users. This cannot be undone.</p>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setConfirmOpen(false)}
                            className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleClearChat}
                            disabled={clearing}
                            className="px-3 py-1.5 text-xs rounded-md bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
                        >
                            {clearing ? "Clearing..." : "Clear All"}
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
