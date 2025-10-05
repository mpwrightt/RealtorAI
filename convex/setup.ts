import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { nanoid } from "nanoid";

// Create a test agent profile for development
export const createTestAgent = mutation({
  args: {
    externalId: v.string(),
    agencyName: v.string(),
    email: v.string(),
    licenseNumber: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // First, find or create the user
    let user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        externalId: args.externalId,
        name: args.agencyName,
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Failed to create user");
    }

    // Check if agent already exists
    const existingAgent = await ctx.db
      .query("agents")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .unique();

    if (existingAgent) {
      return {
        message: "Agent already exists",
        agent: existingAgent,
      };
    }

    // Create agent profile
    const inviteCode = nanoid(12);
    const agentId = await ctx.db.insert("agents", {
      userId: user._id,
      agencyName: args.agencyName,
      licenseNumber: args.licenseNumber || "TEST-" + Math.random().toString(36).substring(7).toUpperCase(),
      email: args.email,
      phone: args.phone,
      inviteCode,
      active: true,
      createdAt: Date.now(),
    });

    const agent = await ctx.db.get(agentId);

    return {
      message: "Agent created successfully!",
      agent,
    };
  },
});

// Create a test listing
export const createTestListing = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const listingId = await ctx.db.insert("listings", {
      agentId: args.agentId,
      address: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      price: 1250000,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 2000,
      lotSize: 0.15,
      yearBuilt: 2015,
      propertyType: "single-family",
      status: "active",
      description: "Beautiful modern home in the heart of San Francisco. This stunning property features high ceilings, hardwood floors, and a gourmet kitchen with top-of-the-line appliances. The master suite includes a spa-like bathroom and walk-in closet. Private backyard perfect for entertaining.",
      features: [
        "Hardwood Floors",
        "Granite Countertops",
        "Stainless Steel Appliances",
        "Central Air",
        "Walk-in Closet",
        "Private Backyard",
        "2-Car Garage",
        "Smart Home System",
      ],
      images: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      ],
      videos: [],
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { listingId };
  },
});

// Create a test buyer session
export const createTestBuyerSession = mutation({
  args: {
    agentId: v.id("agents"),
    buyerName: v.optional(v.string()),
    buyerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionCode = nanoid(16);
    const now = Date.now();

    const sessionId = await ctx.db.insert("buyerSessions", {
      agentId: args.agentId,
      buyerName: args.buyerName || "John Buyer",
      buyerEmail: args.buyerEmail || "buyer@example.com",
      sessionCode,
      preferences: {
        minPrice: 800000,
        maxPrice: 1500000,
        bedrooms: 3,
        bathrooms: 2,
        propertyTypes: ["single-family", "condo"],
        cities: ["San Francisco", "Oakland"],
        mustHaveFeatures: ["Parking", "Hardwood Floors"],
      },
      active: true,
      createdAt: now,
      lastActive: now,
    });

    const session = await ctx.db.get(sessionId);

    return {
      message: "Buyer session created!",
      session,
      buyerUrl: `/buyer/${sessionCode}`,
    };
  },
});

// Create a test seller session
export const createTestSellerSession = mutation({
  args: {
    agentId: v.id("agents"),
    listingId: v.id("listings"),
    sellerName: v.optional(v.string()),
    sellerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionCode = nanoid(16);
    const now = Date.now();

    const sessionId = await ctx.db.insert("sellerSessions", {
      agentId: args.agentId,
      listingId: args.listingId,
      sellerName: args.sellerName || "Jane Seller",
      sellerEmail: args.sellerEmail || "seller@example.com",
      sessionCode,
      active: true,
      createdAt: now,
      lastActive: now,
    });

    const session = await ctx.db.get(sessionId);

    return {
      message: "Seller session created!",
      session,
      sellerUrl: `/seller/${sessionCode}`,
    };
  },
});


