/**
 * Conversation Page — The main chat view for a specific conversation.
 *
 * This page is the GLUE — it fetches data from Convex and passes it down
 * to dumb, presentational components. It doesn't render any UI itself
 * beyond assembling the child components into a layout.
 *
 * Architecture pattern: "Smart Parent, Dumb Children"
 *   - This page = "smart" (handles data fetching, mutations, state)
 *   - ChatHeader, MessageList, MessageInput = "dumb" (just render props)
 *   - This separation makes each component testable and explainable
 *
 * Route: /conversations/[id] — the [id] is the Convex conversation document ID
 *
 * RESPONSIVE BEHAVIOR:
 * On mobile, this page occupies the FULL SCREEN (sidebar is hidden via CSS
 * in layout.tsx). The ChatHeader includes a back arrow (md:hidden) to let
 * users return to the conversation list.
 * On desktop, this page sits to the right of the always-visible sidebar.
 *
 * ERROR HANDLING:
 * - sendMessage: wrapped in try/catch — shows a toast on failure so the user
 *   knows their message wasn't delivered (instead of silently dropping it)
 * - Invalid conversationId: if the user navigates to a conversation they
 *   don't belong to, we redirect to / instead of showing a broken page
 */

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ChatHeader from "@/components/chat/ChatHeader";
import GroupChatHeader from "@/components/chat/GroupChatHeader";
import GroupInfoPanel from "@/components/group/GroupInfoPanel";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import MessageSkeleton from "@/components/ui/MessageSkeleton";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

// Next.js 15+ uses `use()` to unwrap params promises in client components
interface ConversationPageProps {
    params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
    const { id } = use(params);
    const conversationId = id as Id<"conversations">;
    const router = useRouter();
    const [showGroupInfo, setShowGroupInfo] = useState(false);

    // ─── Data Fetching (Real-Time Subscriptions) ──────────────────────────
    const messages = useQuery(api.messages.getByConversation, { conversationId });
    const currentUser = useQuery(api.users.getMe);
    const conversations = useQuery(api.conversations.getAll);

    // ─── Mutation for Sending Messages ────────────────────────────────────
    const sendMessage = useMutation(api.messages.send);

    const handleSendMessage = async (content: string) => {
        try {
            await sendMessage({ conversationId, content });
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
            console.error("[sendMessage] Error:", error);
        }
    };

    // ─── Typing Indicator Hook ───────────────────────────────────────────
    const { notifyTyping, notifyStopped } = useTypingIndicator(conversationId);

    // ─── Mark Messages as Read ───────────────────────────────────────────
    const markAsRead = useMutation(api.messages.markAsRead);

    useEffect(() => {
        if (messages && messages.length > 0) {
            markAsRead({ conversationId }).catch(console.error);
        }
    }, [conversationId, messages, markAsRead]);

    // ─── Loading State ────────────────────────────────────────────────────
    if (messages === undefined || currentUser === undefined || conversations === undefined) {
        return (
            <div className="flex h-full flex-col bg-zinc-950">
                <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3 md:px-6">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />
                    <div className="h-4 w-28 animate-pulse rounded bg-zinc-800" />
                </div>
                <MessageSkeleton />
                <div className="border-t border-zinc-800 bg-zinc-900 p-4">
                    <div className="h-11 animate-pulse rounded-xl bg-zinc-800" />
                </div>
            </div>
        );
    }

    // ─── Find This Conversation ───────────────────────────────────────────
    const currentConversation = conversations.find(
        (c) => c.conversation._id === conversationId
    );

    if (!currentConversation || !currentUser) {
        router.push("/");
        return null;
    }

    const isGroup = currentConversation.isGroup;

    // For DMs, we need the other user
    if (!isGroup && !currentConversation.otherUser) {
        router.push("/");
        return null;
    }

    // ─── Assemble the Chat Interface ──────────────────────────────────────
    return (
        <div className="flex h-full flex-row bg-zinc-950">
            {/* Main chat column */}
            <div className="flex flex-1 flex-col">
                {/* Header — Group or DM */}
                {isGroup ? (
                    <GroupChatHeader
                        groupName={currentConversation.groupName ?? "Group"}
                        memberCount={currentConversation.memberCount ?? 0}
                        conversationId={conversationId}
                        onInfoClick={() => setShowGroupInfo(!showGroupInfo)}
                    />
                ) : (
                    <ChatHeader
                        otherUser={{
                            name: currentConversation.otherUser!.name,
                            imageUrl: currentConversation.otherUser!.imageUrl,
                            isOnline: currentConversation.otherUser!.isOnline,
                        }}
                        conversationId={conversationId}
                    />
                )}

                {/* Messages */}
                <MessageList
                    messages={messages}
                    currentUserId={currentUser._id}
                    isGroup={isGroup}
                />

                {/* Typing indicator */}
                <TypingIndicator conversationId={conversationId} />

                {/* Message input */}
                <MessageInput
                    onSendMessage={handleSendMessage}
                    onTyping={notifyTyping}
                    onStoppedTyping={notifyStopped}
                    recentMessages={(messages || [])
                        .filter((m) => !m.isDeleted)
                        .slice(-6)
                        .map((m) => ({ content: m.content, isFromMe: m.senderId === currentUser._id }))
                    }
                />
            </div>

            {/* Group Info Side Panel */}
            {isGroup && showGroupInfo && (
                <div className="hidden w-80 md:block">
                    <GroupInfoPanel
                        conversationId={conversationId}
                        onClose={() => setShowGroupInfo(false)}
                    />
                </div>
            )}
        </div>
    );
}

