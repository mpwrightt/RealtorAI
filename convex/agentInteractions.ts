import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const logInteraction = mutation({
  args: {
    sessionType: v.string(),
    sessionId: v.string(),
    agentQuery: v.string(),
    agentResponse: v.string(),
    toolsUsed: v.array(v.string()),
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("agentInteractions", {
      sessionType: args.sessionType,
      sessionId: args.sessionId,
      agentQuery: args.agentQuery,
      agentResponse: args.agentResponse,
      toolsUsed: args.toolsUsed,
      context: args.context,
      timestamp: Date.now(),
    });

    return { logId };
  },
});

export const getInteractionHistory = query({
  args: {
    sessionId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("agentInteractions")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId));

    const interactions = await query.collect();
    
    const sorted = interactions.sort((a, b) => b.timestamp - a.timestamp);
    
    if (args.limit) {
      return sorted.slice(0, args.limit);
    }

    return sorted;
  },
});

export const getInteractionsByType = query({
  args: {
    sessionType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("agentInteractions")
      .withIndex("bySessionType", (q) => q.eq("sessionType", args.sessionType));

    const interactions = await query.collect();
    
    const sorted = interactions.sort((a, b) => b.timestamp - a.timestamp);
    
    if (args.limit) {
      return sorted.slice(0, args.limit);
    }

    return sorted;
  },
});

export const getRecentInteractions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const interactions = await ctx.db
      .query("agentInteractions")
      .withIndex("byTimestamp")
      .order("desc")
      .take(args.limit || 50);

    return interactions;
  },
});
