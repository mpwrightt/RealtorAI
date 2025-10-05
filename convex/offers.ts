import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOffer = mutation({
  args: {
    listingId: v.id("listings"),
    buyerSessionId: v.id("buyerSessions"),
    offerAmount: v.number(),
    earnestMoney: v.number(),
    downPayment: v.number(),
    financingType: v.string(),
    contingencies: v.array(v.string()),
    inspectionPeriod: v.optional(v.number()),
    closingDate: v.optional(v.string()),
    additionalTerms: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    const session = await ctx.db.get(args.buyerSessionId);
    if (!session) {
      throw new Error("Buyer session not found");
    }

    const now = Date.now();

    const offerId = await ctx.db.insert("offers", {
      listingId: args.listingId,
      buyerSessionId: args.buyerSessionId,
      offerAmount: args.offerAmount,
      earnestMoney: args.earnestMoney,
      downPayment: args.downPayment,
      financingType: args.financingType,
      contingencies: args.contingencies,
      inspectionPeriod: args.inspectionPeriod,
      closingDate: args.closingDate,
      additionalTerms: args.additionalTerms,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return { offerId };
  },
});

export const getOfferById = query({
  args: { offerId: v.id("offers") },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.offerId);
    return offer;
  },
});

export const getOffersByListing = query({
  args: {
    listingId: v.id("listings"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("offers")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId));

    const offers = await query.collect();

    if (args.status) {
      return offers.filter((o) => o.status === args.status);
    }

    return offers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getOffersByBuyerSession = query({
  args: { buyerSessionId: v.id("buyerSessions") },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("offers")
      .withIndex("byBuyerSessionId", (q) => 
        q.eq("buyerSessionId", args.buyerSessionId)
      )
      .collect();

    return offers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateOfferStatus = mutation({
  args: {
    offerId: v.id("offers"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.offerId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateOfferAnalysis = mutation({
  args: {
    offerId: v.id("offers"),
    aiAnalysis: v.object({
      marketComparison: v.string(),
      strengths: v.array(v.string()),
      risks: v.array(v.string()),
      recommendation: v.string(),
      confidence: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.offerId, {
      aiAnalysis: args.aiAnalysis,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteOffer = mutation({
  args: { offerId: v.id("offers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.offerId);
    return { success: true };
  },
});
