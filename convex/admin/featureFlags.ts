import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireAdmin } from "../lib/adminAuth";
import { logAdminAction } from "../lib/activityLogger";

export const getAllFlags = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const flags = await ctx.db
      .query("featureFlags")
      .collect();
    
    return flags.sort((a, b) => a.key.localeCompare(b.key));
  },
});

export const getFlag = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    // Public query - doesn't require admin for reading
    const flag = await ctx.db
      .query("featureFlags")
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
    
    return flag?.enabled ?? true; // Default to enabled if not found
  },
});

export const createFlag = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    description: v.string(),
    enabled: v.boolean(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    
    // Check if flag already exists
    const existing = await ctx.db
      .query("featureFlags")
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
    
    if (existing) {
      throw new Error(`Feature flag '${args.key}' already exists`);
    }
    
    const flagId = await ctx.db.insert("featureFlags", {
      key: args.key,
      name: args.name,
      description: args.description,
      enabled: args.enabled,
      category: args.category || "general",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      updatedBy: admin.email,
    });
    
    return flagId;
  },
});

export const updateFlag = mutation({
  args: {
    flagId: v.id("featureFlags"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      enabled: v.optional(v.boolean()),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    
    await ctx.db.patch(args.flagId, {
      ...args.updates,
      updatedAt: Date.now(),
      updatedBy: admin.email,
    });
    
    return { success: true };
  },
});

export const toggleFlag = mutation({
  args: { flagId: v.id("featureFlags") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    
    const flag = await ctx.db.get(args.flagId);
    if (!flag) throw new Error("Flag not found");
    
    const newState = !flag.enabled;
    
    await ctx.db.patch(args.flagId, {
      enabled: newState,
      updatedAt: Date.now(),
      updatedBy: admin.email,
    });
    
    // Auto-log activity
    await logAdminAction(
      ctx,
      newState ? "enabled" : "disabled",
      `feature flag ${flag.name}`,
      admin.email,
      { flagId: args.flagId, key: flag.key }
    );
    
    return { success: true, newState };
  },
});

export const deleteFlag = mutation({
  args: { flagId: v.id("featureFlags") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    await ctx.db.delete(args.flagId);
    
    return { success: true };
  },
});

export const initializeDefaultFlags = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    
    const defaultFlags = [
      {
        key: "ai_chat",
        name: "AI Chat",
        description: "Enable AI-powered chat for buyer/seller portals",
        enabled: true,
        category: "features",
      },
      {
        key: "sms_campaigns",
        name: "SMS Campaigns",
        description: "Enable SMS campaign functionality for agents",
        enabled: true,
        category: "features",
      },
      {
        key: "email_notifications",
        name: "Email Notifications",
        description: "Send email notifications to buyers and sellers",
        enabled: true,
        category: "notifications",
      },
      {
        key: "open_house_manager",
        name: "Open House Manager",
        description: "Enable open house scheduling and management",
        enabled: true,
        category: "features",
      },
      {
        key: "favorites",
        name: "Favorites",
        description: "Allow buyers to favorite properties",
        enabled: true,
        category: "features",
      },
      {
        key: "property_alerts",
        name: "Property Alerts",
        description: "Send alerts to buyers for new matching properties",
        enabled: true,
        category: "notifications",
      },
      {
        key: "maintenance_mode",
        name: "Maintenance Mode",
        description: "Put the platform in maintenance mode",
        enabled: false,
        category: "system",
      },
      {
        key: "new_agent_signups",
        name: "New Agent Signups",
        description: "Allow new agents to sign up",
        enabled: true,
        category: "system",
      },
    ];
    
    const created = [];
    
    for (const flag of defaultFlags) {
      const existing = await ctx.db
        .query("featureFlags")
        .filter((q) => q.eq(q.field("key"), flag.key))
        .first();
      
      if (!existing) {
        const id = await ctx.db.insert("featureFlags", {
          ...flag,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          updatedBy: admin.email,
        });
        created.push(id);
      }
    }
    
    return { created: created.length, total: defaultFlags.length };
  },
});
