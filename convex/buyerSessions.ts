import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { nanoid } from "nanoid";

export const createBuyerSession = mutation({
  args: {
    agentId: v.id("agents"),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.optional(v.string()),
    preferences: v.object({
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      propertyTypes: v.array(v.string()),
      cities: v.array(v.string()),
      mustHaveFeatures: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const sessionCode = nanoid(16);
    const now = Date.now();

    const sessionId = await ctx.db.insert("buyerSessions", {
      agentId: args.agentId,
      buyerName: args.buyerName,
      buyerEmail: args.buyerEmail,
      buyerPhone: args.buyerPhone,
      sessionCode,
      preferences: args.preferences,
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

export const getBuyerSessionByCode = query({
  args: { sessionCode: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("buyerSessions")
      .withIndex("bySessionCode", (q) => q.eq("sessionCode", args.sessionCode))
      .unique();

    return session;
  },
});

export const getBuyerSessionById = query({
  args: { sessionId: v.id("buyerSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    return session;
  },
});

export const getBuyerSessionsByAgent = query({
  args: {
    agentId: v.id("agents"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("buyerSessions")
      .withIndex("byAgentId", (q) => q.eq("agentId", args.agentId));

    const sessions = await query.collect();

    if (args.activeOnly) {
      return sessions.filter((s) => s.active);
    }

    return sessions.sort((a, b) => b.lastActive - a.lastActive);
  },
});

export const updateBuyerPreferences = mutation({
  args: {
    sessionId: v.id("buyerSessions"),
    preferences: v.object({
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      propertyTypes: v.array(v.string()),
      cities: v.array(v.string()),
      mustHaveFeatures: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      preferences: args.preferences,
      lastActive: Date.now(),
    });

    return { success: true };
  },
});

export const updateLastActive = mutation({
  args: { sessionId: v.id("buyerSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      lastActive: Date.now(),
    });

    return { success: true };
  },
});

export const deactivateBuyerSession = mutation({
  args: { sessionId: v.id("buyerSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      active: false,
    });

    return { success: true };
  },
});

export const updateNotificationPreferences = mutation({
  args: {
    sessionId: v.id("buyerSessions"),
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

export const updatePreQualification = mutation({
  args: {
    sessionId: v.id("buyerSessions"),
    amount: v.number(),
    lender: v.string(),
    expirationDate: v.number(),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      preQualification: {
        amount: args.amount,
        lender: args.lender,
        expirationDate: args.expirationDate,
        verified: args.verified,
      },
    });

    return { success: true };
  },
});

export const getMatchingListings = query({
  args: { sessionId: v.id("buyerSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const prefs = session.preferences;
    
    let listings = await ctx.db
      .query("listings")
      .withIndex("byStatus", (q) => q.eq("status", "active"))
      .collect();

    if (prefs.minPrice !== undefined) {
      listings = listings.filter((l) => l.price >= prefs.minPrice!);
    }

    if (prefs.maxPrice !== undefined) {
      listings = listings.filter((l) => l.price <= prefs.maxPrice!);
    }

    if (prefs.bedrooms !== undefined) {
      listings = listings.filter((l) => l.bedrooms >= prefs.bedrooms!);
    }

    if (prefs.bathrooms !== undefined) {
      listings = listings.filter((l) => l.bathrooms >= prefs.bathrooms!);
    }

    if (prefs.cities.length > 0) {
      listings = listings.filter((l) => 
        prefs.cities.some(city => 
          l.city.toLowerCase() === city.toLowerCase()
        )
      );
    }

    if (prefs.propertyTypes.length > 0) {
      listings = listings.filter((l) => 
        prefs.propertyTypes.includes(l.propertyType)
      );
    }

    if (prefs.mustHaveFeatures.length > 0) {
      listings = listings.filter((l) => 
        prefs.mustHaveFeatures.every(feature => 
          l.features.some(f => 
            f.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    const scoredListings = listings.map((listing) => {
      let score = 100;
      
      if (prefs.minPrice !== undefined && prefs.maxPrice !== undefined) {
        const priceRange = prefs.maxPrice - prefs.minPrice;
        const idealPrice = (prefs.minPrice + prefs.maxPrice) / 2;
        const priceDiff = Math.abs(listing.price - idealPrice);
        const priceScore = Math.max(0, 100 - (priceDiff / priceRange) * 50);
        score = (score + priceScore) / 2;
      }
      
      const featureMatches = prefs.mustHaveFeatures.filter(feature =>
        listing.features.some(f => 
          f.toLowerCase().includes(feature.toLowerCase())
        )
      ).length;
      
      if (prefs.mustHaveFeatures.length > 0) {
        const featureScore = (featureMatches / prefs.mustHaveFeatures.length) * 100;
        score = (score + featureScore) / 2;
      }

      return {
        ...listing,
        matchScore: Math.round(score),
      };
    });

    return scoredListings.sort((a, b) => b.matchScore - a.matchScore);
  },
});

// Get buyer's property view history with engagement details
export const getBuyerViewHistory = query({
  args: { sessionId: v.id("buyerSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Get all views by this buyer
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byBuyerSessionId", (q) => 
        q.eq("buyerSessionId", args.sessionId)
      )
      .collect();

    // Group by listing
    const listingViews = new Map<string, any>();
    
    for (const view of views) {
      if (!listingViews.has(view.listingId)) {
        const listing = await ctx.db.get(view.listingId);
        if (!listing) continue;
        
        // Use AI match score if available, otherwise calculate simple score
        let matchScore = 70; // default
        
        if (view.aiMatchScore) {
          matchScore = view.aiMatchScore.score;
        } else {
          // Fallback: Simple calculation based on preferences
          const prefs = session.preferences;
          matchScore = 100;
          
          if (prefs.minPrice && listing.price < prefs.minPrice) matchScore -= 20;
          if (prefs.maxPrice && listing.price > prefs.maxPrice) matchScore -= 20;
          if (prefs.bedrooms && listing.bedrooms < prefs.bedrooms) matchScore -= 15;
          if (prefs.bathrooms && listing.bathrooms < prefs.bathrooms) matchScore -= 15;
          matchScore = Math.max(0, matchScore);
        }
        
        listingViews.set(view.listingId, {
          listing,
          viewCount: 0,
          totalTime: 0,
          lastViewed: 0,
          avgImagesViewed: 0,
          matchScore,
          aiMatchData: view.aiMatchScore,
        });
      }
      
      const data = listingViews.get(view.listingId)!;
      data.viewCount += 1;
      data.totalTime += view.viewDuration;
      data.lastViewed = Math.max(data.lastViewed, view.timestamp);
      data.avgImagesViewed = Math.round(
        (data.avgImagesViewed * (data.viewCount - 1) + view.imagesViewed.length) / data.viewCount
      );
      
      // Update match score if this view has a newer AI calculation
      if (view.aiMatchScore && 
          (!data.aiMatchData || view.aiMatchScore.calculatedAt > data.aiMatchData.calculatedAt)) {
        data.matchScore = view.aiMatchScore.score;
        data.aiMatchData = view.aiMatchScore;
      }
    }

    // Calculate engagement scores
    return Array.from(listingViews.values())
      .map((data) => ({
        ...data,
        engagementScore: Math.min(
          100,
          Math.round((data.viewCount * 15) + (data.totalTime / 120))
        ),
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore);
  },
});

// Internal query to get buyer and listing data for match scoring
export const getBuyerAndListingForMatch = internalQuery({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const buyer = await ctx.db.get(args.buyerSessionId);
    const listing = await ctx.db.get(args.listingId);

    return {
      buyer,
      listing,
    };
  },
});
