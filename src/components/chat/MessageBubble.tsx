/**
 * MessageBubble — Renders a single chat message as a styled bubble.
 *
 * Handles two states:
 *   1. Normal message — content, timestamp, optional delete button (sender only)
 *   2. Deleted message — muted "This message was deleted" placeholder
 */

"use client";

import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SARVAM_LANG_CODES } from "../../../convex/shared";
import { Id } from "../../../convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils/formatTime";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Volume2, Loader2 } from "lucide-react";
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
    isGroup?: boolean;
}

export default function MessageBubble({ message, isMyMessage, currentUserId, isGroup }: MessageBubbleProps) {
    const deleteMessage = useMutation(api.messages.deleteMessage);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDelete = async () => {
        await deleteMessage({ messageId: message._id });
        setConfirmOpen(false);
    };

    const runGenerateTTS = useAction(api.sarvam.generateTTS);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = async () => {
        if (isPlaying) return;
        setIsPlaying(true);
        try {
            const base64 = await runGenerateTTS({
                text: displayContent,
                target_language_code: userLang === "en" ? "en-IN" : (SARVAM_LANG_CODES[userLang] || "en-IN"),
                speaker: me?.preferredSpeaker || "shubh",
            });

            if (base64) {
                const audio = new Audio("data:audio/wav;base64," + base64);
                audio.onended = () => setIsPlaying(false);
                await audio.play();
            } else {
                setIsPlaying(false);
            }
        } catch (error) {
            console.error("Playback error:", error);
            setIsPlaying(false);
        }
    };

    const me = useQuery(api.users.getMe);
    const [showOriginal, setShowOriginal] = useState(false);

    const userLang = me?.preferredLanguage || "en";
    const translation = message.translations?.[userLang];
    const hasTranslation = !!translation;
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
                        ? "rounded-br-sm bg-zinc-800/60 border border-zinc-700/50"
                        : "rounded-bl-sm bg-zinc-800/60 border border-zinc-700/50"
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
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
                            {message.sender.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}

            {/* ===== Message Bubble ===== */}
            <div className="max-w-[70%] group relative">
                {/* Sender name — only in group chats, only for others' messages */}
                {isGroup && !isMyMessage && (
                    <p className="mb-0.5 ml-1 text-[11px] font-medium text-zinc-500">
                        {message.sender.name}
                    </p>
                )}
                <div className="relative flex items-center gap-1">
                    <div
                        className={`relative rounded-2xl px-4 py-2 ${isMyMessage
                            ? "rounded-br-sm bg-zinc-100 text-zinc-900 shadow-sm"
                            : "rounded-bl-sm bg-zinc-800 text-white border border-zinc-700/50"
                            }`}
                    >
                        {/* Language Tip — shows on hover, tooltip on hover */}
                        {message.nuanceFlags?.hasNuance && (
                            <div className="absolute -top-2 -right-2 z-[100] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="relative group/tip">
                                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold shadow-lg cursor-default ${isMyMessage
                                        ? "bg-white border-zinc-300 text-zinc-900"
                                        : "bg-zinc-900 border-zinc-600 text-white"
                                        }`}>
                                        i
                                    </div>
                                    <div className={`absolute bottom-full mb-2 w-64 p-3 bg-zinc-950 border border-zinc-800 text-zinc-100 text-[12px] shadow-2xl rounded-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 pointer-events-none z-[200] ${isMyMessage ? "right-0" : "left-0"}`}>
                                        <div className="flex flex-col gap-1.5 leading-relaxed">
                                            <div className="flex items-center gap-2 border-b border-zinc-800 pb-1.5 mb-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                                <span className="font-medium text-zinc-400 text-[10px] uppercase tracking-[0.15em]">Language Insight</span>
                                            </div>
                                            <span className="text-zinc-300">{message.nuanceFlags.explanation}</span>
                                        </div>
                                        <div className={`absolute bottom-0 translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 ${isMyMessage ? "right-4" : "left-4"}`} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {displayContent}
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <p className={`text-[9px] ${isMyMessage ? "text-zinc-500" : "text-zinc-500"}`}>
                                    <span className="uppercase font-semibold tracking-wider mr-1">{isTranslated ? userLang : (Object.keys(message.translations ?? {})[0] ?? userLang)}</span>
                                    · {formattedTime} {isTranslated && "· Translated"}
                                </p>
                                <button
                                    onClick={handlePlay}
                                    disabled={isPlaying}
                                    className={`p-1 rounded-full hover:bg-zinc-200/50 transition-colors ${isPlaying ? "animate-pulse" : ""
                                        } ${isMyMessage ? "text-zinc-600" : "text-zinc-400"}`}
                                    title="Play message"
                                >
                                    {isPlaying ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Volume2 className="h-3 w-3" />
                                    )}
                                </button>
                            </div>

                            {hasTranslation && (
                                <button
                                    onClick={() => setShowOriginal(!showOriginal)}
                                    className={`text-[9px] font-bold underline transition-opacity hover:opacity-80 ${isMyMessage ? "text-zinc-900" : "text-zinc-400"
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
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-700/50 text-zinc-400 hover:text-red-400"
                                        aria-label="Delete message"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-3 bg-zinc-900 border-zinc-700 text-white"
                                    side={isMyMessage ? "left" : "right"}
                                >
                                    <p className="text-sm mb-2">Delete this message?</p>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setConfirmOpen(false)}
                                            className="px-3 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600 transition-colors"
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
