/**
 * Groups Module
 *
 * Handles group chat creation, membership, and info.
 * Groups are stored in the same "conversations" table as DMs,
 * distinguished by the `isGroup: true` flag.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * create — Creates a new group conversation.
 * The creator is automatically added as a participant and admin.
 */
export const create = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (!currentUser) throw new Error("User not found");

    // Ensure creator is always in the participant list
    const allParticipantIds = [
      currentUser._id,
      ...args.memberIds.filter((id) => id !== currentUser._id),
    ];

    const conversationId = await ctx.db.insert("conversations", {
      participantIds: allParticipantIds,
      isGroup: true,
      groupName: args.name.trim(),
      groupAdmin: [currentUser._id],
      createdBy: currentUser._id,
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

/**
 * getDetails — Returns group metadata + full member list with user info.
 */
export const getDetails = query({
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isGroup) return null;
    if (!conversation.participantIds.includes(currentUser._id)) return null;

    // Fetch all member details in parallel
    const members = await Promise.all(
      conversation.participantIds.map(async (id) => {
        const user = await ctx.db.get(id);
        return user
          ? {
              _id: user._id,
              name: user.name,
              imageUrl: user.imageUrl,
              isOnline: user.isOnline,
              isAdmin: conversation.groupAdmin?.includes(user._id) ?? false,
            }
          : null;
      }),
    );

    return {
      _id: conversation._id,
      groupName: conversation.groupName ?? "Group",
      groupAdmin: conversation.groupAdmin ?? [],
      createdBy: conversation.createdBy,
      createdAt: conversation.createdAt,
      members: members.filter(Boolean),
      memberCount: conversation.participantIds.length,
    };
  },
});

/**
 * addMembers — Add new members to an existing group.
 * Any group member can add people (hackathon simplicity).
 */
export const addMembers = mutation({
  args: {
    conversationId: v.id("conversations"),
    memberIds: v.array(v.id("users")),
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
    if (!conversation || !conversation.isGroup) {
      throw new Error("Group not found");
    }
    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new Error("Unauthorized");
    }

    // Merge existing + new, deduplicate
    const updatedIds = [
      ...new Set([...conversation.participantIds, ...args.memberIds]),
    ];

    await ctx.db.patch(args.conversationId, {
      participantIds: updatedIds,
    });
  },
});

/**
 * leaveGroup — Current user leaves the group.
 */
export const leaveGroup = mutation({
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
    if (!conversation || !conversation.isGroup) {
      throw new Error("Group not found");
    }
    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new Error("You are not a member of this group");
    }

    const updatedIds = conversation.participantIds.filter(
      (id) => id !== currentUser._id,
    );

    // Also remove from admin list if applicable
    const updatedAdmins = (conversation.groupAdmin ?? []).filter(
      (id) => id !== currentUser._id,
    );

    await ctx.db.patch(args.conversationId, {
      participantIds: updatedIds,
      groupAdmin: updatedAdmins,
    });
  },
});

/**
 * updateGroupName — Update the group name (any member can do it for simplicity).
 */
export const updateGroupName = mutation({
  args: {
    conversationId: v.id("conversations"),
    name: v.string(),
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
    if (!conversation || !conversation.isGroup) {
      throw new Error("Group not found");
    }
    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      groupName: args.name.trim(),
    });
  },
});
