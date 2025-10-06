import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireAdmin } from "../lib/adminAuth";

export const getActivityLogs = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    severity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    let logs = await ctx.db
      .query("activityLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit || 100);
    
    if (args.category) {
      logs = logs.filter(log => log.eventCategory === args.category);
    }
    
    if (args.severity) {
      logs = logs.filter(log => log.severity === args.severity);
    }
    
    return logs;
  },
});

export const logActivity = mutation({
  args: {
    eventType: v.string(),
    eventCategory: v.string(),
    description: v.string(),
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    metadata: v.optional(v.any()),
    severity: v.optional(v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error")
    )),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLogs", {
      timestamp: Date.now(),
      userId: args.userId,
      userEmail: args.userEmail,
      eventType: args.eventType,
      eventCategory: args.eventCategory,
      description: args.description,
      metadata: args.metadata,
      severity: args.severity || "info",
    });
    
    return { success: true };
  },
});

export const clearOldLogs = mutation({
  args: { daysToKeep: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const cutoffTime = Date.now() - (args.daysToKeep * 24 * 60 * 60 * 1000);
    
    const oldLogs = await ctx.db
      .query("activityLogs")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoffTime))
      .collect();
    
    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }
    
    return { deleted: oldLogs.length };
  },
});
