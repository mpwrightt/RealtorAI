import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Secured: Only existing admins or first-time setup can grant admin role
export const setAdminRole = mutation({
  args: { 
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the caller's info first
    const caller = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!caller) {
      throw new Error("User not found");
    }

    const callerAgent = await ctx.db
      .query("agents")
      .withIndex("byUserId", (q) => q.eq("userId", caller._id))
      .first();

    if (!callerAgent) {
      throw new Error("Caller is not an agent");
    }

    // Check if any admins exist in the system
    const allAgents = await ctx.db.query("agents").collect();
    const existingAdmins = allAgents.filter(agent => agent.role === "admin");

    // If admins exist, verify the caller is one of them
    if (existingAdmins.length > 0) {
      if (callerAgent.role !== "admin") {
        throw new Error(`Unauthorized: Only existing admins can grant admin access. Contact ${existingAdmins.map(a => a.email).join(' or ')} for access.`);
      }
    }
    // If no admins exist, this is first-time setup - allow it

    // Find the target agent
    const agent = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (!agent) {
      throw new Error(`Agent not found with email: ${args.email}`);
    }
    
    await ctx.db.patch(agent._id, {
      role: "admin",
      isActive: true,
      plan: "enterprise",
      subscriptionStatus: "active",
      planStartDate: Date.now(),
    });
    
    return { 
      success: true, 
      message: `Admin role granted to ${args.email}`,
      agentId: agent._id,
      isFirstAdmin: existingAdmins.length === 0,
    };
  },
});

// Helper to check current role
export const checkMyRole = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { authenticated: false };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    
    if (!user) {
      return { authenticated: true, hasAgent: false };
    }

    const agent = await ctx.db
      .query("agents")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .first();
    
    if (!agent) {
      return { authenticated: true, hasAgent: false };
    }

    return {
      authenticated: true,
      hasAgent: true,
      email: agent.email,
      role: agent.role || "agent",
      isActive: agent.isActive,
      plan: agent.plan,
    };
  },
});
