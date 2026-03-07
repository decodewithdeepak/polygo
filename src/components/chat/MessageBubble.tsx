/**
 * MessageBubble — Renders a single chat message as a styled bubble.
 *
 * Handles two states:
 *   1. Normal message — content, timestamp, optional delete button (sender only)
 *   2. Deleted message — muted "This message was deleted" placeholder
 */

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils/formatTime";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import ReactionPicker from "./ReactionPicker";
import MessageReactions from "./MessageReactions";

interface MessageBubbleProps {
    message: {
        _id: Id<"messages">;
        content: string;
        createdAt: number;
        senderId: Id<"users">;
        isDeleted: boolean;
        sender: {
            name: string;
            imageUrl: string;
        };
        translations?: Record<string, string>;
        nuanceFlags?: {
            hasNuance: boolean;
            type: string;
            explanation: string;
        };
    };
    isMyMessage: boolean;
    currentUserId: Id<"users">;
}

export default function MessageBubble({ message, isMyMessage, currentUserId }: MessageBubbleProps) {
    const deleteMessage = useMutation(api.messages.deleteMessage);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDelete = async () => {
        await deleteMessage({ messageId: message._id });
        setConfirmOpen(false);
    };

    const me = useQuery(api.users.getMe);
    const [showOriginal, setShowOriginal] = useState(false);

    const userLang = me?.preferredLanguage || "en";
    const translation = message.translations?.[userLang];
    const hasTranslation = !!translation && userLang !== "en"; // simplified check
    const displayContent = (hasTranslation && !showOriginal) ? translation : message.content;
    const isTranslated = hasTranslation && !showOriginal;

    // ─── Deleted message: minimal placeholder bubble ───
    if (message.isDeleted) {
        return (
            <div
                className={`flex items-end gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}
            >
                {!isMyMessage && (
                    <div className="flex-shrink-0">
                        {message.sender.imageUrl ? (
                            <Image
                                src={message.sender.imageUrl}
                                alt={message.sender.name}
                                width={28}
                                height={28}
                                className="h-7 w-7 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-xs font-semibold text-white">
                                {message.sender.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                )}

                <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMyMessage
                        ? "rounded-br-sm bg-gray-800/60 border border-gray-700/50"
                        : "rounded-bl-sm bg-gray-800/60 border border-gray-700/50"
                        }`}
                >
                    <p className="text-sm italic text-zinc-500">🚫 This message was deleted</p>
                </div>
            </div>
        );
    }

    // ─── Normal message bubble ───
    const formattedTime = formatMessageTime(message.createdAt);
    const canDelete = message.senderId === currentUserId;

    return (
        <div
            className={`group flex items-end gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}
        >
            {!isMyMessage && (
                <div className="flex-shrink-0">
                    {message.sender.imageUrl ? (
                        <Image
                            src={message.sender.imageUrl}
                            alt={message.sender.name}
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-xs font-semibold text-white">
                            {message.sender.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}

            {/* ===== Message Bubble ===== */}
            <div className="max-w-[70%]">
                <div className="relative flex items-center gap-1">
                    <div
                        className={`relative rounded-2xl px-4 py-2 ${isMyMessage
                            ? "rounded-br-sm bg-purple-600 text-white"
                            : "rounded-bl-sm bg-gray-700 text-white"
                            }`}
                    >
                        {/* Nuance Warning Badge */}
                        {message.nuanceFlags?.hasNuance && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black shadow-lg hover:bg-amber-400 transition-colors">
                                        ⚠️
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3 bg-gray-800 border-amber-500/50 text-white text-xs">
                                    <p className="font-bold text-amber-400 mb-1">
                                        Cultural Nuance Detected ({message.nuanceFlags.type})
                                    </p>
                                    <p className="leading-relaxed opacity-90">
                                        {message.nuanceFlags.explanation}
                                    </p>
                                </PopoverContent>
                            </Popover>
                        )}

                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {displayContent}
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-4">
                            <p className={`text-[10px] ${isMyMessage ? "text-purple-200" : "text-zinc-400"}`}>
                                {formattedTime} {isTranslated && "• Translated"}
                            </p>

                            {hasTranslation && (
                                <button
                                    onClick={() => setShowOriginal(!showOriginal)}
                                    className={`text-[10px] font-bold underline transition-opacity hover:opacity-80 ${isMyMessage ? "text-purple-100" : "text-cyan-400"
                                        }`}
                                >
                                    {showOriginal ? "Show Translation" : "Show Original"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Hover action buttons — reaction picker + delete */}
                    <div className="flex items-center gap-0.5">
                        <ReactionPicker messageId={message._id} isMyMessage={isMyMessage} />
                        {canDelete && (
                            <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700/50 text-zinc-400 hover:text-red-400"
                                        aria-label="Delete message"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-3 bg-gray-800 border-gray-700 text-white"
                                    side={isMyMessage ? "left" : "right"}
                                >
                                    <p className="text-sm mb-2">Delete this message?</p>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setConfirmOpen(false)}
                                            className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>

                {/* Reaction pills below the bubble */}
                <MessageReactions messageId={message._id} currentUserId={currentUserId} />
            </div>
        </div>
    );
}
