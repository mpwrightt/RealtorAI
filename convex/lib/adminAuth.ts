import { QueryCtx, MutationCtx } from "../_generated/server";

export async function verifyAdmin(ctx: QueryCtx | MutationCtx): Promise<{
  userId: string;
  email: string;
  role: string;
}> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Find user first
  const user = await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  // Find agent by userId
  const agent = await ctx.db
    .query("agents")
    .withIndex("byUserId", (q) => q.eq("userId", user._id))
    .first();

  if (!agent) {
    throw new Error("Agent not found");
  }

  if (agent.role !== "admin" && agent.role !== "support") {
    throw new Error("Admin access required");
  }

  return {
    userId: agent._id,
    email: agent.email,
    role: agent.role || "agent",
  };
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const admin = await verifyAdmin(ctx);
  if (admin.role !== "admin") {
    throw new Error("Full admin access required");
  }
  return admin;
}
