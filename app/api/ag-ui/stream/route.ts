import { NextRequest } from 'next/server';
import { OpenRouterClient } from '@/lib/openrouter/client';
import { RealEstateAgent } from '@/lib/openrouter/real-estate-agent';
import { executeToolCall } from '@/lib/openrouter/tool-handlers';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message, context, conversationHistory } = await req.json();
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // AG-UI: Send initial message event
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({
              type: 'message',
              role: 'user',
              content: message,
              timestamp: Date.now(),
            })}\n\n`
          ));
          
          // Initialize agent
          const agent = new RealEstateAgent();
          
          // Build message history
          const messages: Message[] = [
            {
              role: 'system',
              content: `You are an AI real estate assistant helping buyers find their perfect home. 

CRITICAL: When a buyer asks to find, search, or see properties (e.g., "show me homes", "find properties", "I'm looking for"), you MUST use the search_properties tool FIRST. Do NOT use calculate_comparables for general property searches.

You have access to these tools:
- search_properties: **USE THIS FIRST** to find properties based on buyer criteria (price, bedrooms, location, features, etc.)
- calculate_comparables: Use ONLY for analyzing a specific property's value against similar sold properties
- calculate_mortgage: Calculate monthly mortgage payments
- get_school_ratings: Get nearby school information  
- get_walk_score: Get walkability, transit, and bike scores
- get_nearby_amenities: Find restaurants, shops, parks nearby
- get_market_trends: Get market analysis and price trends

When using search_properties, extract criteria from the user's natural language:
- Price range (minPrice, maxPrice)
- Bedrooms/bathrooms minimum
- Cities array (e.g., ["San Francisco", "Oakland"])
- Property types (single-family, condo, townhouse, multi-family)
- Features array (e.g., ["Parking", "Pool", "Garden"])

Always use these tools when relevant to provide accurate, data-driven answers.${
  context?.selectedProperties && context.selectedProperties.length > 0
    ? `\n\n=== SELECTED PROPERTIES IN CONTEXT ===\n\nThe buyer has selected ${context.selectedProperties.length} ${context.selectedProperties.length === 1 ? 'property' : 'properties'}:\n\n${context.selectedProperties.map((prop: any, idx: number) => `Property ${idx + 1}: ${prop.address}, ${prop.city}, ${prop.state} ${prop.zipCode || ''}\n   - Price: $${prop.price.toLocaleString()}\n   - ${prop.bedrooms} bed, ${prop.bathrooms} bath, ${prop.sqft.toLocaleString()} sqft\n   - Type: ${prop.propertyType}\n   - Features: ${prop.features?.join(', ') || 'N/A'}${prop.coordinates ? `\n   - Coordinates: ${prop.coordinates.lat}, ${prop.coordinates.lng}` : ''}`).join('\n\n')}\n\nIMPORTANT: When the user asks questions about "this property", "these properties", "the selected ones", or asks you to compare/analyze them, use the information above DIRECTLY. DO NOT call calculate_comparables or other tools for basic questions.\n\nHowever, when the user asks for:\n- Walkability/Walk Score: Use get_walk_score tool with {address: "full address from above", lat: <from Coordinates>, lng: <from Coordinates>}\n- Nearby amenities: Use get_nearby_amenities with {lat: <from Coordinates>, lng: <from Coordinates>, radius: 0.5}\n- School ratings: Use get_school_ratings with {address: "full address", zipCode: "from above"}\n- Market trends: Use get_market_trends with {city: "from above"}\n- Mortgage calculations: Use calculate_mortgage with {price: <from above>, downPayment: <calculate 20%>, interestRate: 7.0}\n\nCRITICAL: Extract values from the context above:\n- Coordinates "37.7989, -122.4382" means lat=37.7989 and lng=-122.4382\n- Address, city, zipCode, price are all listed above\n- DO NOT ask the user for any of these values - extract them from the context!`
    : ''
}`,
            },
            ...(conversationHistory || []),
            {
              role: 'user',
              content: message,
            },
          ];
          
          // Stream response
          let accumulatedContent = '';
          let currentToolCalls: any[] = [];
          
          await agent.streamChat(messages, {
            onContent: (content: string) => {
              accumulatedContent += content;
              // AG-UI: Content event
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({
                  type: 'content',
                  content,
                  timestamp: Date.now(),
                })}\n\n`
              ));
            },
            
            onToolCall: async (toolCall: any) => {
              // AG-UI: Tool call start event
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({
                  type: 'tool_call',
                  id: toolCall.id,
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments,
                  status: 'pending',
                  timestamp: Date.now(),
                })}\n\n`
              ));
              
              currentToolCalls.push(toolCall);
              
              // Execute tool
              try {
                let result;
                
                // Special handling for search_properties - needs Convex access
                if (toolCall.function.name === 'search_properties') {
                  const searchArgs = JSON.parse(toolCall.function.arguments);
                  const listings = await fetchQuery(api.listings.searchListings, {
                    minPrice: searchArgs.minPrice,
                    maxPrice: searchArgs.maxPrice,
                    bedrooms: searchArgs.bedrooms,
                    bathrooms: searchArgs.bathrooms,
                    cities: searchArgs.cities,
                    propertyTypes: searchArgs.propertyTypes,
                    features: searchArgs.features,
                    status: 'active',
                  });
                  
                  result = {
                    count: listings.length,
                    properties: listings.slice(0, 10).map((listing: any) => ({
                      _id: listing._id,
                      id: listing._id, // Include both for compatibility
                      address: listing.address,
                      city: listing.city,
                      state: listing.state,
                      zipCode: listing.zipCode,
                      price: listing.price,
                      bedrooms: listing.bedrooms,
                      bathrooms: listing.bathrooms,
                      sqft: listing.sqft,
                      propertyType: listing.propertyType,
                      features: listing.features,
                      images: listing.images,
                      coordinates: listing.coordinates, // Include coordinates for tools
                      description: listing.description,
                      yearBuilt: listing.yearBuilt,
                      lotSize: listing.lotSize,
                    })),
                  };
                } else {
                  result = await executeToolCall(
                    toolCall.function.name,
                    JSON.parse(toolCall.function.arguments)
                  );
                }
                
                // AG-UI: Tool result event
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'tool_result',
                    id: toolCall.id,
                    name: toolCall.function.name,
                    result,
                    status: 'completed',
                    timestamp: Date.now(),
                  })}\n\n`
                ));
                
                return result;
              } catch (error: any) {
                // AG-UI: Tool error event
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'tool_error',
                    id: toolCall.id,
                    name: toolCall.function.name,
                    error: error.message,
                    timestamp: Date.now(),
                  })}\n\n`
                ));
                
                return { error: error.message };
              }
            },
            
            onComplete: () => {
              // AG-UI: State update event
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({
                  type: 'state_update',
                  state: {
                    messageCount: (conversationHistory?.length || 0) + 2,
                    toolsUsed: currentToolCalls.map((tc: any) => tc.function.name),
                    sessionId,
                  },
                  timestamp: Date.now(),
                })}\n\n`
              ));
              
              // AG-UI: Done event
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'done',
                  timestamp: Date.now(),
                })}\n\n`
              ));
              
              controller.close();
            },
          });
          
        } catch (error: any) {
          console.error('Stream error:', error);
          
          // AG-UI: Error event
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              error: error.message || 'An error occurred',
              timestamp: Date.now(),
            })}\n\n`
          ));
          
          controller.close();
        }
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process request' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
