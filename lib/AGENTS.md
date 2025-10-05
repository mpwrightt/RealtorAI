# Lib Directory - Agent Instructions

## Overview
This directory contains utility functions, helpers, OpenRouter AI service, and external API integrations.

## Directory Structure

```
lib/
├── openrouter/             # OpenRouter AI service layer
│   ├── client.ts           # OpenRouter client wrapper
│   ├── real-estate-agent.ts  # Agent classes
│   ├── tools.ts            # Tool definitions
│   ├── tool-handlers.ts    # Tool execution
│   └── streaming.ts        # Streaming helpers
├── integrations/           # External API clients
│   ├── mls.ts              # MLS API
│   ├── mapbox.ts           # Maps and geocoding
│   ├── schools.ts          # School ratings
│   ├── walkscore.ts        # Walk scores
│   └── enrichment.ts       # Data enrichment orchestrator
├── buyer-auth.ts           # Buyer session verification
├── seller-auth.ts          # Seller session verification
└── utils.ts                # Utility functions
```

## OpenRouter Integration

### Client Setup
```typescript
import OpenAI from 'openai';

export class OpenRouterClient {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL,
        'X-Title': process.env.OPENROUTER_SITE_NAME,
      },
    });
  }
  
  async chat(messages, tools, model) {
    return await this.client.chat.completions.create({
      model: model || process.env.OPENROUTER_MODEL,
      messages,
      tools,
    });
  }
}
```

### Tool Definitions
```typescript
export const realEstateTools = [
  {
    type: 'function',
    function: {
      name: 'calculate_comparables',
      description: 'Find comparable property sales',
      parameters: {
        type: 'object',
        properties: {
          address: { type: 'string' },
          radius: { type: 'number' },
        },
        required: ['address', 'radius'],
      },
    },
  },
  // More tools...
];
```

### Tool Execution
```typescript
export async function executeTools(toolCall) {
  const { name, arguments: args } = toolCall.function;
  
  switch (name) {
    case 'calculate_comparables':
      return await calculateComps(args);
    case 'get_school_ratings':
      return await getSchools(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

### Agent Classes
```typescript
export class RealEstateAgent {
  private client: OpenRouterClient;
  
  async analyzeProperty(listingData) {
    const messages = [
      { role: 'system', content: 'You are a real estate expert...' },
      { role: 'user', content: JSON.stringify(listingData) },
    ];
    
    return await this.client.chat(messages, realEstateTools);
  }
  
  async streamAnswerBuyerQuestion(question, context) {
    // Streaming implementation
  }
}
```

## External API Integrations

### MLS API
```typescript
export class MLSClient {
  async searchListings(criteria) {
    // Call MLS API
    // Transform response
    // Return listings
  }
  
  async getListingDetails(mlsId) {
    // Fetch single listing
  }
  
  async getComparables(address, radius) {
    // Search recent sales
  }
}
```

### Mapbox
```typescript
export class MapboxClient {
  async geocodeAddress(address) {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
      { params: { access_token: process.env.MAPBOX_ACCESS_TOKEN } }
    );
    
    const data = await response.json();
    return {
      lat: data.features[0].center[1],
      lng: data.features[0].center[0],
    };
  }
  
  getStaticMapUrl(lat, lng, zoom = 15) {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},${zoom}/600x400@2x?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
  }
}
```

### Data Enrichment
```typescript
export class DataEnrichment {
  async enrichListing(listing) {
    // Parallel API calls
    const [schools, walkScore, amenities, crime] = await Promise.all([
      this.schools.getSchoolsByZip(listing.zipCode),
      this.walkScore.getWalkScore(listing.address, listing.coordinates.lat, listing.coordinates.lng),
      this.amenities.getNearbyAmenities(listing.coordinates.lat, listing.coordinates.lng),
      this.crime.getCrimeStats(listing.coordinates.lat, listing.coordinates.lng),
    ]);
    
    return {
      schoolRatings: schools,
      walkScore: walkScore.walkScore,
      nearbyAmenities: amenities,
      crimeStats: crime,
      lastEnriched: Date.now(),
    };
  }
}
```

## Session Verification

### Buyer Auth
```typescript
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function verifyBuyerSession(sessionCode: string) {
  const session = await fetchQuery(api.buyerSessions.getBuyerSessionByCode, {
    sessionCode,
  });
  
  if (!session || !session.active) {
    return null;
  }
  
  return session;
}
```

### Seller Auth
```typescript
export async function verifySellerSession(sessionCode: string) {
  const session = await fetchQuery(api.sellerSessions.getSellerSessionByCode, {
    sessionCode,
  });
  
  if (!session || !session.active) {
    return null;
  }
  
  return session;
}
```

## Utility Functions

### Common Utilities
```typescript
// Format price
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
}

// Format date
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Generate unique code
export function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
```

### Class Name Utility (cn)
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Error Handling

### API Error Classes
```typescript
export class APIError extends Error {
  constructor(
    public service: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class RateLimitError extends APIError {
  constructor(service: string) {
    super(service, 429, `Rate limit exceeded for ${service}`);
    this.name = 'RateLimitError';
  }
}
```

### Retry Logic
```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Caching

### Simple Cache
```typescript
export class APICache {
  private cache: Map<string, { data: any; expires: number }>;
  
  constructor() {
    this.cache = new Map();
  }
  
  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  set(key: string, data: any, ttlSeconds: number = 3600) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }
}
```

## Best Practices

1. **Keep functions pure when possible**
2. **Use TypeScript for all exports**
3. **Add JSDoc comments for complex functions**
4. **Handle errors gracefully**
5. **Use environment variables for configuration**
6. **Cache expensive API calls**
7. **Implement retry logic for external APIs**
8. **Log errors appropriately**
9. **Write testable code**
10. **Keep files focused (single responsibility)**

## Testing

### Unit Testing
```typescript
// Example test
import { describe, it, expect } from 'vitest';
import { formatPrice } from './utils';

describe('formatPrice', () => {
  it('formats price correctly', () => {
    expect(formatPrice(150000)).toBe('$150,000');
  });
});
```

### Mocking External APIs
```typescript
// Use mock mode for development
const MLS_MOCK_MODE = process.env.NODE_ENV === 'development';

export class MLSClient {
  async searchListings(criteria) {
    if (MLS_MOCK_MODE) {
      return mockListings;
    }
    // Real API call
  }
}
```

## Environment Variables

Required variables for lib functions:
```bash
# OpenRouter
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
OPENROUTER_SITE_URL=
OPENROUTER_SITE_NAME=

# External APIs
MAPBOX_ACCESS_TOKEN=
MLS_API_KEY=
WALKSCORE_API_KEY=
GREATSCHOOLS_API_KEY=
```
