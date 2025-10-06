import { query } from "../_generated/server";
import { verifyAdmin } from "../lib/adminAuth";

export const checkAdminAccess = query({
  args: {},
  handler: async (ctx) => {
    try {
      const admin = await verifyAdmin(ctx);
      return {
        hasAccess: true,
        role: admin.role,
        email: admin.email,
      };
    } catch (error) {
      return {
        hasAccess: false,
        role: null,
        email: null,
      };
    }
  },
});

export const getCurrentAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      const admin = await verifyAdmin(ctx);
      
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
      
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      
      if (!user) throw new Error("User not found");
      
      const agent = await ctx.db
        .query("agents")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .first();

      return {
        id: admin.userId,
        email: admin.email,
        role: admin.role,
        name: agent?.agencyName || agent?.email,
      };
    } catch (error) {
      console.error("getCurrentAdmin error:", error);
      throw error;
    }
  },
});
