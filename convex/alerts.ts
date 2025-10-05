import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new alert when new listings match a saved search
export const createAlert = mutation({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    savedSearchId: v.id("savedSearches"),
    newListingIds: v.array(v.id("listings")),
  },
  handler: async (ctx, args) => {
    const alertId = await ctx.db.insert("alerts", {
      buyerSessionId: args.buyerSessionId,
      savedSearchId: args.savedSearchId,
      newListingIds: args.newListingIds,
      notified: false,
      createdAt: Date.now(),
    });
    
    return alertId;
  },
});

// Get unread alerts for a buyer
export const getUnreadAlerts = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("byBuyerSessionId", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId)
      )
      .filter((q) => q.eq(q.field("notified"), false))
      .collect();
    
    // Fetch saved search details for each alert
    const alertsWithDetails = await Promise.all(
      alerts.map(async (alert) => {
        const savedSearch = await ctx.db.get(alert.savedSearchId);
        const listings = await Promise.all(
          alert.newListingIds.map((id) => ctx.db.get(id))
        );
        
        return {
          ...alert,
          savedSearch,
          listings: listings.filter((l) => l !== null),
        };
      })
    );
    
    return alertsWithDetails;
  },
});

// Get all alerts for a buyer (read and unread)
export const getAllAlerts = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("byBuyerSessionId", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId)
      )
      .order("desc")
      .collect();
    
    // Fetch saved search and listing details
    const alertsWithDetails = await Promise.all(
      alerts.map(async (alert) => {
        const savedSearch = await ctx.db.get(alert.savedSearchId);
        const listings = await Promise.all(
          alert.newListingIds.map((id) => ctx.db.get(id))
        );
        
        return {
          ...alert,
          savedSearch,
          listings: listings.filter((l) => l !== null),
        };
      })
    );
    
    return alertsWithDetails;
  },
});

// Mark alert as notified/read
export const markAlertAsNotified = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, {
      notified: true,
    });
  },
});

// Mark all alerts as read for a buyer
export const markAllAlertsAsRead = mutation({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("byBuyerSessionId", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId)
      )
      .filter((q) => q.eq(q.field("notified"), false))
      .collect();
    
    await Promise.all(
      alerts.map((alert) =>
        ctx.db.patch(alert._id, { notified: true })
      )
    );
    
    return { count: alerts.length };
  },
});

// Count unread alerts
export const getUnreadAlertCount = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("byBuyerSessionId", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId)
      )
      .filter((q) => q.eq(q.field("notified"), false))
      .collect();
    
    return alerts.length;
  },
});
