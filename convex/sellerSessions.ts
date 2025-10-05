import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nanoid } from "nanoid";

export const createSellerSession = mutation({
  args: {
    agentId: v.id("agents"),
    listingId: v.id("listings"),
    sellerName: v.string(),
    sellerEmail: v.string(),
    sellerPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    const sessionCode = nanoid(16);
    const now = Date.now();

    const sessionId = await ctx.db.insert("sellerSessions", {
      agentId: args.agentId,
      listingId: args.listingId,
      sellerName: args.sellerName,
      sellerEmail: args.sellerEmail,
      sellerPhone: args.sellerPhone,
      sessionCode,
      active: true,
      createdAt: now,
      lastActive: now,
    });

    return {
      sessionId,
      sessionCode,
    };
  },
});

export const getSellerSessionByCode = query({
  args: { sessionCode: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sellerSessions")
      .withIndex("bySessionCode", (q) => q.eq("sessionCode", args.sessionCode))
      .unique();

    return session;
  },
});

export const getSellerSessionById = query({
  args: { sessionId: v.id("sellerSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    return session;
  },
});

export const getSellerSessionsByAgent = query({
  args: {
    agentId: v.id("agents"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("sellerSessions")
      .withIndex("byAgentId", (q) => q.eq("agentId", args.agentId));

    const sessions = await query.collect();

    const filteredSessions = args.activeOnly
      ? sessions.filter((s) => s.active)
      : sessions;

    const sorted = filteredSessions.sort((a, b) => b.lastActive - a.lastActive);

    // Populate listing data for each session
    return await Promise.all(
      sorted.map(async (session) => {
        const listing = await ctx.db.get(session.listingId);
        return {
          ...session,
          listing,
        };
      })
    );
  },
});

export const getSellerSessionByListing = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sellerSessions")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .unique();

    return session;
  },
});

export const updateSellerSessionLastActive = mutation({
  args: { sessionId: v.id("sellerSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      lastActive: Date.now(),
    });

    return { success: true };
  },
});

export const deactivateSellerSession = mutation({
  args: { sessionId: v.id("sellerSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      active: false,
    });

    return { success: true };
  },
});

export const updateNotificationPreferences = mutation({
  args: {
    sessionId: v.id("sellerSessions"),
    emailNotifications: v.boolean(),
    smsNotifications: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      notificationPreferences: {
        emailNotifications: args.emailNotifications,
        smsNotifications: args.smsNotifications,
      },
    });

    return { success: true };
  },
});

export const getSellerAnalytics = query({
  args: { sessionId: v.id("sellerSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const listing = await ctx.db.get(session.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", session.listingId))
      .collect();

    const offers = await ctx.db
      .query("offers")
      .withIndex("byListingId", (q) => q.eq("listingId", session.listingId))
      .collect();

    const totalViews = views.length;
    const uniqueViewers = new Set(
      views.map((v) => v.buyerSessionId).filter((id) => id !== undefined)
    ).size;
    
    const avgViewDuration = views.length > 0
      ? views.reduce((sum, v) => sum + v.viewDuration, 0) / views.length
      : 0;

    const totalOffers = offers.length;
    const pendingOffers = offers.filter((o) => o.status === "pending").length;
    const acceptedOffers = offers.filter((o) => o.status === "accepted").length;

    const highestOffer = offers.length > 0
      ? Math.max(...offers.map((o) => o.offerAmount))
      : 0;

    const avgOffer = offers.length > 0
      ? offers.reduce((sum, o) => sum + o.offerAmount, 0) / offers.length
      : 0;

    const daysSinceListing = Math.floor(
      (Date.now() - listing.createdAt) / (1000 * 60 * 60 * 24)
    );

    return {
      listing,
      views: {
        total: totalViews,
        unique: uniqueViewers,
        avgDuration: Math.round(avgViewDuration),
      },
      offers: {
        total: totalOffers,
        pending: pendingOffers,
        accepted: acceptedOffers,
        highest: highestOffer,
        average: Math.round(avgOffer),
      },
      daysOnMarket: daysSinceListing,
    };
  },
});
