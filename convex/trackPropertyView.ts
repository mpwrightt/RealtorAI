import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Track a property view and calculate AI match score
export const trackViewWithMatchScore = mutation({
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
    const timestamp = Date.now();

    // Create the property view record
    const viewId = await ctx.db.insert("propertyViews", {
      listingId: args.listingId,
      buyerSessionId: args.buyerSessionId,
      viewerType: args.viewerType,
      viewDuration: args.viewDuration,
      imagesViewed: args.imagesViewed,
      videosWatched: args.videosWatched,
      sectionsVisited: args.sectionsVisited,
      timestamp,
    });

    // If this is a buyer viewing, schedule AI match score calculation
    if (args.buyerSessionId) {
      // Schedule async action to calculate match score
      await ctx.scheduler.runAfter(0, api.matchScoring.calculateAndStoreMatchScore, {
        viewId,
        buyerSessionId: args.buyerSessionId,
        listingId: args.listingId,
      });
    }

    return viewId;
  },
});

// Update a property view with AI match score
export const updateViewWithMatchScore = mutation({
  args: {
    viewId: v.id("propertyViews"),
    matchScore: v.number(),
    breakdown: v.object({
      price: v.number(),
      location: v.number(),
      propertyType: v.number(),
      rooms: v.number(),
      features: v.number(),
    }),
    reasoning: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.viewId as Id<"propertyViews">, {
      aiMatchScore: {
        score: args.matchScore,
        breakdown: args.breakdown,
        reasoning: args.reasoning,
        calculatedAt: Date.now(),
      },
    });
  },
});
