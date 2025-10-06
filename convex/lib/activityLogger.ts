import { MutationCtx } from "../_generated/server";

/**
 * Helper to log admin activity automatically
 */
export async function logActivity(
  ctx: MutationCtx,
  data: {
    eventType: string;
    eventCategory: "user" | "revenue" | "system";
    description: string;
    userId?: string;
    userEmail?: string;
    metadata?: any;
    severity?: "info" | "warning" | "error";
  }
) {
  try {
    await ctx.db.insert("activityLogs", {
      timestamp: Date.now(),
      userId: data.userId,
      userEmail: data.userEmail,
      eventType: data.eventType,
      eventCategory: data.eventCategory,
      description: data.description,
      metadata: data.metadata,
      severity: data.severity || "info",
    });
  } catch (error) {
    // Don't fail the mutation if logging fails
    console.error("Failed to log activity:", error);
  }
}

/**
 * Log admin actions automatically
 */
export async function logAdminAction(
  ctx: MutationCtx,
  action: string,
  target: string,
  adminEmail: string,
  details?: any
) {
  await logActivity(ctx, {
    eventType: `admin_${action}`,
    eventCategory: "system",
    description: `Admin ${action} ${target}`,
    userEmail: adminEmail,
    metadata: details,
    severity: "info",
  });
}
