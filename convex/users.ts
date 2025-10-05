import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Get or create user by Clerk external ID
export const getOrCreateUser = mutation({
  args: {
    externalId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      externalId: args.externalId,
      name: args.name,
    });

    const user = await ctx.db.get(userId);
    return user;
  },
});

export const getUserByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.externalId))
      .unique();

    return user;
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    return user;
  },
});

// Internal mutations for Clerk webhooks
export const upsertFromClerk = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const userAttributes = data;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) =>
        q.eq("externalId", userAttributes.id)
      )
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: `${userAttributes.first_name || ""} ${userAttributes.last_name || ""}`.trim() 
          || userAttributes.email_addresses?.[0]?.email_address 
          || "User",
      });
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      externalId: userAttributes.id,
      name: `${userAttributes.first_name || ""} ${userAttributes.last_name || ""}`.trim() 
        || userAttributes.email_addresses?.[0]?.email_address 
        || "User",
    });

    return userId;
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", clerkUserId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
