import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const createListing = mutation({
  args: {
    agentId: v.id("agents"),
    mlsId: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    sqft: v.number(),
    lotSize: v.optional(v.number()),
    yearBuilt: v.optional(v.number()),
    propertyType: v.string(),
    description: v.string(),
    features: v.array(v.string()),
    images: v.array(v.string()),
    videos: v.optional(v.array(v.string())),
    virtualTourUrl: v.optional(v.string()),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const now = Date.now();
    const listingId = await ctx.db.insert("listings", {
      agentId: args.agentId,
      mlsId: args.mlsId,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      price: args.price,
      bedrooms: args.bedrooms,
      bathrooms: args.bathrooms,
      sqft: args.sqft,
      lotSize: args.lotSize,
      yearBuilt: args.yearBuilt,
      propertyType: args.propertyType,
      status: "active",
      description: args.description,
      features: args.features,
      images: args.images,
      videos: args.videos || [],
      virtualTourUrl: args.virtualTourUrl,
      coordinates: args.coordinates,
      createdAt: now,
      updatedAt: now,
    });

    return { listingId };
  },
});

export const getListingById = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    return listing;
  },
});

export const getListingsByAgent = query({
  args: {
    agentId: v.id("agents"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("listings")
      .withIndex("byAgentId", (q) => q.eq("agentId", args.agentId));

    const listings = await query.collect();

    if (args.status) {
      return listings.filter((l) => l.status === args.status);
    }

    return listings.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const searchListings = query({
  args: {
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    cities: v.optional(v.array(v.string())),
    propertyTypes: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let listings = await ctx.db
      .query("listings")
      .withIndex("byStatus", (q) => 
        q.eq("status", args.status || "active")
      )
      .collect();

    if (args.minPrice !== undefined) {
      listings = listings.filter((l) => l.price >= args.minPrice!);
    }

    if (args.maxPrice !== undefined) {
      listings = listings.filter((l) => l.price <= args.maxPrice!);
    }

    if (args.bedrooms !== undefined) {
      listings = listings.filter((l) => l.bedrooms >= args.bedrooms!);
    }

    if (args.bathrooms !== undefined) {
      listings = listings.filter((l) => l.bathrooms >= args.bathrooms!);
    }

    if (args.cities && args.cities.length > 0) {
      listings = listings.filter((l) => 
        args.cities!.some(city => 
          l.city.toLowerCase() === city.toLowerCase()
        )
      );
    }

    if (args.propertyTypes && args.propertyTypes.length > 0) {
      listings = listings.filter((l) => 
        args.propertyTypes!.includes(l.propertyType)
      );
    }

    if (args.features && args.features.length > 0) {
      listings = listings.filter((l) => 
        args.features!.every(feature => 
          l.features.some(f => 
            f.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    return listings.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const updateListing = mutation({
  args: {
    listingId: v.id("listings"),
    price: v.optional(v.number()),
    status: v.optional(v.string()),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    videos: v.optional(v.array(v.string())),
    virtualTourUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { listingId, ...updates } = args;
    
    await ctx.db.patch(listingId, {
      ...Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      ),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateListingStatus = mutation({
  args: {
    listingId: v.id("listings"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.listingId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteListing = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.listingId);
    return { success: true };
  },
});

export const getListingsByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("byCity", (q) => q.eq("city", args.city))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return listings.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getListingsByPriceRange = query({
  args: {
    minPrice: v.number(),
    maxPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .filter((q) => 
        q.and(
          q.gte(q.field("price"), args.minPrice),
          q.lte(q.field("price"), args.maxPrice),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    return listings.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get multiple listings by IDs (for comparison feature)
export const getMultipleListings = query({
  args: {
    listingIds: v.array(v.id("listings")),
  },
  handler: async (ctx, args) => {
    const listings = await Promise.all(
      args.listingIds.map((id) => ctx.db.get(id))
    );
    
    return listings.filter((l) => l !== null);
  },
});
