import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nanoid } from "nanoid";

export const createAgent = mutation({
  args: {
    userId: v.id("users"),
    agencyName: v.string(),
    licenseNumber: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inviteCode = nanoid(12);
    
    const agentId = await ctx.db.insert("agents", {
      userId: args.userId,
      agencyName: args.agencyName,
      licenseNumber: args.licenseNumber,
      email: args.email,
      phone: args.phone,
      bio: args.bio,
      profileImage: args.profileImage,
      inviteCode,
      active: true,
      createdAt: Date.now(),
    });

    return {
      agentId,
      inviteCode,
    };
  },
});

export const getAgentByUserId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    // First find the user by their Clerk external ID
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.externalId))
      .unique();
    
    if (!user) {
      return null;
    }
    
    // Then find the agent by the user's internal ID
    const agent = await ctx.db
      .query("agents")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .unique();
    
    return agent;
  },
});

export const getAgentByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("byInviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();
    
    return agent;
  },
});

export const getAgentById = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    return agent;
  },
});

export const updateAgentProfile = mutation({
  args: {
    agentId: v.id("agents"),
    agencyName: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { agentId, ...updates } = args;
    
    await ctx.db.patch(agentId, {
      ...Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      ),
    });

    return { success: true };
  },
});

export const updateBrandingSettings = mutation({
  args: {
    agentId: v.id("agents"),
    companyName: v.optional(v.string()),
    replyEmail: v.optional(v.string()),
    smsPhone: v.optional(v.string()),
    emailSignature: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { agentId, ...settings } = args;
    
    const agent = await ctx.db.get(agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Merge with existing branding settings
    const updatedBranding = {
      ...agent.brandingSettings,
      ...Object.fromEntries(
        Object.entries(settings).filter(([_, v]) => v !== undefined)
      ),
    };
    
    await ctx.db.patch(agentId, {
      brandingSettings: updatedBranding,
    });

    return { success: true };
  },
});

export const generateInviteCode = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const newCode = nanoid(12);
    
    await ctx.db.patch(args.agentId, {
      inviteCode: newCode,
    });

    return { inviteCode: newCode };
  },
});

export const deactivateAgent = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      active: false,
    });

    return { success: true };
  },
});

export const activateAgent = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      active: true,
    });

    return { success: true };
  },
});

export const listActiveAgents = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db
      .query("agents")
      .withIndex("byActive", (q) => q.eq("active", true))
      .collect();
    
    return agents;
  },
});
