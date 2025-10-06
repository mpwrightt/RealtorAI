import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireAdmin } from "../lib/adminAuth";

export const getRevenueMetrics = query({
  args: {
    period: v.optional(v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month"),
      v.literal("year")
    )),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const now = Date.now();
    const periodMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };
    
    const period = args.period || "month";
    const startTime = now - periodMs[period];
    
    const events = await ctx.db
      .query("revenueEvents")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();
    
    // Calculate metrics
    const totalRevenue = events.reduce((sum, e) => sum + e.amount, 0);
    const subscriptions = events.filter(e => e.eventType === "subscription_created");
    const cancellations = events.filter(e => e.eventType === "subscription_cancelled");
    
    // Group by plan
    const revenueByPlan = events.reduce((acc, e) => {
      if (!e.plan) return acc;
      acc[e.plan] = (acc[e.plan] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate MRR (Monthly Recurring Revenue)
    const activeSubscriptions = await ctx.db
      .query("agents")
      .filter((q) => q.neq(q.field("plan"), undefined))
      .collect();
    
    const planPrices = {
      starter: 29,
      professional: 79,
      enterprise: 199,
      trial: 0,
    };
    
    const mrr = activeSubscriptions.reduce((sum, agent) => {
      const plan = agent.plan as keyof typeof planPrices;
      return sum + (planPrices[plan] || 0);
    }, 0);
    
    // Calculate ARPU (Average Revenue Per User)
    const arpu = activeSubscriptions.length > 0 
      ? mrr / activeSubscriptions.length 
      : 0;
    
    return {
      totalRevenue,
      mrr,
      arr: mrr * 12, // Annual Recurring Revenue
      arpu,
      totalSubscriptions: activeSubscriptions.length,
      newSubscriptions: subscriptions.length,
      cancellations: cancellations.length,
      churnRate: activeSubscriptions.length > 0
        ? (cancellations.length / activeSubscriptions.length) * 100
        : 0,
      revenueByPlan,
      events: events.slice(0, 50), // Last 50 events
    };
  },
});

export const getRevenueChart = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);
    
    const events = await ctx.db
      .query("revenueEvents")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();
    
    // Group by day
    const chartData: Record<string, { date: string; revenue: number; subscriptions: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      chartData[dateStr] = { date: dateStr, revenue: 0, subscriptions: 0 };
    }
    
    events.forEach(event => {
      const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
      if (chartData[dateStr]) {
        chartData[dateStr].revenue += event.amount;
        if (event.eventType === 'subscription_created') {
          chartData[dateStr].subscriptions += 1;
        }
      }
    });
    
    return Object.values(chartData)
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const recordRevenueEvent = mutation({
  args: {
    eventType: v.string(),
    amount: v.number(),
    agentId: v.id("agents"),
    plan: v.optional(v.string()),
    description: v.string(),
    currency: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("revenueEvents", {
      timestamp: Date.now(),
      eventType: args.eventType,
      amount: args.amount,
      agentId: args.agentId,
      plan: args.plan,
      description: args.description,
      currency: args.currency || "USD",
      metadata: args.metadata,
    });
    
    return { success: true };
  },
});
