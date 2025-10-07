# Task 2.2: OpenRouter AI Service

**Phase:** 2 - Backend Infrastructure  
**Estimated Time:** 6-8 hours  
**Priority:** Critical  
**Dependencies:** Task 1.1 (Environment Setup)

## Overview
Build the OpenRouter AI service layer that provides real estate-specific AI capabilities using Claude and other models.

## Subtasks

### 2.2.1 Create OpenRouter Client Wrapper

**File:** `lib/openrouter/client.ts`

- [ ] Create base client class:
  ```typescript
  import OpenAI from 'openai';
  
  export class OpenRouterClient {
    private client: OpenAI;
    
    constructor() {
      this.client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL || '',
          'X-Title': process.env.OPENROUTER_SITE_NAME || '',
        },
      });
    }
  
    async chat(messages: any[], tools?: any[], model?: string) {
      const response = await this.client.chat.completions.create({
        model: model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        messages,
        tools,
        tool_choice: tools ? 'auto' : undefined,
      });
      return response;
    }
  
    async streamChat(messages: any[], tools?: any[], model?: string) {
      const stream = await this.client.chat.completions.create({
        model: model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        messages,
        tools,
        stream: true,
      });
      return stream;
    }
  }
  ```

- [ ] Add error handling and retries
- [ ] Add request logging
- [ ] Test client with simple query

### 2.2.2 Create Tool Definitions

**File:** `lib/openrouter/tools.ts`

- [ ] Define calculateComparables tool:
  ```typescript
  export const calculateComparablesSchema = {
    type: 'function',
    function: {
      name: 'calculate_comparables',
      description: 'Find and analyze comparable property sales in the area',
      parameters: {
        type: 'object',
        properties: {
          address: { type: 'string', description: 'Property address' },
          radius: { type: 'number', description: 'Search radius in miles' },
          minBeds: { type: 'number', description: 'Minimum bedrooms' },
          maxPrice: { type: 'number', description: 'Maximum sale price' },
        },
        required: ['address', 'radius'],
      },
    },
  };
  ```

- [ ] Define getSchoolRatings tool
- [ ] Define calculateMortgage tool
- [ ] Define getWalkScore tool
- [ ] Define getNearbyAmenities tool
- [ ] Define getMarketTrends tool
- [ ] Export all tool schemas as array

### 2.2.3 Create Tool Execution Handlers

**File:** `lib/openrouter/tool-handlers.ts`

- [ ] Implement calculateComparables handler:
  ```typescript
  export async function calculateComparables(args: {
    address: string;
    radius: number;
    minBeds?: number;
    maxPrice?: number;
  }) {
    // Call MLS API or mock data
    // Calculate price per sqft
    // Return comparable sales
  }
  ```

- [ ] Implement getSchoolRatings handler
- [ ] Implement calculateMortgage handler:
  ```typescript
  export function calculateMortgage(args: {
    price: number;
    downPayment: number;
    interestRate: number;
    termYears?: number;
  }) {
    const principal = args.price - args.downPayment;
    const monthlyRate = args.interestRate / 100 / 12;
    const numPayments = (args.termYears || 30) * 12;
    
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(monthlyPayment * numPayments - principal),
      totalPaid: Math.round(monthlyPayment * numPayments),
    };
  }
  ```

- [ ] Implement getWalkScore handler
- [ ] Implement getNearbyAmenities handler
- [ ] Create tool router function

### 2.2.4 Create Real Estate Agent Class

**File:** `lib/openrouter/real-estate-agent.ts`

- [ ] Create main agent class:
  ```typescript
  import { OpenRouterClient } from './client';
  import { realEstateTools } from './tools';
  import { executeTools } from './tool-handlers';
  
  export class RealEstateAgent {
    private client: OpenRouterClient;
    
    constructor() {
      this.client = new OpenRouterClient();
    }
  
    async analyzeProperty(listingData: any) {
      const systemPrompt = `You are an expert real estate analyst...`;
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(listingData) },
      ];
  
      const response = await this.client.chat(messages, realEstateTools);
      
      // Handle tool calls if any
      if (response.choices[0].message.tool_calls) {
        // Execute tools and get results
        // Continue conversation with tool results
      }
  
      return response.choices[0].message.content;
    }
  }
  ```

- [ ] Implement matchBuyerPreferences method
- [ ] Implement analyzeOffer method
- [ ] Implement generatePropertyDescription method
- [ ] Implement answerBuyerQuestion method (streaming)

### 2.2.5 Create Property Analysis Features

**File:** `lib/openrouter/property-analysis.ts`

- [ ] Create property scoring function:
  ```typescript
  export async function scoreProperty(
    listing: any,
    preferences: any
  ): Promise<number> {
    // Score based on price match
    // Score based on features match
    // Score based on location
    // Return 0-100 score
  }
  ```

- [ ] Create market comparison function
- [ ] Create investment analysis function
- [ ] Create neighborhood analysis function

### 2.2.6 Create Offer Analysis Features

**File:** `lib/openrouter/offer-analysis.ts`

- [ ] Create offer evaluation function:
  ```typescript
  export async function evaluateOffer(
    offer: any,
    listing: any,
    comps: any[]
  ) {
    const agent = new RealEstateAgent();
    
    const prompt = `Analyze this offer...`;
    const analysis = await agent.analyzeOffer({
      offer,
      listing,
      comps,
    });
    
    return {
      marketComparison: analysis.market,
      strengths: analysis.strengths,
      risks: analysis.risks,
      recommendation: analysis.recommendation,
      confidence: analysis.confidence,
    };
  }
  ```

- [ ] Create counter-offer suggestion function
- [ ] Create offer comparison function

### 2.2.7 Create Streaming Response Handler

**File:** `lib/openrouter/streaming.ts`

- [ ] Create stream wrapper:
  ```typescript
  export async function* streamAIResponse(
    messages: any[],
    tools?: any[]
  ) {
    const client = new OpenRouterClient();
    const stream = await client.streamChat(messages, tools);
    
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      
      if (delta?.content) {
        yield {
          type: 'content',
          content: delta.content,
        };
      }
      
      if (delta?.tool_calls) {
        yield {
          type: 'tool_call',
          toolCalls: delta.tool_calls,
        };
      }
    }
    
    yield { type: 'done' };
  }
  ```

- [ ] Test streaming with sample queries

### 2.2.8 Create Conversation Context Manager

**File:** `lib/openrouter/context-manager.ts`

- [ ] Create context class:
  ```typescript
  export class ConversationContext {
    private messages: any[] = [];
    private maxMessages: number = 20;
    
    addMessage(role: string, content: string) {
      this.messages.push({ role, content });
      this.trimMessages();
    }
    
    addToolResult(toolCallId: string, result: any) {
      this.messages.push({
        role: 'tool',
        tool_call_id: toolCallId,
        content: JSON.stringify(result),
      });
    }
    
    getMessages() {
      return this.messages;
    }
    
    private trimMessages() {
      if (this.messages.length > this.maxMessages) {
        // Keep system message and recent messages
        const systemMsg = this.messages[0];
        this.messages = [
          systemMsg,
          ...this.messages.slice(-this.maxMessages + 1),
        ];
      }
    }
  }
  ```

- [ ] Test context management

### 2.2.9 Create API Route for AI Queries

**File:** `app/api/ai/query/route.ts`

- [ ] Create POST handler:
  ```typescript
  import { RealEstateAgent } from '@/lib/openrouter/real-estate-agent';
  
  export async function POST(req: Request) {
    try {
      const { query, context, sessionId } = await req.json();
      
      const agent = new RealEstateAgent();
      const response = await agent.answerBuyerQuestion(query, context);
      
      // Log interaction to Convex
      await logInteraction({
        sessionId,
        query,
        response,
      });
      
      return Response.json({ response });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  ```

- [ ] Test API endpoint

### 2.2.10 Create Testing Suite

**File:** `lib/openrouter/__tests__/agent.test.ts`

- [ ] Test property analysis
- [ ] Test buyer matching
- [ ] Test offer analysis
- [ ] Test tool calling
- [ ] Test streaming responses
- [ ] Test error handling

## Acceptance Criteria
- [ ] OpenRouter client connects successfully
- [ ] All tool schemas are valid
- [ ] Tool handlers return expected data
- [ ] Agent methods produce coherent responses
- [ ] Streaming works correctly
- [ ] API routes are functional
- [ ] Tests pass

## Testing Checklist
- [ ] Test with mock data first
- [ ] Test with various property types
- [ ] Test error scenarios (API timeout, invalid input)
- [ ] Test token usage and cost estimation
- [ ] Verify response quality and accuracy

## Next Steps
Proceed to Task 2.3: External API Integrations
