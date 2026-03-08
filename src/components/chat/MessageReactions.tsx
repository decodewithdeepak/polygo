"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface MessageReactionsProps {
    messageId: Id<"messages">;
    currentUserId: Id<"users">;
}

export default function MessageReactions({ messageId, currentUserId }: MessageReactionsProps) {
    const reactions = useQuery(api.reactions.getReactions, { messageId });
    const toggleReaction = useMutation(api.reactions.toggleReaction);

    if (!reactions || reactions.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map(({ emoji, count, userIds }) => {
                const hasReacted = userIds.includes(currentUserId);

                return (
                    <button
                        key={emoji}
                        onClick={() => toggleReaction({ messageId, emoji })}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${hasReacted
                            ? "bg-zinc-700 border border-zinc-500 text-zinc-100"
                            : "bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:bg-zinc-700/50"
                            }`}
                    >
                        <span>{emoji}</span>
                        <span>{count}</span>
                    </button>
                );
            })}
        </div>
    );
}
