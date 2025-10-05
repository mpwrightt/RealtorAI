import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all leads for an agent
export const getLeadsByAgent = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
  },
});

// Get leads by status
export const getLeadsByStatus = query({
  args: {
    agentId: v.id("agents"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("byAgentAndStatus", (q) => 
        q.eq("agentId", args.agentId).eq("status", args.status)
      )
      .order("desc")
      .collect();
  },
});

// Create a new lead
export const createLead = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    type: v.string(),
    source: v.string(),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      agentId: args.agentId,
      name: args.name,
      phone: args.phone,
      email: args.email,
      status: "new",
      type: args.type,
      source: args.source,
      priority: args.priority || "warm",
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update lead
export const updateLead = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { leadId, ...updates } = args;
    
    await ctx.db.patch(leadId, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete lead
export const deleteLead = mutation({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.leadId);
  },
});

// Get lead stats
export const getLeadStats = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const leads = await ctx.db
      .query("leads")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    return {
      total: leads.length,
      new: leads.filter(l => l.status === "new").length,
      active: leads.filter(l => l.status === "active").length,
      closed: leads.filter(l => l.status === "closed").length,
      hot: leads.filter(l => l.priority === "hot").length,
      warm: leads.filter(l => l.priority === "warm").length,
      cold: leads.filter(l => l.priority === "cold").length,
    };
  },
});
