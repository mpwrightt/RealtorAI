import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAdmin } from "../lib/adminAuth";

export const getUsageAnalytics = query({
  args: {
    period: v.optional(v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    )),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const now = Date.now();
    const period = args.period || "week";
    
    const periodMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };
    
    const startTime = now - periodMs[period];
    
    // Get all agents
    const allAgents = await ctx.db.query("agents").collect();
    
    // Calculate active users (agents who created portals or listings)
    const activeAgents = allAgents.filter(agent => agent.createdAt >= startTime);
    
    // Get buyer sessions created in period
    const buyerSessions = await ctx.db
      .query("buyerSessions")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    // Get seller sessions created in period
    const sellerSessions = await ctx.db
      .query("sellerSessions")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    // Get listings created in period
    const listings = await ctx.db
      .query("listings")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    // Get messages sent in period
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    // Calculate DAU (Daily Active Users) - agents who did something today
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const dailyActiveAgents = new Set([
      ...buyerSessions.filter(s => s.createdAt >= oneDayAgo).map(s => s.agentId),
      ...sellerSessions.filter(s => s.createdAt >= oneDayAgo).map(s => s.agentId),
      ...listings.filter(l => l.createdAt >= oneDayAgo).map(l => l.agentId),
    ]);
    
    // Calculate WAU (Weekly Active Users)
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const weeklyActiveAgents = new Set([
      ...buyerSessions.filter(s => s.createdAt >= oneWeekAgo).map(s => s.agentId),
      ...sellerSessions.filter(s => s.createdAt >= oneWeekAgo).map(s => s.agentId),
      ...listings.filter(l => l.createdAt >= oneWeekAgo).map(l => l.agentId),
    ]);
    
    // Calculate MAU (Monthly Active Users)
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    const monthlyActiveAgents = new Set([
      ...buyerSessions.filter(s => s.createdAt >= oneMonthAgo).map(s => s.agentId),
      ...sellerSessions.filter(s => s.createdAt >= oneMonthAgo).map(s => s.agentId),
      ...listings.filter(l => l.createdAt >= oneMonthAgo).map(l => l.agentId),
    ]);
    
    // Calculate engagement metrics
    const totalAgents = allAgents.length;
    const dau = dailyActiveAgents.size;
    const wau = weeklyActiveAgents.size;
    const mau = monthlyActiveAgents.size;
    
    const dau_mau_ratio = mau > 0 ? (dau / mau) * 100 : 0;
    const wau_mau_ratio = mau > 0 ? (wau / mau) * 100 : 0;
    
    // Calculate feature usage
    const totalPortals = buyerSessions.length + sellerSessions.length;
    const avgPortalsPerAgent = totalAgents > 0 ? totalPortals / totalAgents : 0;
    const avgMessagesPerAgent = totalAgents > 0 ? messages.length / totalAgents : 0;
    const avgListingsPerAgent = totalAgents > 0 ? listings.length / totalAgents : 0;
    
    // Calculate retention (agents who returned)
    const returningAgents = allAgents.filter(agent => {
      const buyerCount = buyerSessions.filter(s => s.agentId === agent._id).length;
      const sellerCount = sellerSessions.filter(s => s.agentId === agent._id).length;
      return (buyerCount + sellerCount) > 1;
    });
    
    const retentionRate = totalAgents > 0 ? (returningAgents.length / totalAgents) * 100 : 0;
    
    return {
      period,
      totalAgents,
      dau,
      wau,
      mau,
      dau_mau_ratio,
      wau_mau_ratio,
      totalPortals,
      buyerPortals: buyerSessions.length,
      sellerPortals: sellerSessions.length,
      totalListings: listings.length,
      totalMessages: messages.length,
      avgPortalsPerAgent,
      avgMessagesPerAgent,
      avgListingsPerAgent,
      retentionRate,
      activeInPeriod: activeAgents.length,
    };
  },
});

export const getEngagementTrend = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);
    
    // Get all activity in period
    const buyerSessions = await ctx.db
      .query("buyerSessions")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    const sellerSessions = await ctx.db
      .query("sellerSessions")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    const listings = await ctx.db
      .query("listings")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    // Group by day
    const chartData: Record<string, { date: string; activeUsers: number; portals: number; listings: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      chartData[dateStr] = { date: dateStr, activeUsers: 0, portals: 0, listings: 0 };
    }
    
    // Count activity by day
    const allSessions = [...buyerSessions, ...sellerSessions] as any[];
    allSessions.forEach(session => {
      const dateStr = new Date(session.createdAt).toISOString().split('T')[0];
      if (chartData[dateStr]) {
        chartData[dateStr].portals += 1;
      }
    });
    
    listings.forEach(listing => {
      const dateStr = new Date(listing.createdAt).toISOString().split('T')[0];
      if (chartData[dateStr]) {
        chartData[dateStr].listings += 1;
      }
    });
    
    // Calculate daily active users
    for (const dateStr in chartData) {
      const dayStart = new Date(dateStr).getTime();
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      
      const activeAgents = new Set([
        ...buyerSessions.filter(s => s.createdAt >= dayStart && s.createdAt < dayEnd).map(s => s.agentId),
        ...sellerSessions.filter(s => s.createdAt >= dayStart && s.createdAt < dayEnd).map(s => s.agentId),
        ...listings.filter(l => l.createdAt >= dayStart && l.createdAt < dayEnd).map(l => l.agentId),
      ]);
      
      chartData[dateStr].activeUsers = activeAgents.size;
    }
    
    return Object.values(chartData)
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getFeatureUsage = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const buyerSessions = await ctx.db.query("buyerSessions").collect();
    const sellerSessions = await ctx.db.query("sellerSessions").collect();
    const listings = await ctx.db.query("listings").collect();
    const messages = await ctx.db.query("messages").collect();
    const favorites = await ctx.db.query("favorites").collect();
    
    // Get agents with at least one of each feature
    const allAgents = await ctx.db.query("agents").collect();
    
    const agentsWithBuyerPortals = new Set(buyerSessions.map(s => s.agentId));
    const agentsWithSellerPortals = new Set(sellerSessions.map(s => s.agentId));
    const agentsWithListings = new Set(listings.map(l => l.agentId));
    const agentsWithMessages = new Set(messages.map(m => m.agentId));
    
    return {
      buyerPortals: {
        total: buyerSessions.length,
        adoption: allAgents.length > 0 ? (agentsWithBuyerPortals.size / allAgents.length) * 100 : 0,
      },
      sellerPortals: {
        total: sellerSessions.length,
        adoption: allAgents.length > 0 ? (agentsWithSellerPortals.size / allAgents.length) * 100 : 0,
      },
      listings: {
        total: listings.length,
        adoption: allAgents.length > 0 ? (agentsWithListings.size / allAgents.length) * 100 : 0,
      },
      messages: {
        total: messages.length,
        adoption: allAgents.length > 0 ? (agentsWithMessages.size / allAgents.length) * 100 : 0,
      },
      favorites: {
        total: favorites.length,
        avgPerBuyer: buyerSessions.length > 0 ? favorites.length / buyerSessions.length : 0,
      },
    };
  },
});
