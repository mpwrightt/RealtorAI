import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateNeighborhoodSummary = action({
  args: {
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
      
      const systemPrompt = `You are an expert real estate analyst specializing in neighborhood analysis. Your role is to provide detailed, insightful summaries that help buyers understand the character, lifestyle, and value proposition of a neighborhood.

Create comprehensive neighborhood summaries that:
- Describe the overall character and vibe of the area
- Highlight walkability and transportation options
- Discuss school quality and family-friendliness
- Cover local amenities, dining, and entertainment
- Mention safety and crime statistics
- Describe the housing market and investment potential
- Note any unique features or selling points

Be specific, engaging, and informative. Use data from the context when available. Write 3-4 paragraphs that paint a vivid picture of living in this neighborhood.`;

      const userPrompt = `Generate a detailed neighborhood summary for this property:

Address: ${args.address}, ${args.city}, ${args.state} ${args.zipCode}
Property Type: ${args.propertyType}

${context}

Write a comprehensive 3-4 paragraph summary that helps potential buyers understand what it's like to live in this neighborhood. Be specific and use the data provided.`;

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
      const summary = data.choices[0]?.message?.content;

      if (!summary) {
        return generateBasicSummary(args);
      }

      return {
        summary,
        generatedAt: Date.now(),
      };
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

function generateBasicSummary(args: any): { summary: string; generatedAt: number } {
  const parts: string[] = [];
  
  // Start with location
  parts.push(`Located in ${args.city}, ${args.state}, this ${args.propertyType.replace('-', ' ')} offers a unique living opportunity in the area.`);

  // Walkability
  if (args.enrichedData?.walkScore !== undefined) {
    const score = args.enrichedData.walkScore;
    if (score >= 90) {
      parts.push("The neighborhood boasts exceptional walkability, with daily errands easily accomplished on foot. Residents enjoy a pedestrian-friendly environment with abundant nearby amenities.");
    } else if (score >= 70) {
      parts.push("This walkable neighborhood allows residents to complete most errands without a car, offering convenient access to local shops, restaurants, and services.");
    } else if (score >= 50) {
      parts.push("The area offers moderate walkability with several amenities within walking distance, though some errands may require a vehicle.");
    } else {
      parts.push("This car-friendly location provides easy access to major roads and highways, with ample parking available for residents.");
    }
  }

  // Schools
  if (args.enrichedData?.schoolRatings?.elementary?.[0]) {
    const topSchool = args.enrichedData.schoolRatings.elementary[0];
    if (topSchool.rating >= 8) {
      parts.push(`Families will appreciate the highly-rated schools in the area, including ${topSchool.name} with a ${topSchool.rating}/10 rating.`);
    } else if (topSchool.rating >= 6) {
      parts.push(`The neighborhood is served by good schools, including ${topSchool.name}.`);
    }
  }

  // Amenities
  if (args.enrichedData?.nearbyAmenities?.length > 0) {
    const count = args.enrichedData.nearbyAmenities.length;
    if (count >= 10) {
      parts.push(`With ${count}+ points of interest nearby, residents enjoy abundant local amenities including dining, shopping, and entertainment options.`);
    } else if (count >= 5) {
      parts.push(`The location provides convenient access to ${count} local amenities, offering a good balance of suburban comfort and urban convenience.`);
    }
  }

  return {
    summary: parts.join(' '),
    generatedAt: Date.now(),
  };
}
