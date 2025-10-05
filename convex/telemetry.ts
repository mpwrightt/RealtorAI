import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const trackPropertyView = mutation({
  args: {
    listingId: v.id("listings"),
    buyerSessionId: v.optional(v.id("buyerSessions")),
    viewerType: v.string(),
    viewDuration: v.number(),
    imagesViewed: v.array(v.number()),
    videosWatched: v.array(v.number()),
    sectionsVisited: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const viewId = await ctx.db.insert("propertyViews", {
      listingId: args.listingId,
      buyerSessionId: args.buyerSessionId,
      viewerType: args.viewerType,
      viewDuration: args.viewDuration,
      imagesViewed: args.imagesViewed,
      videosWatched: args.videosWatched,
      sectionsVisited: args.sectionsVisited,
      timestamp: Date.now(),
    });

    return { viewId };
  },
});

export const getListingAnalytics = query({
  args: {
    listingId: v.id("listings"),
    timeRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    if (args.timeRange) {
      const now = Date.now();
      let cutoff = now;

      switch (args.timeRange) {
        case "24h":
          cutoff = now - 24 * 60 * 60 * 1000;
          break;
        case "7d":
          cutoff = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case "30d":
          cutoff = now - 30 * 24 * 60 * 60 * 1000;
          break;
      }

      views = views.filter((v) => v.timestamp >= cutoff);
    }

    const totalViews = views.length;
    const uniqueViewers = new Set(
      views.map((v) => v.buyerSessionId).filter((id) => id !== undefined)
    ).size;

    const avgViewDuration =
      views.length > 0
        ? views.reduce((sum, v) => sum + v.viewDuration, 0) / views.length
        : 0;

    const viewsByType = views.reduce((acc, v) => {
      acc[v.viewerType] = (acc[v.viewerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostViewedImages = views
      .flatMap((v) => v.imagesViewed)
      .reduce((acc, idx) => {
        acc[idx] = (acc[idx] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    const viewsOverTime = views.reduce((acc, v) => {
      const date = new Date(v.timestamp).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalViews,
      uniqueViewers,
      avgViewDuration: Math.round(avgViewDuration),
      viewsByType,
      mostViewedImages,
      viewsOverTime,
    };
  },
});

export const getBuyerEngagement = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byBuyerSessionId", (q) => 
        q.eq("buyerSessionId", args.buyerSessionId)
      )
      .collect();

    const offers = await ctx.db
      .query("offers")
      .withIndex("byBuyerSessionId", (q) => 
        q.eq("buyerSessionId", args.buyerSessionId)
      )
      .collect();

    const propertiesViewed = new Set(views.map((v) => v.listingId)).size;
    const totalViewTime = views.reduce((sum, v) => sum + v.viewDuration, 0);
    const avgViewDuration =
      views.length > 0 ? totalViewTime / views.length : 0;

    return {
      propertiesViewed,
      totalViews: views.length,
      totalViewTime,
      avgViewDuration: Math.round(avgViewDuration),
      offersSubmitted: offers.length,
    };
  },
});
