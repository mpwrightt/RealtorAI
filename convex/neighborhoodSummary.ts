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
      
      const systemPrompt = `You are a local neighborhood expert providing honest, data-driven insights about what it's really like to live in different areas. Focus on facts, local character, and practical day-to-day living information - NOT marketing speak.

CRITICAL TONE & STYLE:
- Write like a knowledgeable local resident, not a real estate agent
- Use specific neighborhood names, landmarks, and local details when available
- Include actual data points from the context (walk scores, school ratings, etc.)
- Be honest and balanced - mention both positives and considerations
- Avoid hyperbolic language ("prime", "unique opportunity", "investment potential")
- Focus on LIVED EXPERIENCE not sales pitch

CRITICAL FORMATTING:
- Write EXACTLY 3 paragraphs, no more, no less
- NO markdown formatting (no **, no ##, no ***, no bullets, no special tags)
- Start directly with content, no headers or titles
- Each paragraph: 3-5 sentences
- Separate paragraphs with a single blank line

Content structure:
Paragraph 1: Neighborhood character and specific location context (mention actual neighborhood names if known)
Paragraph 2: Daily life practicalities - transit, walkability, amenities with specific data points
Paragraph 3: Who lives here and what the lifestyle is actually like (demographics, vibe, community feel)

Use the provided data to be specific and factual.`;

      const userPrompt = `Write an honest neighborhood analysis for this property:

Address: ${args.address}, ${args.city}, ${args.state} ${args.zipCode}
Property Type: ${args.propertyType}

Available Data:
${context}

Write 3 paragraphs describing what it's actually like to live in this specific neighborhood. Be factual, use the data provided, and write like a local resident sharing honest insights - not a sales pitch. Mention specific neighborhoods, actual walk scores, school ratings, and real amenities from the data. No markdown, no headers, just clean plain text.`;

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

      // Clean up any markdown formatting and artifacts that might have been added
      summary = summary
        .replace(/^#+\s+/gm, '') // Remove markdown headers
        .replace(/\*\*\*+/g, '') // Remove bold markdown
        .replace(/\*\*/g, '') // Remove bold
        .replace(/^[-*]\s+/gm, '') // Remove bullet points
        .replace(/^\d+\.\s+/gm, '') // Remove numbered lists
        .replace(/<\s*\|\s*begin__of__sentence\s*\|\s*>/gi, '') // Remove special tokens
        .replace(/<\s*\|\s*end__of__sentence\s*\|\s*>/gi, '') // Remove special tokens
        .replace(/<[^>]+>/g, '') // Remove any remaining HTML/special tags
        .trim();

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
