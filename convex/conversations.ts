/**
 * Conversations Module
 *
 * This file handles all conversation-related backend logic for the chat app.
 *
 * DATA MODEL:
 * A "conversation" in our app is a simple document with one field:
 *   - participantIds: an array of exactly 2 user IDs (for 1-on-1 chat)
 *
 * We chose to store participants as an ARRAY of user IDs rather than
 * separate "user1Id" and "user2Id" fields because:
 *   1. It scales naturally if we ever add group chats (just add more IDs)
 *   2. It avoids the ambiguity of "which user goes in user1 vs user2?"
 *   3. Querying is straightforward with array methods
 *
 * IMPORTANT: Each pair of users should have AT MOST ONE conversation.
 * The `getOrCreate` mutation enforces this — it reuses existing
 * conversations instead of creating duplicates.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * getOrCreate — Find an existing conversation with a user, or create a new one.
 *
 * This is the primary way conversations are initiated in the app.
 * When a user clicks on another user in the sidebar, we call this mutation
 * to either retrieve the existing conversation or start a new one.
 *
 * @param participantId - The Convex document ID of the OTHER user
 * @returns The conversation's document ID (_id)
 *
 * WHY "getOrCreate" PATTERN?
 * Instead of having separate "create" and "get" functions, we combine them.
 * This prevents a race condition where two users could simultaneously create
 * duplicate conversations with each other. The mutation checks first, then
 * creates only if needed — all in one atomic server-side operation.
 */
export const getOrCreate = mutation({
    args: {
        participantId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Step 1: Authenticate the current user
        // Convex gives us the authenticated user from the Auth0 JWT.
        // The `getUserIdentity()` method reads the JWT token that Auth0
        // attached to the request — this is how Convex knows WHO is calling.
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Step 2: Find the current user's document in our users table
        // We match by `externalId` (which is `identity.subject` from the JWT)
        // because that's the unique identifier Auth0 gives each user.
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
            .unique();

        if (!currentUser) {
            throw new Error("User not found in database");
        }

        // Step 3: Check if a conversation already exists between these two users
        //
        // DETERMINISTIC ORDERING:
        // We always sort participantIds so that the smaller ID comes first.
        // This means [alice, bob] and [bob, alice] both become the same
        // sorted array — preventing duplicates from race conditions where
        // both users click "new chat" simultaneously.
        const sortedIds = [currentUser._id, args.participantId].sort();

        const existingConversation = await ctx.db
            .query("conversations")
            .withIndex("by_participantPair", (q) =>
                q.eq("participantPair", `${sortedIds[0]}|${sortedIds[1]}`)
            )
            .unique();

        // Step 4: If conversation already exists, return its ID
        if (existingConversation) {
            return existingConversation._id;
        }

        // Step 5: No existing conversation found — create a new one
        // participantIds stored in deterministic sorted order.
        const conversationId = await ctx.db.insert("conversations", {
            participantIds: sortedIds,
            participantPair: `${sortedIds[0]}|${sortedIds[1]}`,
        });

        return conversationId;
    },
});

/**
 * getAll — Fetch all conversations for the current user, enriched with metadata.
 *
 * This powers the conversation sidebar. Instead of making 3 separate queries
 * (conversations, users, last messages), we do it all in ONE query.
 * This is more efficient because:
 *   1. Single network round-trip instead of three
 *   2. Convex's reactive system only needs to track one subscription
 *   3. The UI gets a single, clean data structure to render
 *
 * @returns Array of { conversation, otherUser, lastMessage, unreadCount } objects
 *          - conversation: the conversation document
 *          - otherUser: the other participant's user document (name, avatar, etc.)
 *          - lastMessage: the most recent message in this conversation (or null)
 *          - unreadCount: number of unread messages from the other person
 */
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        // Authenticate — return empty array if not logged in
        // (queries should never throw, they just return empty/null)
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        // Find the current user's document
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
            .unique();

        if (!currentUser) {
            return [];
        }

        // Get ALL conversations from the database
        // Then filter to only those where the current user is a participant
        //
        // WHY FILTER CLIENT-SIDE?
        // Convex doesn't natively support "array contains" index queries.
        // Since conversations are relatively few (each user has maybe 10-50),
        // filtering in memory on the server is fast and simple.
        const allConversations = await ctx.db.query("conversations").collect();

        const myConversations = allConversations.filter((conversation) =>
            conversation.participantIds.includes(currentUser._id)
        );

        // For each conversation, fetch the OTHER user's info and the last message.
        // We use Promise.all to fetch all conversations in PARALLEL, not sequentially.
        // This is much faster when there are multiple conversations.
        const conversationsWithDetails = await Promise.all(
            myConversations.map(async (conversation) => {
                // ─── Group Conversation ───────────────────────────────────
                if (conversation.isGroup) {
                    const lastMessage = await ctx.db
                        .query("messages")
                        .withIndex("by_conversationId", (q) =>
                            q.eq("conversationId", conversation._id)
                        )
                        .order("desc")
                        .first();

                    const allMessages = await ctx.db
                        .query("messages")
                        .withIndex("by_conversationId", (q) =>
                            q.eq("conversationId", conversation._id)
                        )
                        .collect();

                    const unreadCount = allMessages.filter(
                        (msg) => msg.senderId !== currentUser._id && msg.read === false
                    ).length;

                    // Get sender name for last message preview
                    let lastMessageSenderName: string | undefined;
                    if (lastMessage) {
                        const sender = await ctx.db.get(lastMessage.senderId);
                        lastMessageSenderName = sender?.name;
                    }

                    return {
                        conversation,
                        otherUser: null,
                        lastMessage,
                        lastMessageSenderName,
                        unreadCount,
                        isGroup: true as const,
                        groupName: conversation.groupName ?? "Group",
                        memberCount: conversation.participantIds.length,
                    };
                }

                // ─── DM Conversation (existing logic) ────────────────────
                // Find the OTHER participant's ID
                // (the one that isn't the current user)
                const otherUserId = conversation.participantIds.find(
                    (id) => id !== currentUser._id
                );

                // Fetch the other user's document (name, avatar, online status)
                const otherUser = otherUserId
                    ? await ctx.db.get(otherUserId)
                    : null;

                // Fetch the most recent message in this conversation
                // We query messages with the conversationId index, order by
                // creation time descending (newest first), and take just 1.
                // This gives us the "last message" preview for the sidebar.
                const lastMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conversation._id)
                    )
                    .order("desc")
                    .first();

                // ─── Unread Count ─────────────────────────────────────────
                // Count messages where: read is false AND sender is NOT the
                // current user. We only count messages FROM the other person
                // because your own sent messages don't count as "unread".
                //
                // unreadCount is computed here in the backend query, not the
                // frontend — one database operation instead of N separate
                // queries from each ConversationItem component.
                const allMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conversation._id)
                    )
                    .collect();

                const unreadCount = allMessages.filter(
                    (msg) => msg.senderId !== currentUser._id && msg.read === false
                ).length;

                return {
                    conversation,
                    otherUser,
                    lastMessage,
                    lastMessageSenderName: undefined,
                    unreadCount,
                    isGroup: false as const,
                    groupName: undefined,
                    memberCount: undefined,
                };
            })
        );

        // Sort conversations by last message time (most recent first)
        // Conversations with messages appear above conversations with no messages.
        // This mimics WhatsApp/Messenger behavior where the most recently
        // active chat always floats to the top.
        return conversationsWithDetails.sort((a, b) => {
            const aTime = a.lastMessage?.createdAt ?? 0;
            const bTime = b.lastMessage?.createdAt ?? 0;
            return bTime - aTime;
        });
    },
});

/**
 * backfillParticipantPairs — One-time migration to populate participantPair
 * on existing conversations that were created before this field existed.
 * Run once via Convex dashboard, then delete.
 */
export const backfillParticipantPairs = mutation({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("conversations").collect();
        let updated = 0;
        for (const conv of all) {
            if (!conv.participantPair) {
                const sorted = [...conv.participantIds].sort();
                await ctx.db.patch(conv._id, {
                    participantPair: `${sorted[0]}|${sorted[1]}`,
                });
                updated++;
            }
        }
        return { updated };
    },
});
