import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireAdmin } from "../lib/adminAuth";
import { logAdminAction } from "../lib/activityLogger";

export const getAgents = query({
  args: {
    status: v.optional(v.string()),
    plan: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    let agents = await ctx.db.query("agents").collect();
    
    // Apply filters
    if (args.status) {
      if (args.status === 'active') {
        agents = agents.filter(a => a.active !== false && a.isActive !== false);
      } else if (args.status === 'inactive') {
        agents = agents.filter(a => a.active === false || a.isActive === false);
      }
    }
    
    if (args.plan) {
      agents = agents.filter(a => a.plan === args.plan);
    }
    
    if (args.search) {
      const search = args.search.toLowerCase();
      agents = agents.filter(a => 
        a.email.toLowerCase().includes(search) ||
        a.agencyName?.toLowerCase().includes(search)
      );
    }
    
    // Add computed fields
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const buyerSessions = await ctx.db
          .query("buyerSessions")
          .filter((q) => q.eq(q.field("agentId"), agent._id))
          .collect();
        
        const sellerSessions = await ctx.db
          .query("sellerSessions")
          .filter((q) => q.eq(q.field("agentId"), agent._id))
          .collect();
        
        return {
          ...agent,
          totalPortals: buyerSessions.length + sellerSessions.length,
          buyerPortals: buyerSessions.length,
          sellerPortals: sellerSessions.length,
        };
      })
    );
    
    return agentsWithStats;
  },
});

export const getAgentById = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return null;
    
    // Get related data
    const buyerSessions = await ctx.db
      .query("buyerSessions")
      .filter((q) => q.eq(q.field("agentId"), args.agentId))
      .collect();
    
    const sellerSessions = await ctx.db
      .query("sellerSessions")
      .filter((q) => q.eq(q.field("agentId"), args.agentId))
      .collect();
    
    const listings = await ctx.db
      .query("listings")
      .withIndex("byAgentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    return {
      ...agent,
      stats: {
        buyerPortals: buyerSessions.length,
        sellerPortals: sellerSessions.length,
        totalPortals: buyerSessions.length + sellerSessions.length,
        listings: listings.length,
      },
    };
  },
});

export const updateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    updates: v.object({
      agencyName: v.optional(v.string()),
      phone: v.optional(v.string()),
      bio: v.optional(v.string()),
      plan: v.optional(v.union(
        v.literal("starter"),
        v.literal("professional"),
        v.literal("enterprise"),
        v.literal("trial")
      )),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    await ctx.db.patch(args.agentId, args.updates as any);
    
    return { success: true };
  },
});

export const toggleAgentStatus = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");
    
    const newStatus = !agent.active;
    
    await ctx.db.patch(args.agentId, {
      active: newStatus,
      isActive: newStatus,
    });
    
    // Auto-log activity
    await logAdminAction(
      ctx,
      newStatus ? "activated" : "deactivated",
      `agent ${agent.email}`,
      admin.email,
      { agentId: args.agentId, email: agent.email }
    );
    
    return { success: true, newStatus };
  },
});

export const deleteAgent = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");
    
    // Note: In production, you might want to soft delete or archive instead
    await ctx.db.delete(args.agentId);
    
    // Auto-log activity
    await logAdminAction(
      ctx,
      "deleted",
      `agent ${agent.email}`,
      admin.email,
      { agentId: args.agentId, email: agent.email }
    );
    
    return { success: true };
  },
});
