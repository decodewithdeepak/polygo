import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        externalId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        isOnline: v.boolean(),
        lastSeen: v.number(),
        preferredLanguage: v.string(), // "en", "hi", "ja", etc.
        hasCompletedOnboarding: v.optional(v.boolean()),
    }).index("by_externalId", ["externalId"]),

    conversations: defineTable({
        participantIds: v.array(v.id("users")),
        // Deterministic key "smallerId|largerId" — enables unique index lookup
        // to prevent race-condition duplicate conversations.
        participantPair: v.optional(v.string()),
    })
        .index("by_participantPair", ["participantPair"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        read: v.boolean(),
        createdAt: v.number(),
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        // AI-powered fields
        translations: v.optional(v.record(v.string(), v.string())),
        nuanceFlags: v.optional(v.object({
            hasNuance: v.boolean(),
            type: v.string(),
            explanation: v.string(),
        })),
    }).index("by_conversationId", ["conversationId"]),

    reactions: defineTable({
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    })
        .index("by_messageId", ["messageId"])
        .index("by_message_user", ["messageId", "userId"]),

    // Typing indicators — tracks who is currently typing in which conversation.
    // One record per user per conversation (upsert pattern, not one per keystroke).
    // Records auto-expire: the query filters out records older than 3 seconds.
    typing: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        updatedAt: v.number(), // last keystroke timestamp — refreshed on each keystroke
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_conversationId_userId", ["conversationId", "userId"]),
});
