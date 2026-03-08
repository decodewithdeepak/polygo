/**
 * ConversationItem — Renders a single conversation row in the sidebar.
 * Props: conversation data, other user info, last message, active state, unread count.
 *
 * Kept as a separate component so ConversationList stays clean and this
 * item can be tested independently. Each row shows:
 *   - Avatar (with online dot)
 *   - User name
 *   - Last message preview (truncated)
 *   - Timestamp of last message
 */

"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Id } from "../../../convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils/formatTime";
import OnlineIndicator from "../ui/OnlineIndicator";
import { Users } from "lucide-react";

interface ConversationItemProps {
    conversationId: Id<"conversations">;
    // DM props
    otherUser?: {
        name: string;
        imageUrl: string;
        isOnline: boolean;
    };
    // Group props
    isGroup?: boolean;
    groupName?: string;
    memberCount?: number;
    lastMessageSenderName?: string;
    // Shared
    lastMessage: {
        content: string;
        createdAt: number;
    } | null;
    isActive: boolean;
    unreadCount: number;
}

export default function ConversationItem({
    conversationId,
    otherUser,
    isGroup,
    groupName,
    memberCount,
    lastMessageSenderName,
    lastMessage,
    isActive,
    unreadCount,
}: ConversationItemProps) {
    const router = useRouter();

    // Timestamp formatting is now handled by the shared formatMessageTime utility
    // Consistent formatting across sidebar preview and message bubbles

    // Shared display values — group vs DM
    const displayName = isGroup ? (groupName ?? "Group") : (otherUser?.name ?? "Unknown");
    const avatarLetter = displayName.charAt(0).toUpperCase();
    const avatarUrl = isGroup ? undefined : otherUser?.imageUrl;
    const isOnline = isGroup ? false : (otherUser?.isOnline ?? false);

    // Last message preview for groups includes sender name
    const lastMessagePreview = lastMessage
        ? isGroup && lastMessageSenderName
            ? `${lastMessageSenderName.split(" ")[0]}: ${lastMessage.content}`
            : lastMessage.content
        : "No messages yet";

    return (
        <div
            onClick={() => router.push(`/conversations/${conversationId}`)}
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors ${isActive
                ? "bg-zinc-800"
                : "hover:bg-zinc-800/50"
                }`}
        >
            {/* ===== Avatar ===== */}
            <div className="relative flex-shrink-0">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={44}
                        height={44}
                        priority
                        className="h-11 w-11 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-sm font-semibold text-zinc-100">
                        {isGroup ? (
                            <Users className="h-5 w-5 text-zinc-400" />
                        ) : (
                            avatarLetter
                        )}
                    </div>
                )}

                {/* Online indicator — only for DMs */}
                {!isGroup && (
                    <span className="absolute bottom-0 right-0 rounded-full border-2 border-zinc-950">
                        <OnlineIndicator isOnline={isOnline} size="md" />
                    </span>
                )}
            </div>

            {/* ===== Conversation Info (Name + Last Message) ===== */}
            <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-semibold text-white">
                        {displayName}
                    </h3>
                    {lastMessage && (
                        <span className="ml-2 flex-shrink-0 text-[11px] text-zinc-500">
                            {formatMessageTime(lastMessage.createdAt)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <p className="truncate text-xs text-zinc-400">
                        {lastMessagePreview}
                    </p>
                    {unreadCount > 0 && (
                        <span className="ml-2 flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 px-1 text-[10px] font-bold text-zinc-900 shadow-sm">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
