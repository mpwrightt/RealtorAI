import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all open houses for a listing
export const getOpenHousesByListing = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("openHouses")
      .withIndex("byListing", (q) => q.eq("listingId", args.listingId))
      .order("desc")
      .collect();
  },
});

// Get all open houses for an agent
export const getOpenHousesByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const openHouses = await ctx.db
      .query("openHouses")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
    
    // Get listing info for each open house
    const withListings = await Promise.all(
      openHouses.map(async (oh) => {
        const listing = await ctx.db.get(oh.listingId);
        return { ...oh, listing };
      })
    );
    
    return withListings;
  },
});

// Get a single open house by ID
export const getOpenHouseById = query({
  args: { openHouseId: v.id("openHouses") },
  handler: async (ctx, args) => {
    const openHouse = await ctx.db.get(args.openHouseId);
    if (!openHouse) return null;
    
    const listing = await ctx.db.get(openHouse.listingId);
    const attendees = await ctx.db
      .query("openHouseAttendees")
      .withIndex("byOpenHouse", (q) => q.eq("openHouseId", args.openHouseId))
      .collect();
    
    return {
      ...openHouse,
      listing,
      attendees,
      attendeeCount: attendees.length,
      interestedCount: attendees.filter(a => a.interested).length,
    };
  },
});

// Get upcoming open houses
export const getUpcomingOpenHouses = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const openHouses = await ctx.db
      .query("openHouses")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .filter((q) => q.gte(q.field("startTime"), now))
      .order("asc")
      .collect();
    
    const withListings = await Promise.all(
      openHouses.map(async (oh) => {
        const listing = await ctx.db.get(oh.listingId);
        return { ...oh, listing };
      })
    );
    
    return withListings;
  },
});

// Create an open house
export const createOpenHouse = mutation({
  args: {
    listingId: v.id("listings"),
    agentId: v.id("agents"),
    startTime: v.number(),
    endTime: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("openHouses", {
      listingId: args.listingId,
      agentId: args.agentId,
      startTime: args.startTime,
      endTime: args.endTime,
      status: "scheduled",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update open house
export const updateOpenHouse = mutation({
  args: {
    openHouseId: v.id("openHouses"),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { openHouseId, ...updates } = args;
    
    await ctx.db.patch(openHouseId, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete open house
export const deleteOpenHouse = mutation({
  args: { openHouseId: v.id("openHouses") },
  handler: async (ctx, args) => {
    // Delete all attendees first
    const attendees = await ctx.db
      .query("openHouseAttendees")
      .withIndex("byOpenHouse", (q) => q.eq("openHouseId", args.openHouseId))
      .collect();
    
    for (const attendee of attendees) {
      await ctx.db.delete(attendee._id);
    }
    
    // Delete the open house
    await ctx.db.delete(args.openHouseId);
    
    return { success: true };
  },
});

// Add attendee to open house
export const addAttendee = mutation({
  args: {
    openHouseId: v.id("openHouses"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    interested: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("openHouseAttendees", {
      openHouseId: args.openHouseId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      notes: args.notes,
      interested: args.interested,
      followUpSent: false,
      createdAt: Date.now(),
    });
  },
});

// Get attendees for an open house
export const getAttendees = query({
  args: { openHouseId: v.id("openHouses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("openHouseAttendees")
      .withIndex("byOpenHouse", (q) => q.eq("openHouseId", args.openHouseId))
      .order("desc")
      .collect();
  },
});

// Update attendee
export const updateAttendee = mutation({
  args: {
    attendeeId: v.id("openHouseAttendees"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    interested: v.optional(v.boolean()),
    followUpSent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { attendeeId, ...updates } = args;
    await ctx.db.patch(attendeeId, updates);
    return { success: true };
  },
});

// Delete attendee
export const deleteAttendee = mutation({
  args: { attendeeId: v.id("openHouseAttendees") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.attendeeId);
    return { success: true };
  },
});

// Mark follow-up sent for attendee
export const markFollowUpSent = mutation({
  args: { attendeeId: v.id("openHouseAttendees") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.attendeeId, {
      followUpSent: true,
    });
    return { success: true };
  },
});

// Get open house stats for an agent
export const getOpenHouseStats = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const openHouses = await ctx.db
      .query("openHouses")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    const now = Date.now();
    const scheduled = openHouses.filter(oh => oh.status === "scheduled" && oh.startTime > now).length;
    const completed = openHouses.filter(oh => oh.status === "completed").length;
    
    let totalAttendees = 0;
    let totalInterested = 0;
    
    for (const oh of openHouses) {
      const attendees = await ctx.db
        .query("openHouseAttendees")
        .withIndex("byOpenHouse", (q) => q.eq("openHouseId", oh._id))
        .collect();
      
      totalAttendees += attendees.length;
      totalInterested += attendees.filter(a => a.interested).length;
    }
    
    return {
      total: openHouses.length,
      scheduled,
      completed,
      totalAttendees,
      totalInterested,
    };
  },
});
