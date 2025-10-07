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
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️ OPENROUTER_API_KEY not configured, using template generation');
      return generateFallbackContent(listing);
    }
    
    // Use OpenRouter to generate marketing content
    try {
      console.log('[Marketing] Generating AI content via OpenRouter...');
      
      const systemPrompt = `You are a professional real estate marketing copywriter. Generate compelling, accurate, and engaging marketing content for property listings. Focus on highlighting key features, location benefits, and value propositions. Keep tone professional yet warm. Use emojis appropriately for social media posts.`;

      const userPrompt = `Generate complete marketing content for this property:

Address: ${listing.address}
City: ${listing.city}, ${listing.state} ${listing.zipCode}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Feet: ${listing.sqft.toLocaleString()}
${listing.lotSize ? `Lot Size: ${listing.lotSize.toLocaleString()} sqft` : ''}
${listing.yearBuilt ? `Year Built: ${listing.yearBuilt}` : ''}
Property Type: ${listing.propertyType}
Features: ${listing.features.join(', ')}

Generate:
1. A professional 150-200 word listing description for MLS/website
2. A Facebook post (150 words max, engaging, includes emojis)
3. An Instagram post (shorter, emoji-heavy, includes call-to-action)
4. A Twitter/X post (280 characters max)
5. An email template for agent's client list (professional tone)
6. 8-10 relevant hashtags for social media

Format your response as JSON with this structure:
{
  "listingDescription": "...",
  "socialMediaPosts": {
    "facebook": "...",
    "instagram": "...",
    "twitter": "..."
  },
  "emailTemplate": "...",
  "hashtags": ["tag1", "tag2", ...]
}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.OPENROUTER_SITE_NAME || 'Neighborhood Deal Finder',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', await response.text());
        return generateFallbackContent(listing);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('No content in OpenRouter response');
        return generateFallbackContent(listing);
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to parse marketing content JSON');
        return generateFallbackContent(listing);
      }

      const marketingContent = JSON.parse(jsonMatch[0]);
      
      // Validate response structure
      if (!marketingContent.listingDescription || 
          !marketingContent.socialMediaPosts || 
          !marketingContent.emailTemplate ||
          !marketingContent.hashtags) {
        console.error('Incomplete marketing content generated');
        return generateFallbackContent(listing);
      }

      console.log('✅ AI marketing content generated successfully');
      return marketingContent;
      
    } catch (error: any) {
      console.error('AI marketing generation failed:', error.message);
      return generateFallbackContent(listing);
    }
  },
});

// Helper function for fallback content generation
function generateFallbackContent(listing: any) {
  return {
    listingDescription: `Welcome to this stunning ${listing.bedrooms}-bedroom, ${listing.bathrooms}-bathroom ${listing.propertyType} located in the heart of ${listing.city}. This beautiful home offers ${listing.sqft.toLocaleString()} square feet of living space${listing.lotSize ? ` on a ${listing.lotSize.toLocaleString()} square foot lot` : ''}. Featuring ${listing.features.slice(0, 5).join(', ')}, this property combines comfort with style. ${listing.yearBuilt ? `Built in ${listing.yearBuilt}, ` : ''}Priced at $${listing.price.toLocaleString()}, this exceptional property won't last long!`,
    socialMediaPosts: {
      facebook: `🏡 NEW LISTING ALERT! 🏡

Just listed this gorgeous ${listing.bedrooms}BD/${listing.bathrooms}BA home in ${listing.city}! 

✨ ${listing.sqft.toLocaleString()} sqft of beautiful living space
💰 $${listing.price.toLocaleString()}
📍 ${listing.city}, ${listing.state}

Featuring ${listing.features.slice(0, 3).join(', ')} and so much more! This one won't last long.

Interested? Send me a message or call to schedule your private showing today!

#RealEstate #HomeForSale #${listing.city.replace(/\s+/g, '')} #NewListing`,
      instagram: `✨ Just Listed! ✨

${listing.bedrooms}🛏️ ${listing.bathrooms}🛁 | ${listing.sqft.toLocaleString()} sqft
📍 ${listing.city}, ${listing.state}
💰 $${listing.price.toLocaleString()}

${listing.features[0] || 'Beautiful home'} 🌟
${listing.features[1] || 'Great location'} 🏘️

DM me for details or to schedule a showing! 👋

#NewListing #${listing.city.replace(/\s+/g, '')}Homes #RealEstate #HomeForSale #DreamHome`,
      twitter: `🏠 NEW: ${listing.bedrooms}BD/${listing.bathrooms}BA in ${listing.city} - $${listing.price.toLocaleString()}. ${listing.features[0] || 'Must see!'}. DM for showing! #RealEstate #${listing.city.replace(/\s+/g, '')}`,
    },
    emailTemplate: `Subject: NEW LISTING: ${listing.address}

Hi there,

I'm excited to share this incredible new listing with you!

🏡 ${listing.address}
${listing.city}, ${listing.state} ${listing.zipCode}

${listing.bedrooms} Bedrooms | ${listing.bathrooms} Bathrooms | ${listing.sqft.toLocaleString()} sqft
💰 $${listing.price.toLocaleString()}

This beautiful ${listing.propertyType} features:
${listing.features.slice(0, 5).map((f: string) => `• ${f}`).join('\n')}

${listing.yearBuilt ? `Built in ${listing.yearBuilt}, t` : 'T'}his home offers the perfect blend of comfort and style in a desirable ${listing.city} location.

Interested in learning more or scheduling a showing? Simply reply to this email or give me a call!

I'd love to show you this property before it's gone.

Best regards,
Your Real Estate Agent

P.S. Properties in this area don't last long – let me know if you'd like to see it soon!`,
    hashtags: [
      'RealEstate',
      'HomeForSale',
      'HouseHunting',
      'NewListing',
      listing.city.replace(/\s+/g, ''),
      `${listing.city.replace(/\s+/g, '')}Homes`,
      listing.state,
      listing.propertyType.replace(/-/g, ''),
      listing.price < 300000 ? 'AffordableHomes' : listing.price > 800000 ? 'LuxuryHomes' : 'FamilyHome',
    ],
  };
}
