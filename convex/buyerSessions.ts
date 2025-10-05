import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
