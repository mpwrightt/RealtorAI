import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSavedSearch = mutation({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    searchName: v.string(),
    criteria: v.object({
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      cities: v.array(v.string()),
      features: v.array(v.string()),
    }),
    notificationsEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.buyerSessionId);
    if (!session) {
      throw new Error("Buyer session not found");
    }

    const searchId = await ctx.db.insert("savedSearches", {
      buyerSessionId: args.buyerSessionId,
      searchName: args.searchName,
      criteria: args.criteria,
      notificationsEnabled: args.notificationsEnabled,
      createdAt: Date.now(),
    });

    return { searchId };
  },
});

export const getSavedSearches = query({
  args: { buyerSessionId: v.id("buyerSessions") },
  handler: async (ctx, args) => {
    const searches = await ctx.db
      .query("savedSearches")
      .withIndex("byBuyerSessionId", (q) => 
        q.eq("buyerSessionId", args.buyerSessionId)
      )
      .collect();

    return searches.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateSavedSearch = mutation({
  args: {
    searchId: v.id("savedSearches"),
    searchName: v.optional(v.string()),
    criteria: v.optional(v.object({
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      cities: v.array(v.string()),
      features: v.array(v.string()),
    })),
    notificationsEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { searchId, ...updates } = args;
    
    await ctx.db.patch(searchId, {
      ...Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      ),
    });

    return { success: true };
  },
});

export const deleteSavedSearch = mutation({
  args: { searchId: v.id("savedSearches") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.searchId);
    return { success: true };
  },
});

export const runSavedSearch = query({
  args: { searchId: v.id("savedSearches") },
  handler: async (ctx, args) => {
    const search = await ctx.db.get(args.searchId);
    if (!search) {
      throw new Error("Saved search not found");
    }

    const criteria = search.criteria;
    
    let listings = await ctx.db
      .query("listings")
      .withIndex("byStatus", (q) => q.eq("status", "active"))
      .collect();

    if (criteria.minPrice !== undefined) {
      listings = listings.filter((l) => l.price >= criteria.minPrice!);
    }

    if (criteria.maxPrice !== undefined) {
      listings = listings.filter((l) => l.price <= criteria.maxPrice!);
    }

    if (criteria.bedrooms !== undefined) {
      listings = listings.filter((l) => l.bedrooms >= criteria.bedrooms!);
    }

    if (criteria.bathrooms !== undefined) {
      listings = listings.filter((l) => l.bathrooms >= criteria.bathrooms!);
    }

    if (criteria.cities.length > 0) {
      listings = listings.filter((l) => 
        criteria.cities.some(city => 
          l.city.toLowerCase() === city.toLowerCase()
        )
      );
    }

    if (criteria.features.length > 0) {
      listings = listings.filter((l) => 
        criteria.features.every(feature => 
          l.features.some(f => 
            f.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    return listings.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const updateLastRun = mutation({
  args: { searchId: v.id("savedSearches") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.searchId, {
      lastRun: Date.now(),
    });

    return { success: true };
  },
});
