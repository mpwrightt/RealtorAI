import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireAdmin } from "../lib/adminAuth";

// Service status tracking
export const getServiceStatus = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    // Get recent activity to determine if services are working
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Check Convex (if we can query, it's up)
    const convexStatus = {
      name: "Convex Database",
      status: "healthy" as const,
      lastChecked: now,
      responseTime: 0,
    };
    
    // Check if Clerk is being used (check for recent agent activity)
    const recentAgents = await ctx.db
      .query("agents")
      .filter((q) => q.gte(q.field("createdAt"), oneHourAgo))
      .collect();
    
    const clerkStatus = {
      name: "Clerk Auth",
      status: recentAgents.length > 0 ? "healthy" : "unknown" as const,
      lastChecked: now,
      responseTime: 0,
    };
    
    // Get API usage stats
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.gte(q.field("createdAt"), oneHourAgo))
      .collect();
    
    const aiChats = messages.length; // All messages count as potential AI usage
    
    return {
      services: [
        convexStatus,
        clerkStatus,
        {
          name: "OpenRouter AI",
          status: aiChats > 0 ? "healthy" : "idle" as const,
          lastChecked: now,
          responseTime: 0,
          usage: aiChats,
        },
        {
          name: "RentCast API",
          status: "unknown" as const,
          lastChecked: now,
          responseTime: 0,
          usage: 0,
        },
        {
          name: "Twilio SMS",
          status: "unknown" as const,
          lastChecked: now,
          responseTime: 0,
          usage: 0,
        },
        {
          name: "Resend Email",
          status: "unknown" as const,
          lastChecked: now,
          responseTime: 0,
          usage: 0,
        },
      ],
      overall: "healthy" as const,
      lastUpdated: now,
    };
  },
});

// API usage statistics
export const getApiUsageStats = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const days = args.days || 7;
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);
    
    // Get AI chat usage (messages with AI)
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    const aiMessages = messages; // Count all messages for AI usage estimate
    
    // Get listings (RentCast API usage estimate)
    const listings = await ctx.db
      .query("listings")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    // SMS campaigns (Twilio usage)
    const smsCampaigns = await ctx.db
      .query("smsCampaigns")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    const totalSmsSent = smsCampaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0);
    
    // Calculate daily usage
    const dailyUsage: Record<string, {
      date: string;
      aiCalls: number;
      apiCalls: number;
      smsSent: number;
    }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      dailyUsage[dateStr] = { date: dateStr, aiCalls: 0, apiCalls: 0, smsSent: 0 };
    }
    
    aiMessages.forEach(msg => {
      const dateStr = new Date(msg.createdAt).toISOString().split('T')[0];
      if (dailyUsage[dateStr]) {
        dailyUsage[dateStr].aiCalls += 1;
      }
    });
    
    listings.forEach(listing => {
      const dateStr = new Date(listing.createdAt).toISOString().split('T')[0];
      if (dailyUsage[dateStr]) {
        dailyUsage[dateStr].apiCalls += 1;
      }
    });
    
    return {
      summary: {
        totalAiCalls: aiMessages.length,
        totalApiCalls: listings.length,
        totalSmsSent: totalSmsSent,
        period: `Last ${days} days`,
      },
      dailyUsage: Object.values(dailyUsage)
        .sort((a, b) => a.date.localeCompare(b.date)),
      services: [
        {
          name: "OpenRouter AI",
          calls: aiMessages.length,
          avgPerDay: aiMessages.length / days,
          status: "active",
        },
        {
          name: "RentCast API",
          calls: listings.length,
          avgPerDay: listings.length / days,
          status: listings.length > 0 ? "active" : "idle",
        },
        {
          name: "Twilio SMS",
          calls: totalSmsSent,
          avgPerDay: totalSmsSent / days,
          status: totalSmsSent > 0 ? "active" : "idle",
        },
      ],
    };
  },
});

// Cost tracking
export const getCostEstimates = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);
    
    // Get usage data
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    const aiMessages = messages; // Count all messages for AI usage estimate
    const listings = await ctx.db
      .query("listings")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    const smsCampaigns = await ctx.db
      .query("smsCampaigns")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    const totalSmsSent = smsCampaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0);
    
    // Cost estimates (approximate)
    const costs = {
      convex: {
        name: "Convex",
        usage: "Database & Functions",
        estimated: 0, // Free tier likely
        unit: "Free tier",
      },
      clerk: {
        name: "Clerk",
        usage: "Authentication",
        estimated: 0, // Free tier likely
        unit: "Free tier",
      },
      openrouter: {
        name: "OpenRouter AI",
        usage: `${aiMessages.length} AI calls`,
        estimated: aiMessages.length * 0.002, // ~$0.002 per call estimate
        unit: `$${(0.002).toFixed(4)}/call`,
      },
      rentcast: {
        name: "RentCast API",
        usage: `${listings.length} property lookups`,
        estimated: listings.length * 0.01, // ~$0.01 per lookup
        unit: "$0.01/lookup",
      },
      twilio: {
        name: "Twilio SMS",
        usage: `${totalSmsSent} messages`,
        estimated: totalSmsSent * 0.0079, // ~$0.0079 per SMS
        unit: "$0.0079/message",
      },
      resend: {
        name: "Resend Email",
        usage: "Email notifications",
        estimated: 0, // Free tier likely
        unit: "Free tier",
      },
    };
    
    const totalEstimated = Object.values(costs).reduce((sum, cost) => sum + cost.estimated, 0);
    const monthlyEstimate = (totalEstimated / days) * 30;
    
    return {
      period: `Last ${days} days`,
      totalCost: totalEstimated,
      monthlyEstimate,
      breakdown: costs,
      projections: {
        daily: totalEstimated / days,
        weekly: (totalEstimated / days) * 7,
        monthly: monthlyEstimate,
        yearly: monthlyEstimate * 12,
      },
    };
  },
});

// Log API usage (can be called from other functions)
export const logApiUsage = mutation({
  args: {
    service: v.string(),
    endpoint: v.optional(v.string()),
    responseTime: v.optional(v.number()),
    success: v.boolean(),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Log to activity logs
    await ctx.db.insert("activityLogs", {
      timestamp: Date.now(),
      eventType: "api_call",
      eventCategory: "system",
      description: `${args.service} API call ${args.success ? 'succeeded' : 'failed'}`,
      metadata: {
        service: args.service,
        endpoint: args.endpoint,
        responseTime: args.responseTime,
        cost: args.cost,
      },
      severity: args.success ? "info" : "warning",
    });
    
    return { success: true };
  },
});
