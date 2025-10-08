import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new draft
export const createDraft = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const draftId = await ctx.db.insert("listingDrafts", {
      agentId: args.agentId,
      photos: [],
      lastSaved: Date.now(),
      createdAt: Date.now(),
    });

    return draftId;
  },
});

// Update draft with address information
export const updateDraftAddress = mutation({
  args: {
    draftId: v.id("listingDrafts"),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.draftId, {
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      coordinates: args.coordinates,
      lastSaved: Date.now(),
    });

    return { success: true };
  },
});

// Update draft with price
export const updateDraftPrice = mutation({
  args: {
    draftId: v.id("listingDrafts"),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.draftId, {
      price: args.price,
      lastSaved: Date.now(),
    });

    return { success: true };
  },
});

// Add photos to draft
export const addPhotos = mutation({
  args: {
    draftId: v.id("listingDrafts"),
    photoIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft) throw new Error("Draft not found");

    const updatedPhotos = [...draft.photos, ...args.photoIds];

    await ctx.db.patch(args.draftId, {
      photos: updatedPhotos,
      lastSaved: Date.now(),
    });

    return { success: true, totalPhotos: updatedPhotos.length };
  },
});

// Update draft with AI analysis results
export const updateDraftAnalysis = mutation({
  args: {
    draftId: v.id("listingDrafts"),
    analysis: v.object({
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      sqft: v.optional(v.number()),
      features: v.array(v.string()),
      photoAnalysis: v.array(v.object({
        storageId: v.id("_storage"),
        roomType: v.string(),
        features: v.array(v.string()),
        qualityScore: v.number(),
        suggestedUse: v.string(),
        order: v.number(),
      })),
      suggestedCoverPhoto: v.optional(v.id("_storage")),
      description: v.optional(v.string()),
      confidence: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.draftId, {
      aiAnalysis: args.analysis,
      lastSaved: Date.now(),
    });

    return { success: true };
  },
});

// Update manual overrides
export const updateManualOverrides = mutation({
  args: {
    draftId: v.id("listingDrafts"),
    overrides: v.object({
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      sqft: v.optional(v.number()),
      features: v.optional(v.array(v.string())),
      description: v.optional(v.string()),
      propertyType: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft) throw new Error("Draft not found");

    const updatedOverrides = {
      ...draft.manualOverrides,
      ...args.overrides,
    };

    await ctx.db.patch(args.draftId, {
      manualOverrides: updatedOverrides,
      lastSaved: Date.now(),
    });

    return { success: true };
  },
});

// Get draft by ID
export const getDraft = query({
  args: {
    draftId: v.id("listingDrafts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.draftId);
  },
});

// Get all drafts for an agent
export const getAgentDrafts = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("listingDrafts")
      .withIndex("byAgentId", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
  },
});

// Delete a draft
export const deleteDraft = mutation({
  args: {
    draftId: v.id("listingDrafts"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    
    if (!draft) throw new Error("Draft not found");

    // Delete associated photos from storage
    for (const photoId of draft.photos) {
      try {
        await ctx.storage.delete(photoId as Id<"_storage">);
      } catch (error) {
        console.error("Error deleting photo:", photoId, error);
      }
    }

    await ctx.db.delete(args.draftId);

    return { success: true };
  },
});
