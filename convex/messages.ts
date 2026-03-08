/**
 * Messages Module
 *
 * Messages are the core of the chat app. This file contains just two functions:
 *   - `send`  → writes a new message to a conversation
 *   - `getByConversation` → reads all messages in a conversation
 *
 * Convex makes the read function (`getByConversation`) a LIVE SUBSCRIPTION
 * automatically. When any client calls `useQuery(api.messages.getByConversation)`,
 * Convex keeps a WebSocket connection open and pushes new messages to the
 * frontend instantly — no polling, no manual refetch, no "pull to refresh".
 *
 * SECURITY MODEL:
 * Both functions verify that the requesting user is a participant in the
 * conversation. This prevents malicious users from reading or writing
 * messages in conversations they don't belong to.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * send — Insert a new message into a conversation.
 *
 * Called when a user types a message and hits Enter/Send.
 * The message is stored with `read: false` by default — the recipient's
 * client will mark it as read when they view the conversation.
 *
 * @param conversationId - The conversation to send the message in
 * @param content - The text content of the message
 * @returns The newly created message's document ID
 */
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Authenticate the current user
    // Get the identity from the Auth0 JWT token attached to this request.
    // If there's no valid token, the user isn't logged in.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the current user's document using their external ID (Auth0 sub)
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found in database");
    }

    // Step 2: Fetch the conversation document
    // We need this to verify the user is actually a participant.
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Step 3: SECURITY CHECK — Verify the user belongs to this conversation
    //
    // NEVER TRUST THE CLIENT — always verify on the server that the user
    // belongs to this conversation. A malicious user could modify the
    // frontend code to send messages to any conversationId. This check
    // ensures that even if they do, the server will reject it.
    //
    // This is a fundamental principle in backend security:
    // "Client-side validation is for UX, server-side validation is for security."
    const isParticipant = conversation.participantIds.includes(currentUser._id);
    if (!isParticipant) {
      throw new Error(
        "Unauthorized: You are not a participant in this conversation",
      );
    }

    // Step 4: Insert the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: currentUser._id,
      content: args.content,
      read: false,
      createdAt: Date.now(),
      isDeleted: false,
    });

    // Step 5: Trigger AI translation.
    // For DMs: translate for the single receiver.
    // For groups: translate for each unique language among other participants.
    const senderLang = currentUser.preferredLanguage || "en";
    const otherParticipantIds = conversation.participantIds.filter(
      (id) => id !== currentUser._id
    );

    // Collect unique languages of all other participants
    const otherUsers = await Promise.all(
      otherParticipantIds.map((id) => ctx.db.get(id))
    );
    const targetLangs = [
      ...new Set(
        otherUsers
          .map((u) => u?.preferredLanguage || "en")
          .filter((lang) => lang !== senderLang)
      ),
    ];

    // Schedule an AI call for EACH unique target language.
    // In a group with Bengali, Hindi, and English speakers,
    // a message in English triggers translations to bn and hi separately.
    for (const targetLang of targetLangs) {
      await ctx.scheduler.runAfter(0, (api as any).ai.processMessageAI, {
        messageId,
        text: args.content,
        senderLang: senderLang,
        receiverLang: targetLang,
      });
    }

    // If no translation needed (everyone speaks the same language),
    // still run once for learning tips.
    if (targetLangs.length === 0) {
      await ctx.scheduler.runAfter(0, (api as any).ai.processMessageAI, {
        messageId,
        text: args.content,
        senderLang: senderLang,
        receiverLang: senderLang,
      });
    }

    return messageId;
  },
});

/**
 * updateAIResults — Internal mutation called by the AI Action.
 * Updates a message with its translations and nuance flags.
 */
export const updateAIResults = mutation({
  args: {
    messageId: v.id("messages"),
    translations: v.record(v.string(), v.string()),
    nuanceFlags: v.object({
      hasNuance: v.boolean(),
      type: v.string(),
      explanation: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Merge new translations with existing ones (important for groups
    // where multiple AI calls produce translations for different languages)
    const existing = await ctx.db.get(args.messageId);
    const mergedTranslations = {
      ...(existing?.translations ?? {}),
      ...args.translations,
    };

    await ctx.db.patch(args.messageId, {
      translations: mergedTranslations,
      nuanceFlags: args.nuanceFlags,
    });
  },
});

/**
 * deleteMessage — Soft-deletes a message (clears content, keeps record).
 *
 * Only the message sender can delete their own message. The record stays
 * in Convex so conversation flow isn't broken — the frontend renders
 * a "This message was deleted" placeholder instead.
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found in database");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only the sender can delete their own message
    if (message.senderId !== currentUser._id) {
      throw new Error("Unauthorized: You can only delete your own messages");
    }

    // Soft delete — clear content AND metadata to prevent privacy leaks via translations
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      deletedAt: Date.now(),
      content: "",
      translations: undefined, // Clear translations!
      nuanceFlags: undefined, // Clear nuance flags!
    });
  },
});

/**
 * clearChat — Hard-deletes ALL messages in a conversation for both users.
 * Only a participant can clear the chat.
 */
export const clearChat = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (!currentUser) throw new Error("User not found");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const msg of messages) {
      // Delete associated reactions first
      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
        .collect();
      for (const r of reactions) {
        await ctx.db.delete(r._id);
      }
      await ctx.db.delete(msg._id);
    }
  },
});

/**
 * getByConversation — Fetch all messages in a conversation, enriched with sender info.
 *
 * This is subscribed to via `useQuery()` in the frontend, which means it
 * automatically updates in real-time when new messages arrive. The frontend
 * doesn't need to poll or manually refetch — Convex pushes updates via WebSocket.
 *
 * We enrich messages with sender info here on the BACKEND instead of making
 * separate queries in the frontend — fewer network round trips, and the
 * frontend gets a clean, ready-to-render data structure.
 *
 * @param conversationId - The conversation to fetch messages for
 * @returns Array of messages, each enriched with sender's name and avatar,
 *          sorted oldest-first (newest at the bottom, like WhatsApp)
 */
export const getByConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // Authenticate — return empty array if not logged in
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

    // SECURITY CHECK — same auth check as in `send` mutation.
    // Consistent security pattern: EVERY function that accesses
    // conversation data must verify the user is a participant.
    // This prevents users from reading other people's private messages
    // by guessing or brute-forcing conversation IDs.
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return [];
    }

    const isParticipant = conversation.participantIds.includes(currentUser._id);
    if (!isParticipant) {
      return [];
    }

    // Fetch all messages in this conversation using the index
    // Order: ascending (oldest first → newest at the bottom)
    // This matches the natural reading order in chat apps — you scroll
    // down to see newer messages.
    const conversationMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();

    // Enrich each message with the sender's user data (name + avatar)
    //
    // WHY WE DO THIS ON THE BACKEND:
    // Instead of returning raw messages and making the frontend call
    // `useQuery(api.users.getById, senderId)` for EACH message,
    // we look up the sender here. Benefits:
    //   1. Fewer network round trips (1 query instead of N+1)
    //   2. Frontend code is simpler — just render what we return
    //   3. All data arrives together, no loading waterfalls
    //
    // This is the "Backend for Frontend" (BFF) pattern — the server
    // shapes the data exactly how the UI needs it.
    const messagesWithSenders = await Promise.all(
      conversationMessages.map(async (message) => {
        // Look up the sender's user document
        const senderUser = await ctx.db.get(message.senderId);

        return {
          ...message,
          // Default for pre-existing messages that lack the field
          isDeleted: message.isDeleted ?? false,
          sender: {
            name: senderUser?.name ?? "Unknown",
            imageUrl: senderUser?.imageUrl ?? "",
          },
        };
      }),
    );

    return messagesWithSenders;
  },
});

// ─── Read Receipts ────────────────────────────────────────────────────────

/**
 * markAsRead — Marks all unread messages from the OTHER person as read.
 *
 * Called when the user opens a conversation or when new messages arrive
 * while the conversation is already open. This clears the unread badge
 * in the sidebar.
 *
 * WHY BATCH UPDATE:
 * We update ALL unread messages in a single operation rather than one at a time.
 * This is more efficient because:
 *   1. Fewer database round trips — one query + N patches vs N queries + N patches
 *   2. Convex batches mutations atomically — all updates succeed or none do
 *   3. The unread count drops to zero in one reactive update, not gradually
 *
 * WHY ONLY OTHER PERSON'S MESSAGES:
 * We only mark messages from the OTHER person as read — our own sent messages
 * are irrelevant to unread count. The user already knows about messages they
 * sent themselves; "unread" only applies to incoming messages.
 *
 * REAL-TIME UPDATE CHAIN:
 * 1. User opens conversation → markAsRead mutation fires
 * 2. Messages in DB get updated (read: false → true)
 * 3. Convex detects the change and re-evaluates conversations.getAll query
 * 4. getAll recomputes unreadCount (now 0) and pushes via WebSocket
 * 5. Sidebar ConversationItem re-renders with badge removed — all automatic
 */
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!currentUser) return null;

    // Find all messages in this conversation.
    // NOTE: We filter by 'read: false' in memory because adding 'read'
    // to the by_conversationId index would require a re-index.
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    // Filter: only messages that were sent by the OTHER person (not us)
    const messagesToMark = unreadMessages.filter(
      (msg) => msg.senderId !== currentUser._id,
    );

    // Batch update — mark all matching messages as read at once
    // Promise.all runs all patches in parallel for maximum efficiency
    await Promise.all(
      messagesToMark.map((msg) => ctx.db.patch(msg._id, { read: true })),
    );

    return messagesToMark.length; // return count for debugging
  },
});
