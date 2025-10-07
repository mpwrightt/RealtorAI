import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getNeighborhoodSummary = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    return listing?.aiNeighborhoodSummary;
  },
});

export const saveNeighborhoodSummary = mutation({
  args: {
    listingId: v.id("listings"),
    summary: v.object({
      propertyContext: v.string(),
      walkabilityTransit: v.string(),
      amenitiesDining: v.string(),
      schoolsFamily: v.string(),
      communityLifestyle: v.string(),
      generatedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.listingId, {
      aiNeighborhoodSummary: args.summary,
    });
  },
});

export const generateNeighborhoodSummary = action({
  args: {
    listingId: v.id("listings"),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    propertyType: v.string(),
    enrichedData: v.optional(v.object({
      walkScore: v.optional(v.number()),
      schoolRatings: v.optional(v.any()),
      nearbyAmenities: v.optional(v.array(v.any())),
      crimeStats: v.optional(v.any()),
      comps: v.optional(v.array(v.any())),
    })),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      // Fallback to basic summary if no API key
      return generateBasicSummary(args);
    }

    try {
      // Prepare the context for the AI
      const context = buildNeighborhoodContext(args);
      
      const systemPrompt = `You are a local neighborhood expert providing honest, data-driven insights about neighborhoods. Write in sections focusing on different aspects of living in the area.

CRITICAL TONE & STYLE:
- Write like a knowledgeable local resident, not a real estate agent
- Use specific neighborhood names, landmarks, and local details
- Include actual data points (walk scores, school ratings, specific amenities)
- Be honest and balanced - both positives and considerations
- Avoid hyperbolic language ("prime", "unique opportunity", "investment")
- Focus on LIVED EXPERIENCE not sales pitch

CRITICAL FORMATTING:
- Write EXACTLY 5 sections separated by "---SECTION---"
- NO markdown formatting (no **, no ##, no bullets, no special tags)
- Each section: 2-3 sentences of plain text
- Be concise but informative

REQUIRED SECTIONS (in this order):
1. PROPERTY CONTEXT: What makes this specific property's location special within the neighborhood
2. WALKABILITY & TRANSIT: Walk score data, transit options, bike infrastructure, commute info
3. AMENITIES & DINING: Specific nearby restaurants, shops, entertainment (use actual names from data)
4. SCHOOLS & FAMILY: School ratings with names, family-friendly features, parks
5. COMMUNITY & LIFESTYLE: Who lives here, neighborhood vibe, local character, demographic feel

Use the provided data to be specific and factual. Each section should stand alone.`;

      const userPrompt = `Write a sectioned neighborhood analysis for this property:

Address: ${args.address}, ${args.city}, ${args.state} ${args.zipCode}
Property Type: ${args.propertyType}

Available Data:
${context}

Write exactly 5 sections separated by "---SECTION---" covering: property context, walkability/transit, amenities/dining, schools/family, and community/lifestyle. Use actual data points, specific place names, and real scores. Each section 2-3 sentences. No markdown, just plain text facts.`;

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
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', await response.text());
        return generateBasicSummary(args);
      }

      const data = await response.json();
      let summary = data.choices[0]?.message?.content;

      if (!summary) {
        return generateBasicSummary(args);
      }

      // Clean up any markdown formatting and artifacts
      summary = summary
        .replace(/^#+\s+/gm, '')
        .replace(/\*\*\*+/g, '')
        .replace(/\*\*/g, '')
        .replace(/^[-*]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/<\s*\|\s*begin__of__sentence\s*\|\s*>/gi, '')
        .replace(/<\s*\|\s*end__of__sentence\s*\|\s*>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();

      // Parse the sections
      const sections = summary.split('---SECTION---').map(s => s.trim()).filter(s => s);
      
      if (sections.length !== 5) {
        console.error('Expected 5 sections, got:', sections.length);
        return generateBasicSummary(args);
      }

      const structuredSummary = {
        propertyContext: sections[0],
        walkabilityTransit: sections[1],
        amenitiesDining: sections[2],
        schoolsFamily: sections[3],
        communityLifestyle: sections[4],
        generatedAt: Date.now(),
      };

      // Save to database
      await ctx.runMutation(api.neighborhoodSummary.saveNeighborhoodSummary, {
        listingId: args.listingId,
        summary: structuredSummary,
      });

      return structuredSummary;
    } catch (error) {
      console.error('Error generating neighborhood summary:', error);
      return generateBasicSummary(args);
    }
  },
});

function buildNeighborhoodContext(args: any): string {
  const parts: string[] = [];

  // Walk Score
  if (args.enrichedData?.walkScore !== undefined) {
    const score = args.enrichedData.walkScore;
    let description = '';
    if (score >= 90) description = "Walker's Paradise - daily errands do not require a car";
    else if (score >= 70) description = "Very Walkable - most errands can be accomplished on foot";
    else if (score >= 50) description = "Somewhat Walkable - some errands can be accomplished on foot";
    else description = "Car-Dependent - most errands require a car";
    
    parts.push(`Walk Score: ${score}/100 (${description})`);
  }

  // Schools
  if (args.enrichedData?.schoolRatings?.elementary?.length > 0) {
    const schools = args.enrichedData.schoolRatings.elementary.slice(0, 3);
    const schoolInfo = schools.map((s: any) => `${s.name} (Rating: ${s.rating}/10)`).join(', ');
    parts.push(`Nearby Schools: ${schoolInfo}`);
  }

  // Amenities
  if (args.enrichedData?.nearbyAmenities?.length > 0) {
    const amenities = args.enrichedData.nearbyAmenities.slice(0, 10);
    const amenityList = amenities.map((a: any) => a.name).join(', ');
    parts.push(`Nearby Amenities (${amenities.length}+ places): ${amenityList}`);
  }

  // Crime Stats
  if (args.enrichedData?.crimeStats) {
    const crime = args.enrichedData.crimeStats;
    if (crime.rating || crime.level) {
      parts.push(`Safety: ${crime.rating || crime.level}`);
    }
  }

  // Comparables
  if (args.enrichedData?.comps?.length > 0) {
    const avgPrice = args.enrichedData.comps.reduce((sum: number, comp: any) => sum + (comp.price || 0), 0) / args.enrichedData.comps.length;
    parts.push(`Recent comparable sales average: $${Math.round(avgPrice).toLocaleString()}`);
  }

  return parts.length > 0 ? parts.join('\n\n') : 'Limited data available for this area.';
}

function generateBasicSummary(args: any) {
  const propertyContext = `Located in ${args.city}, ${args.state}, this ${args.propertyType.replace('-', ' ')} sits in a ${args.enrichedData?.walkScore >= 70 ? 'walkable' : args.enrichedData?.walkScore >= 50 ? 'moderately walkable' : 'car-dependent'} neighborhood. The property's location provides access to the area's amenities and local character.`;

  let walkabilityTransit = 'Transportation information is limited for this area.';
  if (args.enrichedData?.walkScore !== undefined) {
    const score = args.enrichedData.walkScore;
    if (score >= 90) {
      walkabilityTransit = `Exceptional walkability with a Walk Score of ${score}/100. Daily errands can be accomplished on foot, with excellent pedestrian infrastructure. Public transportation and bike lanes make getting around easy.`;
    } else if (score >= 70) {
      walkabilityTransit = `Very walkable area with a Walk Score of ${score}/100. Most errands can be completed on foot, and the neighborhood is well-served by public transit. Biking is a viable option for local trips.`;
    } else if (score >= 50) {
      walkabilityTransit = `Moderate walkability with a Walk Score of ${score}/100. Some amenities are within walking distance, but a car is helpful for most errands. Limited public transit options available.`;
    } else {
      walkabilityTransit = `Car-dependent location with a Walk Score of ${score}/100. Most errands require a vehicle. The area provides easy access to major roads and ample parking.`;
    }
  }

  let amenitiesDining = 'Local amenities data is not available.';
  if (args.enrichedData?.nearbyAmenities?.length > 0) {
    const count = args.enrichedData.nearbyAmenities.length;
    const places = args.enrichedData.nearbyAmenities.slice(0, 3).map((a: any) => a.name).join(', ');
    if (count >= 10) {
      amenitiesDining = `The area offers ${count}+ nearby points of interest including ${places}. Residents have access to diverse dining, shopping, and entertainment options within a short distance.`;
    } else {
      amenitiesDining = `${count} local amenities nearby including ${places}. The neighborhood provides essential services and some dining options for residents.`;
    }
  }

  let schoolsFamily = 'School information is not available for this area.';
  if (args.enrichedData?.schoolRatings?.elementary?.[0]) {
    const topSchool = args.enrichedData.schoolRatings.elementary[0];
    if (topSchool.rating >= 8) {
      schoolsFamily = `Families benefit from highly-rated schools like ${topSchool.name} (${topSchool.rating}/10). The area is family-friendly with access to quality education and parks.`;
    } else if (topSchool.rating >= 6) {
      schoolsFamily = `The neighborhood is served by schools including ${topSchool.name} (${topSchool.rating}/10). Family-oriented amenities are available in the area.`;
    }
  }

  const communityLifestyle = `${args.city} offers a mix of urban and suburban living. The neighborhood appeals to a diverse range of residents and maintains a balanced community atmosphere.`;

  return {
    propertyContext,
    walkabilityTransit,
    amenitiesDining,
    schoolsFamily,
    communityLifestyle,
    generatedAt: Date.now(),
  };
}
