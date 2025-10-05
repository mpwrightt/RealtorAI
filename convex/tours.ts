import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const requestTour = mutation({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
    requestedDate: v.number(),
    timeSlot: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const tourId = await ctx.db.insert("tours", {
      buyerSessionId: args.buyerSessionId,
      listingId: args.listingId,
      requestedDate: args.requestedDate,
      timeSlot: args.timeSlot,
      notes: args.notes,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    
    return tourId;
  },
});

export const getToursByBuyer = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const tours = await ctx.db
      .query("tours")
      .withIndex("byBuyerSessionId", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId)
      )
      .order("desc")
      .collect();
    
    // Fetch listing details
    const toursWithListings = await Promise.all(
      tours.map(async (tour) => {
        const listing = await ctx.db.get(tour.listingId);
        return {
          ...tour,
          listing,
        };
      })
    );
    
    return toursWithListings.filter(t => t.listing !== null);
  },
});

export const updateTourStatus = mutation({
  args: {
    tourId: v.id("tours"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tourId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const cancelTour = mutation({
  args: {
    tourId: v.id("tours"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tourId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
  },
});
