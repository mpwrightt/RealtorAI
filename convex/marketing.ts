import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Get marketing campaigns for a listing
export const getCampaignByListing = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db
      .query("marketingCampaigns")
      .withIndex("byListing", (q) => q.eq("listingId", args.listingId))
      .first();
    
    return campaign;
  },
});

// Get all campaigns for an agent
export const getCampaignsByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("marketingCampaigns")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
    
    return campaigns;
  },
});

// Create or update marketing campaign
export const saveCampaign = mutation({
  args: {
    listingId: v.id("listings"),
    agentId: v.id("agents"),
    type: v.string(),
    generatedContent: v.object({
      listingDescription: v.optional(v.string()),
      socialMediaPosts: v.optional(v.object({
        facebook: v.string(),
        instagram: v.string(),
        twitter: v.string(),
      })),
      emailTemplate: v.optional(v.string()),
      hashtags: v.array(v.string()),
    }),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if campaign already exists
    const existing = await ctx.db
      .query("marketingCampaigns")
      .withIndex("byListing", (q) => q.eq("listingId", args.listingId))
      .first();
    
    const now = Date.now();
    
    if (existing) {
      // Update existing campaign
      await ctx.db.patch(existing._id, {
        type: args.type,
        generatedContent: args.generatedContent,
        status: args.status || existing.status,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new campaign
      return await ctx.db.insert("marketingCampaigns", {
        listingId: args.listingId,
        agentId: args.agentId,
        type: args.type,
        generatedContent: args.generatedContent,
        status: args.status || "draft",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Update campaign status
export const updateCampaignStatus = mutation({
  args: {
    campaignId: v.id("marketingCampaigns"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.campaignId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Delete campaign
export const deleteCampaign = mutation({
  args: {
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.campaignId);
  },
});

// Generate marketing content (action that calls external API)
export const generateMarketing = action({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args): Promise<any> => {
    // Fetch the listing
    const listing: any = await ctx.runQuery(api.listings.getListingById, {
      listingId: args.listingId,
    });
    
    if (!listing) {
      throw new Error("Listing not found");
    }
    
    // Use the AI marketing generator
    // Note: This requires OPENROUTER_API_KEY to be set in environment
    try {
      // Dynamic import to avoid bundling issues
      const { marketingGenerator } = await import('../app/lib/openrouter/marketing-generator');
      
      const generatedContent = await marketingGenerator.generateFullMarketing({
        address: listing.address,
        city: listing.city,
        state: listing.state,
        zipCode: listing.zipCode,
        price: listing.price,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        sqft: listing.sqft,
        lotSize: listing.lotSize,
        yearBuilt: listing.yearBuilt,
        propertyType: listing.propertyType,
        description: listing.description,
        features: listing.features,
      });
      
      return generatedContent;
    } catch (error: any) {
      console.error('AI marketing generation failed, using fallback:', error.message);
      
      // Fallback to template-based generation if API fails or is not configured
      const generatedContent = {
        listingDescription: `Welcome to this stunning ${listing.bedrooms}-bedroom, ${listing.bathrooms}-bathroom ${listing.propertyType} located in the heart of ${listing.city}. This beautiful home offers ${listing.sqft.toLocaleString()} square feet of living space, featuring ${listing.features.slice(0, 3).join(', ')}. Priced at $${listing.price.toLocaleString()}, this property won't last long!`,
        socialMediaPosts: {
          facebook: `🏡 NEW LISTING ALERT! 🏡\n\nCheck out this gorgeous ${listing.bedrooms}BD/${listing.bathrooms}BA home in ${listing.city}! ${listing.features[0]} and more. $${listing.price.toLocaleString()} - Don't miss out!\n\n#RealEstate #HomeForSale #${listing.city.replace(/\s+/g, '')}`,
          instagram: `✨ Just Listed ✨\n\n${listing.bedrooms}🛏️ ${listing.bathrooms}🛁 | ${listing.sqft.toLocaleString()} sqft\n📍 ${listing.city}, ${listing.state}\n💰 $${listing.price.toLocaleString()}\n\n${listing.features[0]} 🌟\nDM for details!\n\n#NewListing #DreamHome #${listing.city}Homes`,
          twitter: `🏠 NEW: ${listing.bedrooms}BD/${listing.bathrooms}BA in ${listing.city} - $${listing.price.toLocaleString()}. ${listing.features[0]}. Contact me for details! #RealEstate`,
        },
        emailTemplate: `Subject: NEW LISTING: ${listing.address}\n\nHi there,\n\nI'm excited to share this incredible new listing with you!\n\n${listing.address}\n${listing.city}, ${listing.state}\n\n${listing.bedrooms} Bedrooms | ${listing.bathrooms} Bathrooms | ${listing.sqft.toLocaleString()} sqft\n$${listing.price.toLocaleString()}\n\nThis beautiful home features:\n${listing.features.slice(0, 5).map((f: string) => `- ${f}`).join('\n')}\n\nInterested in scheduling a showing? Reply to this email or give me a call!\n\nBest regards,\nYour Real Estate Agent`,
        hashtags: [
          'RealEstate',
          'HomeForSale',
          'HouseHunting',
          listing.city.replace(/\s+/g, ''),
          listing.state,
          listing.propertyType.replace(/-/g, ''),
        ],
      };
      
      return generatedContent;
    }
  },
});
