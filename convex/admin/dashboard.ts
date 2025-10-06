import { query } from "../_generated/server";
import { requireAdmin } from "../lib/adminAuth";

export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Get all agents
    const allAgents = await ctx.db.query("agents").collect();
    const activeAgents = allAgents.filter(a => a.active !== false);
    const activeToday = allAgents.filter(a => 
      a.lastActive && a.lastActive >= today
    );
    const newThisMonth = allAgents.filter(a => 
      a.createdAt >= monthAgo
    );

    // Get portals
    const buyerPortals = await ctx.db.query("buyerSessions").collect();
    const sellerPortals = await ctx.db.query("sellerSessions").collect();
    const totalPortals = buyerPortals.length + sellerPortals.length;
    
    const newPortalsThisWeek = [
      ...buyerPortals.filter(p => p.createdAt >= weekAgo),
      ...sellerPortals.filter(p => p.createdAt >= weekAgo),
    ].length;

    // Get activity counts
    const offers = await ctx.db.query("offers").collect();
    const offersThisMonth = offers.filter(o => o.createdAt >= monthAgo);
    
    const messages = await ctx.db.query("messages").collect();
    const messagesToday = messages.filter(m => m.createdAt >= today);

    // Calculate growth percentages
    const agentGrowth = calculateGrowth(allAgents, monthAgo);
    const portalGrowth = calculateGrowth([...buyerPortals, ...sellerPortals], weekAgo);

    return {
      // User metrics
      totalAgents: allAgents.length,
      activeAgents: activeAgents.length,
      activeToday: activeToday.length,
      newAgentsThisMonth: newThisMonth.length,
      agentGrowth,

      // Portal metrics
      totalPortals,
      totalBuyerPortals: buyerPortals.length,
      totalSellerPortals: sellerPortals.length,
      newPortalsThisWeek,
      portalGrowth,

      // Activity metrics
      totalOffers: offers.length,
      offersThisMonth: offersThisMonth.length,
      totalMessages: messages.length,
      messagesToday: messagesToday.length,

      // Engagement
      averagePortalsPerAgent: Math.round((totalPortals / (activeAgents.length || 1)) * 10) / 10,
    };
  },
});

function calculateGrowth(items: any[], sinceTimestamp: number): number {
  const recent = items.filter(i => i.createdAt >= sinceTimestamp);
  const older = items.filter(i => i.createdAt < sinceTimestamp);
  
  if (older.length === 0) return 0;
  
  return Math.round((recent.length / older.length) * 100);
}

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const activities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: number;
      severity: 'info' | 'warning' | 'success';
    }> = [];

    // Get recent events (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Recent agents
    const recentAgents = await ctx.db
      .query("agents")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();

    for (const agent of recentAgents) {
      activities.push({
        id: agent._id,
        type: 'agent_signup',
        description: `New agent signed up: ${agent.email}`,
        timestamp: agent.createdAt,
        severity: 'success',
      });
    }

    // Recent buyer portals
    const recentBuyerPortals = await ctx.db
      .query("buyerSessions")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .take(10);

    for (const portal of recentBuyerPortals) {
      activities.push({
        id: portal._id,
        type: 'buyer_portal_created',
        description: `Buyer portal created: ${portal.buyerName}`,
        timestamp: portal.createdAt,
        severity: 'info',
      });
    }

    // Recent seller portals
    const recentSellerPortals = await ctx.db
      .query("sellerSessions")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .take(10);

    for (const portal of recentSellerPortals) {
      activities.push({
        id: portal._id,
        type: 'seller_portal_created',
        description: `Seller portal created: ${portal.sellerName}`,
        timestamp: portal.createdAt,
        severity: 'info',
      });
    }

    // Recent offers
    const recentOffers = await ctx.db
      .query("offers")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .take(5);

    for (const offer of recentOffers) {
      const listing = await ctx.db.get(offer.listingId);
      activities.push({
        id: offer._id,
        type: 'offer_submitted',
        description: `New offer: $${offer.offerAmount.toLocaleString()} on ${listing?.address || 'property'}`,
        timestamp: offer.createdAt,
        severity: 'success',
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp - a.timestamp);

    return activities.slice(0, 20);
  },
});
