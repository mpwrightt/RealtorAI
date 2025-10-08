'use node';

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Calculate match score using AI
export const calculateAIMatchScore = action({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args): Promise<{
    matchScore: number;
    breakdown: {
      price: number;
      location: number;
      propertyType: number;
      rooms: number;
      features: number;
    };
    reasoning: string;
  }> => {
    // Get buyer session and listing data
    const session: {
      buyer: any;
      listing: any;
    } = await ctx.runQuery(internal.buyerSessions.getBuyerAndListingForMatch, {
      buyerSessionId: args.buyerSessionId,
      listingId: args.listingId,
    });

    if (!session.buyer || !session.listing) {
      console.warn('⚠️ Missing buyer or listing data for match calculation');
      return { 
        matchScore: 0, 
        breakdown: { price: 0, location: 0, propertyType: 0, rooms: 0, features: 0 },
        reasoning: "Missing data" 
      };
    }

    console.log('📊 Calculating match for:', {
      buyer: session.buyer.buyerName,
      listing: session.listing.address,
      price: session.listing.price,
      budget: `${session.buyer.preferences.minPrice}-${session.buyer.preferences.maxPrice}`
    });

    const buyer: any = session.buyer;
    const listing: any = session.listing;

    // Import OpenRouter client
    const OpenRouterModule = await import("../app/lib/openrouter/client");
    const openrouter = new OpenRouterModule.OpenRouterClient();

    const prompt = `You are a real estate matching AI. Calculate how well this property matches the buyer's preferences on a scale of 0-100.

BUYER PREFERENCES:
- Budget: $${buyer.preferences.minPrice?.toLocaleString() || '0'} - $${buyer.preferences.maxPrice?.toLocaleString() || 'unlimited'}
- Bedrooms: ${buyer.preferences.bedrooms || 'any'}+
- Bathrooms: ${buyer.preferences.bathrooms || 'any'}+
- Property Types: ${buyer.preferences.propertyTypes.join(', ') || 'any'}
- Preferred Cities: ${buyer.preferences.cities.join(', ') || 'any'}
- Must-Have Features: ${buyer.preferences.mustHaveFeatures.join(', ') || 'none specified'}
${buyer.preQualification ? `- Pre-qualified: $${buyer.preQualification.amount.toLocaleString()}` : ''}

PROPERTY DETAILS:
- Address: ${listing.address}, ${listing.city}, ${listing.state}
- Price: $${listing.price.toLocaleString()}
- Bedrooms: ${listing.bedrooms}
- Bathrooms: ${listing.bathrooms}
- Square Feet: ${listing.sqft.toLocaleString()}
- Property Type: ${listing.propertyType}
- Features: ${listing.features.join(', ')}
${listing.yearBuilt ? `- Year Built: ${listing.yearBuilt}` : ''}
${listing.lotSize ? `- Lot Size: ${listing.lotSize} sqft` : ''}

SCORING CRITERIA:
1. Price Match (30 points): How well does the price fit the budget?
2. Location Match (20 points): Is it in a preferred city?
3. Property Type Match (15 points): Is it their preferred type?
4. Bedroom/Bathroom Match (15 points): Does it meet minimum requirements?
5. Features Match (20 points): How many must-have features does it have?

Return ONLY a JSON object with this exact structure:
{
  "matchScore": <number 0-100>,
  "breakdown": {
    "price": <number 0-30>,
    "location": <number 0-20>,
    "propertyType": <number 0-15>,
    "rooms": <number 0-15>,
    "features": <number 0-20>
  },
  "reasoning": "<2-3 sentence explanation>"
}`;

    try {
      const response = await openrouter.chat([
        {
          role: "user",
          content: prompt,
        },
      ], {
        model: process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet",
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      // Parse the JSON response
      const result = JSON.parse(content);
      
      return {
        matchScore: Math.min(100, Math.max(0, result.matchScore)),
        breakdown: result.breakdown,
        reasoning: result.reasoning,
      };
    } catch (error) {
      console.error("Error calculating AI match score:", error);
      
      // Fallback to simple calculation
      return calculateSimpleMatchScore(buyer, listing);
    }
  },
});

// Fallback simple calculation
function calculateSimpleMatchScore(buyer: any, listing: any): any {
  let score = 0;
  const breakdown = {
    price: 0,
    location: 0,
    propertyType: 0,
    rooms: 0,
    features: 0,
  };

  // Price match (30 points)
  if (buyer.preferences.minPrice && buyer.preferences.maxPrice) {
    if (listing.price >= buyer.preferences.minPrice && listing.price <= buyer.preferences.maxPrice) {
      breakdown.price = 30;
    } else if (listing.price < buyer.preferences.minPrice) {
      breakdown.price = 15; // Under budget is okay
    } else {
      const overage = (listing.price - buyer.preferences.maxPrice) / buyer.preferences.maxPrice;
      breakdown.price = Math.max(0, 30 - Math.floor(overage * 100));
    }
  } else {
    breakdown.price = 20; // No preference specified
  }

  // Location match (20 points)
  if (buyer.preferences.cities.length > 0) {
    if (buyer.preferences.cities.some((city: string) => 
      listing.city.toLowerCase().includes(city.toLowerCase())
    )) {
      breakdown.location = 20;
    }
  } else {
    breakdown.location = 15; // No preference
  }

  // Property type match (15 points)
  if (buyer.preferences.propertyTypes.length > 0) {
    if (buyer.preferences.propertyTypes.includes(listing.propertyType)) {
      breakdown.propertyType = 15;
    } else {
      breakdown.propertyType = 5;
    }
  } else {
    breakdown.propertyType = 10;
  }

  // Rooms match (15 points)
  let roomsScore = 0;
  if (buyer.preferences.bedrooms) {
    if (listing.bedrooms >= buyer.preferences.bedrooms) {
      roomsScore += 8;
    } else {
      roomsScore += Math.max(0, 8 - (buyer.preferences.bedrooms - listing.bedrooms) * 2);
    }
  } else {
    roomsScore += 5;
  }

  if (buyer.preferences.bathrooms) {
    if (listing.bathrooms >= buyer.preferences.bathrooms) {
      roomsScore += 7;
    } else {
      roomsScore += Math.max(0, 7 - (buyer.preferences.bathrooms - listing.bathrooms) * 2);
    }
  } else {
    roomsScore += 5;
  }
  breakdown.rooms = Math.min(15, roomsScore);

  // Features match (20 points)
  if (buyer.preferences.mustHaveFeatures.length > 0) {
    const matchedFeatures = buyer.preferences.mustHaveFeatures.filter((feature: string) =>
      listing.features.some((f: string) => 
        f.toLowerCase().includes(feature.toLowerCase()) ||
        feature.toLowerCase().includes(f.toLowerCase())
      )
    );
    breakdown.features = Math.floor((matchedFeatures.length / buyer.preferences.mustHaveFeatures.length) * 20);
  } else {
    breakdown.features = 15;
  }

  score = breakdown.price + breakdown.location + breakdown.propertyType + breakdown.rooms + breakdown.features;

  return {
    matchScore: Math.min(100, score),
    breakdown,
    reasoning: "Calculated based on price, location, property type, rooms, and features.",
  };
}

// Calculate and store match score for a property view
export const calculateAndStoreMatchScore = action({
  args: {
    viewId: v.id("propertyViews"),
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log('🎯 Starting AI match score calculation for view:', args.viewId);
    
    // Calculate the AI match score
    const matchResult: {
      matchScore: number;
      breakdown: {
        price: number;
        location: number;
        propertyType: number;
        rooms: number;
        features: number;
      };
      reasoning: string;
    } = await ctx.runAction(api.matchScoring.calculateAIMatchScore, {
      buyerSessionId: args.buyerSessionId,
      listingId: args.listingId,
    });

    // Store the result in the property view
    await ctx.runMutation(api.trackPropertyView.updateViewWithMatchScore, {
      viewId: args.viewId,
      matchScore: matchResult.matchScore,
      breakdown: matchResult.breakdown,
      reasoning: matchResult.reasoning,
    });

    console.log('✅ AI match score calculated:', matchResult.matchScore, '%');
    
    return matchResult;
  },
});

// Note: getBuyerAndListingForMatch moved to buyerSessions.ts to avoid Node.js module restrictions
