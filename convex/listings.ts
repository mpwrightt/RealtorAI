import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper function to convert listing storage IDs to URLs
async function convertListingImagesToUrls(ctx: QueryCtx, listing: any) {
  if (!listing || !listing.images) return listing;
  
  const imageUrls = await Promise.all(
    listing.images.map(async (storageId: any) => {
      try {
        const url = await ctx.storage.getUrl(storageId);
        return url || '';
      } catch (error) {
        console.error('Failed to get image URL:', error);
        return '';
      }
    })
  );
  
  return {
    ...listing,
    images: imageUrls.filter((url: string) => url !== ''),
  };
}

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
    return await convertListingImagesToUrls(ctx, listing);
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

    let listings = await query.collect();

    if (args.status) {
      listings = listings.filter((l) => l.status === args.status);
    }

    // Convert storage IDs to URLs
    const listingsWithUrls = await Promise.all(
      listings.map(listing => convertListingImagesToUrls(ctx, listing))
    );

    return listingsWithUrls.sort((a, b) => b.updatedAt - a.updatedAt);
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

    // Convert storage IDs to URLs for all listings
    const listingsWithUrls = await Promise.all(
      listings.map(listing => convertListingImagesToUrls(ctx, listing))
    );

    return listingsWithUrls.sort((a, b) => b.updatedAt - a.updatedAt);
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

    // Convert storage IDs to URLs
    const listingsWithUrls = await Promise.all(
      listings.map(listing => convertListingImagesToUrls(ctx, listing))
    );

    return listingsWithUrls.sort((a, b) => b.updatedAt - a.updatedAt);
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

    // Convert storage IDs to URLs
    const listingsWithUrls = await Promise.all(
      listings.map(listing => convertListingImagesToUrls(ctx, listing))
    );

    return listingsWithUrls.sort((a, b) => b.updatedAt - a.updatedAt);
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
    
    const validListings = listings.filter((l) => l !== null);
    
    // Convert storage IDs to URLs
    return await Promise.all(
      validListings.map(listing => convertListingImagesToUrls(ctx, listing))
    );
  },
});

// Get comprehensive listing details with analytics
export const getListingWithAnalytics = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) return null;

    // Convert image storage IDs to URLs
    const imageUrls = listing.images 
      ? await Promise.all(
          listing.images.map(async (storageId) => {
            try {
              const url = await ctx.storage.getUrl(storageId as any);
              return url || '';
            } catch (error) {
              console.error('Failed to get image URL:', error);
              return '';
            }
          })
        )
      : [];

    // Get view analytics
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Get unique viewers
    const uniqueViewers = new Set(
      views.map((v) => v.buyerSessionId).filter((id) => id !== undefined)
    ).size;

    // Get all offers
    const offers = await ctx.db
      .query("offers")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Calculate days on market
    const daysOnMarket = Math.floor(
      (Date.now() - listing.createdAt) / (1000 * 60 * 60 * 24)
    );

    return {
      listing: {
        ...listing,
        images: imageUrls.filter(url => url !== ''), // Replace storage IDs with URLs
      },
      analytics: {
        totalViews: views.length,
        uniqueViewers,
        avgViewDuration:
          views.length > 0
            ? views.reduce((sum, v) => sum + v.viewDuration, 0) / views.length
            : 0,
        daysOnMarket,
      },
      offers: {
        total: offers.length,
        pending: offers.filter((o) => o.status === "pending").length,
        accepted: offers.filter((o) => o.status === "accepted").length,
        rejected: offers.filter((o) => o.status === "rejected").length,
      },
    };
  },
});

// Get all buyers who viewed this listing with engagement details
export const getListingBuyerActivity = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Group by buyer session
    const buyerViews = new Map<Id<"buyerSessions">, any>();
    
    for (const view of views) {
      if (!view.buyerSessionId) continue;
      
      if (!buyerViews.has(view.buyerSessionId)) {
        const session = await ctx.db.get(view.buyerSessionId);
        if (!session) continue;
        
        // Use AI match score if available, otherwise calculate simple score
        const listing = await ctx.db.get(args.listingId);
        let matchScore = 70; // default
        
        if (view.aiMatchScore) {
          matchScore = view.aiMatchScore.score;
        } else if (listing) {
          // Fallback: Simple calculation based on preferences
          const prefs = session.preferences;
          matchScore = 100;
          
          if (prefs.minPrice && listing.price < prefs.minPrice) matchScore -= 20;
          if (prefs.maxPrice && listing.price > prefs.maxPrice) matchScore -= 20;
          if (prefs.bedrooms && listing.bedrooms < prefs.bedrooms) matchScore -= 15;
          if (prefs.bathrooms && listing.bathrooms < prefs.bathrooms) matchScore -= 15;
          matchScore = Math.max(0, matchScore);
        }
        
        buyerViews.set(view.buyerSessionId, {
          session,
          viewCount: 0,
          totalTime: 0,
          lastViewed: 0,
          engagementScore: 0,
          matchScore,
          aiMatchData: view.aiMatchScore,
        });
      }
      
      const buyer = buyerViews.get(view.buyerSessionId)!;
      buyer.viewCount += 1;
      buyer.totalTime += view.viewDuration;
      buyer.lastViewed = Math.max(buyer.lastViewed, view.timestamp);
      
      // Update match score if this view has a newer AI calculation
      if (view.aiMatchScore && 
          (!buyer.aiMatchData || view.aiMatchScore.calculatedAt > buyer.aiMatchData.calculatedAt)) {
        buyer.matchScore = view.aiMatchScore.score;
        buyer.aiMatchData = view.aiMatchScore;
      }
    }

    // Calculate engagement scores
    return Array.from(buyerViews.values()).map((buyer) => ({
      ...buyer,
      engagementScore: Math.min(
        100,
        Math.round((buyer.viewCount * 10) + (buyer.totalTime / 60))
      ),
    })).sort((a, b) => b.engagementScore - a.engagementScore);
  },
});

// Get activity timeline for listing
export const getListingEngagementTimeline = query({
  args: {
    listingId: v.id("listings"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Get views
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Get offers
    const offers = await ctx.db
      .query("offers")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Combine into timeline
    const timeline: any[] = [];

    for (const view of views) {
      let buyerName = "Anonymous";
      if (view.buyerSessionId) {
        const session = await ctx.db.get(view.buyerSessionId);
        if (session) buyerName = session.buyerName;
      }

      timeline.push({
        type: "view",
        timestamp: view.timestamp,
        buyerName,
        duration: view.viewDuration,
        imagesViewed: view.imagesViewed.length,
      });
    }

    for (const offer of offers) {
      const session = await ctx.db.get(offer.buyerSessionId);
      
      timeline.push({
        type: "offer",
        timestamp: offer.createdAt,
        buyerName: session?.buyerName || "Unknown",
        amount: offer.offerAmount,
        status: offer.status,
      });
    }

    return timeline
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },
});

// Get connected sessions (seller and buyers)
export const getListingConnectedSessions = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    // Get seller session
    const sellerSession = await ctx.db
      .query("sellerSessions")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .unique();

    // Get buyer sessions that viewed this property
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    const buyerSessionIds = new Set(
      views.map((v) => v.buyerSessionId).filter((id) => id !== undefined)
    );

    const buyerSessions = await Promise.all(
      Array.from(buyerSessionIds).map((id) => ctx.db.get(id!))
    );

    return {
      sellerSession,
      buyerSessions: buyerSessions.filter((s) => s !== null),
    };
  },
});
