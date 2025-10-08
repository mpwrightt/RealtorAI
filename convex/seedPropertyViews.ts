import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Generate fake property views for testing AI match scoring
export const generateFakeViews = mutation({
  args: {},
  handler: async (ctx, args) => {
    console.log("🌱 Starting to generate fake property views...");

    // Get all active buyer sessions
    const buyers = await ctx.db.query("buyerSessions").filter((q) => q.eq(q.field("active"), true)).collect();
    
    // Get all active listings
    const listings = await ctx.db.query("listings").filter((q) => q.eq(q.field("status"), "active")).collect();

    if (buyers.length === 0) {
      console.warn("⚠️ No active buyer sessions found");
      return { success: false, message: "No active buyer sessions found" };
    }

    if (listings.length === 0) {
      console.warn("⚠️ No active listings found");
      return { success: false, message: "No active listings found" };
    }

    console.log(`📊 Found ${buyers.length} buyers and ${listings.length} listings`);

    let viewsCreated = 0;
    const now = Date.now();

    // For each buyer, create views for 3-8 random properties
    for (const buyer of buyers) {
      const numViewsForBuyer = Math.floor(Math.random() * 6) + 3; // 3-8 views
      const shuffledListings = [...listings].sort(() => Math.random() - 0.5);
      const listingsToView = shuffledListings.slice(0, Math.min(numViewsForBuyer, listings.length));

      for (const listing of listingsToView) {
        // Random view duration between 30 seconds and 10 minutes
        const viewDuration = Math.floor(Math.random() * 570) + 30;
        
        // Random number of images viewed (0 to min(5, total images))
        const maxImages = Math.min(5, listing.images.length);
        const numImagesViewed = Math.floor(Math.random() * (maxImages + 1));
        const imagesViewed = Array.from(
          { length: numImagesViewed }, 
          (_, i) => i
        );

        // Random video views
        const videosWatched = listing.videos.length > 0 && Math.random() > 0.5 
          ? [0] 
          : [];

        // Random sections visited
        const allSections = ['details', 'gallery', 'neighborhood', 'mortgage', 'chat'];
        const numSections = Math.floor(Math.random() * 4) + 2; // 2-5 sections
        const sectionsVisited = allSections
          .sort(() => Math.random() - 0.5)
          .slice(0, numSections);

        // Create view with timestamp in the last 7 days
        const daysAgo = Math.floor(Math.random() * 7);
        const timestamp = now - (daysAgo * 24 * 60 * 60 * 1000) - Math.floor(Math.random() * 24 * 60 * 60 * 1000);

        const viewId = await ctx.db.insert("propertyViews", {
          listingId: listing._id,
          buyerSessionId: buyer._id,
          viewerType: "buyer",
          viewDuration,
          imagesViewed,
          videosWatched,
          sectionsVisited,
          timestamp,
        });

        // Schedule AI match score calculation
        await ctx.scheduler.runAfter(0, api.matchScoring.calculateAndStoreMatchScore, {
          viewId,
          buyerSessionId: buyer._id,
          listingId: listing._id,
        });

        viewsCreated++;
        console.log(`✅ Created view: ${buyer.buyerName} → ${listing.address} (${viewDuration}s)`);
      }
    }

    console.log(`🎉 Successfully created ${viewsCreated} fake property views`);
    console.log(`🤖 AI match score calculations scheduled for all views`);

    return {
      success: true,
      viewsCreated,
      buyersCount: buyers.length,
      listingsCount: listings.length,
    };
  },
});

// Clear all property views (for testing/reset)
export const clearAllViews = mutation({
  args: {},
  handler: async (ctx, args) => {
    console.log("🗑️ Clearing all property views...");

    const views = await ctx.db.query("propertyViews").collect();
    
    for (const view of views) {
      await ctx.db.delete(view._id);
    }

    console.log(`✅ Deleted ${views.length} property views`);

    return {
      success: true,
      deletedCount: views.length,
    };
  },
});
