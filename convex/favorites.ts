import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const addFavorite = mutation({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("byBuyerAndListing", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId).eq("listingId", args.listingId)
      )
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("favorites", {
      buyerSessionId: args.buyerSessionId,
      listingId: args.listingId,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const removeFavorite = mutation({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("byBuyerAndListing", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId).eq("listingId", args.listingId)
      )
      .first();
    
    if (favorite) {
      await ctx.db.delete(favorite._id);
    }
  },
});

export const getFavorites = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("byBuyerSessionId", (q) => q.eq("buyerSessionId", args.buyerSessionId))
      .order("desc")
      .collect();
    
    // Fetch full listing details
    const listingsWithFavorites = await Promise.all(
      favorites.map(async (fav) => {
        const listing = await ctx.db.get(fav.listingId);
        if (!listing) return null;
        
        return {
          ...listing,
          favoriteId: fav._id,
          favoriteNotes: fav.notes,
          favoritedAt: fav.createdAt,
        };
      })
    );
    
    return listingsWithFavorites.filter((l) => l !== null);
  },
});

export const isFavorite = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("byBuyerAndListing", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId).eq("listingId", args.listingId)
      )
      .first();
    
    return !!favorite;
  },
});

export const updateFavoriteNotes = mutation({
  args: {
    favoriteId: v.id("favorites"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if favorite exists first
    const favorite = await ctx.db.get(args.favoriteId);
    
    if (!favorite) {
      throw new Error(`Favorite with ID ${args.favoriteId} not found`);
    }
    
    await ctx.db.patch(args.favoriteId, {
      notes: args.notes,
    });
    
    return { success: true };
  },
});

export const getFavoriteCount = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("byBuyerSessionId", (q) => q.eq("buyerSessionId", args.buyerSessionId))
      .collect();
    
    return favorites.length;
  },
});
