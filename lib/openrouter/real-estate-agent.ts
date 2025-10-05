import { OpenRouterClient, ChatMessage } from './client';
import { realEstateTools } from './tools';
import { executeToolCall } from './tool-handlers';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class RealEstateAgent {
  private client: OpenRouterClient;
  private tools = realEstateTools;

  constructor() {
    this.client = new OpenRouterClient();
  }

  async analyzeProperty(listingData: any): Promise<string> {
    const systemPrompt = `You are an expert real estate analyst with deep knowledge of property valuation, market trends, and neighborhood analysis. 
    
Your role is to provide detailed, accurate, and helpful property analysis to help buyers and sellers make informed decisions. Use the available tools to gather data and provide comprehensive insights.

When analyzing properties, consider:
- Location and neighborhood quality
- Property condition and features
- Market comparables and pricing
- Investment potential
- Schools and amenities
- Market trends and timing

Always be honest, professional, and transparent in your analysis.`;

    const userMessage = `Please analyze this property and provide a comprehensive overview:

${JSON.stringify(listingData, null, 2)}

Include market position, key features, pricing analysis, and recommendations for buyers.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const response = await this.client.chat(messages, {
      tools: realEstateTools,
      tool_choice: 'auto',
    });

    let finalResponse = response.choices[0].message.content || '';
    const toolCalls = response.choices[0].message.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      const toolMessages: ChatMessage[] = [...messages];
      toolMessages.push({
        role: 'assistant',
        content: finalResponse || '',
        tool_calls: toolCalls,
      });

      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        try {
          const toolResult = await executeToolCall(toolName, toolArgs);
          
          toolMessages.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id,
          });
        } catch (error: any) {
          toolMessages.push({
            role: 'tool',
            content: JSON.stringify({ error: error.message }),
            tool_call_id: toolCall.id,
          });
        }
      }

      const finalResponseObj = await this.client.chat(toolMessages);
      finalResponse = finalResponseObj.choices[0].message.content || finalResponse;
    }

    return finalResponse;
  }

  async matchBuyerPreferences(listings: any[], preferences: any): Promise<any[]> {
    const systemPrompt = `You are a real estate matching specialist. Score and rank properties based on how well they match buyer preferences.`;

    const userMessage = `Score these properties for a buyer with the following preferences:

Preferences:
${JSON.stringify(preferences, null, 2)}

Properties:
${JSON.stringify(listings, null, 2)}

Return a JSON array of objects with: listingId, score (0-100), matchReasons (array of strings).`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const response = await this.client.chat(messages, {
      temperature: 0.3,
    });

    try {
      const content = response.choices[0].message.content || '[]';
      const matches = JSON.parse(content);
      return matches;
    } catch {
      return listings.map(listing => ({
        listingId: listing._id,
        score: 50,
        matchReasons: ['Unable to process matching criteria'],
      }));
    }
  }

  async analyzeOffer(offerData: {
    offer: any;
    listing: any;
    comps?: any[];
  }): Promise<{
    marketComparison: string;
    strengths: string[];
    risks: string[];
    recommendation: string;
    confidence: number;
  }> {
    const systemPrompt = `You are an expert real estate negotiation advisor. Analyze offers objectively and provide strategic insights for decision-making.`;

    const userMessage = `Analyze this offer:

Offer Details:
${JSON.stringify(offerData.offer, null, 2)}

Listing Details:
${JSON.stringify(offerData.listing, null, 2)}

${offerData.comps ? `Market Comparables:\n${JSON.stringify(offerData.comps, null, 2)}` : ''}

Provide a JSON response with:
- marketComparison: string analysis
- strengths: array of offer strengths
- risks: array of potential risks
- recommendation: string recommendation
- confidence: number 0-1`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const response = await this.client.chat(messages, {
      tools: realEstateTools,
      temperature: 0.4,
    });

    try {
      const content = response.choices[0].message.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      
      return {
        marketComparison: analysis.marketComparison || 'Unable to determine market position',
        strengths: analysis.strengths || [],
        risks: analysis.risks || [],
        recommendation: analysis.recommendation || 'Further analysis needed',
        confidence: analysis.confidence || 0.5,
      };
    } catch {
      return {
        marketComparison: 'Unable to analyze offer',
        strengths: [],
        risks: ['Analysis error occurred'],
        recommendation: 'Manual review recommended',
        confidence: 0,
      };
    }
  }

  async generatePropertyDescription(listingData: any): Promise<string> {
    const systemPrompt = `You are a creative real estate copywriter. Write compelling, accurate property descriptions that highlight key features and appeal to potential buyers.`;

    const userMessage = `Create a compelling property description for:

${JSON.stringify(listingData, null, 2)}

Write a 2-3 paragraph description that:
- Opens with an attention-grabbing highlight
- Describes key features naturally
- Emphasizes lifestyle benefits
- Ends with a call to action`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const response = await this.client.chat(messages, {
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || '';
  }

  async answerBuyerQuestion(
    question: string,
    context: any
  ): Promise<string> {
    const systemPrompt = `You are a helpful real estate assistant helping buyers find their perfect home. 
    
Be conversational, friendly, and informative. Use tools to provide accurate data when needed. Always be transparent about what you know and don't know.

Key principles:
- Help buyers understand their options
- Provide data-driven insights
- Be honest about market conditions
- Suggest relevant properties
- Answer questions clearly and concisely`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (context.conversationHistory) {
      messages.push(...context.conversationHistory);
    }

    if (context.currentProperty) {
      messages.push({
        role: 'system',
        content: `Current property context: ${JSON.stringify(context.currentProperty)}`,
      });
    }

    messages.push({
      role: 'user',
      content: question,
    });

    const response = await this.client.chat(messages, {
      tools: realEstateTools,
      tool_choice: 'auto',
      temperature: 0.7,
    });

    let finalResponse = response.choices[0].message.content || '';
    const toolCalls = response.choices[0].message.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      const toolMessages: ChatMessage[] = [...messages];
      toolMessages.push({
        role: 'assistant',
        content: finalResponse || '',
        tool_calls: toolCalls,
      });

      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        try {
          const toolResult = await executeToolCall(toolName, toolArgs);
          
          toolMessages.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id,
          });
        } catch (error: any) {
          toolMessages.push({
            role: 'tool',
            content: JSON.stringify({ error: error.message }),
            tool_call_id: toolCall.id,
          });
        }
      }

      const finalResponseObj = await this.client.chat(toolMessages);
      finalResponse = finalResponseObj.choices[0].message.content || finalResponse;
    }

    return finalResponse;
  }

  /**
   * Stream chat with tool support and callbacks for AG-UI integration
   */
  async streamChat(
    messages: Message[],
    callbacks?: {
      onContent?: (content: string) => void;
      onToolCall?: (toolCall: any) => Promise<any>;
      onComplete?: () => void;
    }
  ): Promise<void> {
    const response = await this.client.streamChat(messages, {
      tools: this.tools,
    });
    
    const toolCalls: Map<string, any> = new Map();
    let initialContent = '';
    
    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta;
      
      // Handle content chunks
      if (delta?.content && callbacks?.onContent) {
        initialContent += delta.content;
        callbacks.onContent(delta.content);
      }
      
      // Handle tool calls (accumulate them as they stream in)
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const existing = toolCalls.get(tc.index.toString()) || {
            id: tc.id || '',
            type: 'function',
            function: { name: '', arguments: '' },
          };
          
          if (tc.id) existing.id = tc.id;
          if (tc.function?.name) existing.function.name = tc.function.name;
          if (tc.function?.arguments) {
            existing.function.arguments += tc.function.arguments;
          }
          
          toolCalls.set(tc.index.toString(), existing);
        }
      }
    }
    
    // Execute tool calls if any and get final response
    if (toolCalls.size > 0 && callbacks?.onToolCall) {
      const toolResults: any[] = [];
      
      for (const toolCall of toolCalls.values()) {
        if (toolCall.function.name && toolCall.function.arguments) {
          const result = await callbacks.onToolCall(toolCall);
          toolResults.push({ toolCall, result });
        }
      }
      
      // Make a follow-up request with tool results to get AI's final response
      if (toolResults.length > 0) {
        const followUpMessages = [
          ...messages,
          {
            role: 'assistant' as const,
            content: initialContent || '',
            tool_calls: Array.from(toolCalls.values()),
          },
          ...toolResults.map(({ toolCall, result }) => ({
            role: 'tool' as const,
            content: JSON.stringify(result),
            tool_call_id: toolCall.id,
          })),
        ];
        
        // Stream the final response
        const finalResponse = await this.client.streamChat(followUpMessages, {
          tools: this.tools,
        });
        
        for await (const chunk of finalResponse) {
          const delta = chunk.choices[0]?.delta;
          if (delta?.content && callbacks?.onContent) {
            callbacks.onContent(delta.content);
          }
        }
      }
    }
    
    // Call complete callback
    if (callbacks?.onComplete) {
      callbacks.onComplete();
    }
  }
}
