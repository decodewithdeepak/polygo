"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ArrowLeft, Trash2, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface GroupChatHeaderProps {
    groupName: string;
    memberCount: number;
    conversationId: Id<"conversations">;
    onInfoClick: () => void;
}

export default function GroupChatHeader({
    groupName,
    memberCount,
    conversationId,
    onInfoClick,
}: GroupChatHeaderProps) {
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
            {/* Mobile Back Button */}
            <button
                onClick={() => router.push("/")}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-zinc-700/50 md:hidden"
            >
                <ArrowLeft className="h-5 w-5 text-zinc-400" />
            </button>

            {/* Group Avatar — initial letter */}
            <div
                className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-bold text-zinc-100"
                onClick={onInfoClick}
            >
                {groupName.charAt(0).toUpperCase()}
            </div>

            {/* Group Name + Member Count */}
            <div className="flex-1 cursor-pointer" onClick={onInfoClick}>
                <h2 className="text-sm font-semibold text-white">{groupName}</h2>
                <p className="text-xs text-zinc-400">
                    {memberCount} member{memberCount !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Info button */}
            <button
                onClick={onInfoClick}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                title="Group info"
            >
                <Info className="h-4 w-4" />
            </button>

            {/* Clear Chat */}
            <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
                <PopoverTrigger asChild>
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400"
                        title="Clear chat"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-64 border-zinc-700 bg-zinc-900 p-4 text-white shadow-xl"
                    side="bottom"
                    align="end"
                >
                    <p className="mb-1 text-sm font-medium">Clear this group chat?</p>
                    <p className="mb-3 text-xs text-zinc-400">
                        This will delete all messages for everyone. This cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setConfirmOpen(false)}
                            className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs transition-colors hover:bg-zinc-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleClearChat}
                            disabled={clearing}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs transition-colors hover:bg-red-500 disabled:opacity-50"
                        >
                            {clearing ? "Clearing..." : "Clear All"}
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
