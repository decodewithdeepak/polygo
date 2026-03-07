import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { SUPPORTED_LANGUAGES } from "./shared";

// Store or update the current authenticated user
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log(
      "[Users:Store] Attempting to store user. Identity:",
      identity?.subject,
      identity?.name,
      identity?.email,
    );

    if (!identity) {
      console.error(
        "[Users:Store] Failed: No identity found in Convex context. Is the token being passed?",
      );
      throw new Error("Convex: Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: identity.name ?? existingUser.name,
        imageUrl: identity.pictureUrl ?? existingUser.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existingUser._id;
    }

    // Insert new user
    const userId = await ctx.db.insert("users", {
      externalId: identity.subject,
      name: identity.name ?? "Unknown",
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl ?? "",
      isOnline: true,
      lastSeen: Date.now(),
      preferredLanguage: "en", // Default to English
    });

    return userId;
  },
});

// Get the current authenticated user's document
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    return user;
  },
});

// Get all users except the current user
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const allUsers = await ctx.db.query("users").collect();

    return allUsers.filter((user) => user.externalId !== identity.subject);
  },
});

// ─── Presence Mutations ───────────────────────────────────────────────────

/**
 * setOnline — Marks the current user as online.
 * Called when the user opens the app or returns to the tab.
 *
 * No args needed — we identify the user from their auth token.
 * Sets isOnline: true and updates lastSeen to the current timestamp.
 */
export const setOnline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) return null;

    await ctx.db.patch(user._id, {
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

/**
 * setOffline — Marks the current user as offline.
 * Called when the user closes the tab or switches away.
 *
 * lastSeen is updated here so we can show "Last seen X minutes ago"
 * in the chat header and contact list later. This timestamp represents
 * the moment the user was LAST active, not when they first went offline.
 */
export const setOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) return null;

    // NOTE: In a multi-tab scenario, closing one tab will mark the user offline
    // even if other tabs are open. A more robust solution would involve
    // pulse-based presence or connection tracking, which is currently
    // out of scope for this minimal fix.
    await ctx.db.patch(user._id, {
      isOnline: false,
      lastSeen: Date.now(),
    });
  },
});

/**
 * updateLanguage — Updates the current user's preferred language.
 */
export const updateLanguage = mutation({
  args: {
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Validate against supported language list
    if (!(SUPPORTED_LANGUAGES as readonly string[]).includes(args.language)) {
      throw new Error(`Unsupported language: ${args.language}`);
    }

    await ctx.db.patch(user._id, {
      preferredLanguage: args.language,
    });
  },
});
