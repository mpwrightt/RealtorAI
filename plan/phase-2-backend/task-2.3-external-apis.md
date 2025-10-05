# Task 2.3: External API Integrations

**Phase:** 2 - Backend Infrastructure  
**Estimated Time:** 6-8 hours  
**Priority:** High  
**Dependencies:** Task 1.1 (Environment Setup)

## Overview
Integrate external APIs for MLS data, geocoding, maps, school ratings, walk scores, and other data enrichment services.

## Subtasks

### 2.3.1 Create MLS API Integration

**File:** `lib/integrations/mls.ts`

- [ ] Create MLS client:
  ```typescript
  export class MLSClient {
    private apiKey: string;
    private baseUrl: string;
    
    constructor() {
      this.apiKey = process.env.MLS_API_KEY || '';
      this.baseUrl = process.env.MLS_API_URL || '';
    }
    
    async searchListings(criteria: {
      city?: string;
      minPrice?: number;
      maxPrice?: number;
      bedrooms?: number;
      propertyType?: string;
    }) {
      // Call MLS API
      // Transform response to our format
      // Return listings
    }
    
    async getListingDetails(mlsId: string) {
      // Fetch single listing
      // Return detailed data
    }
    
    async getComparables(address: string, radius: number) {
      // Search recent sales near address
      // Return comparable properties
    }
  }
  ```

- [ ] Add error handling and retries
- [ ] Add rate limiting
- [ ] Test with sample queries
- [ ] Create mock mode for development

### 2.3.2 Create Mapbox Integration

**File:** `lib/integrations/mapbox.ts`

- [ ] Create Mapbox client:
  ```typescript
  import axios from 'axios';
  
  export class MapboxClient {
    private accessToken: string;
    
    constructor() {
      this.accessToken = process.env.MAPBOX_ACCESS_TOKEN || '';
    }
    
    async geocodeAddress(address: string) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          limit: 1,
        },
      });
      
      const feature = response.data.features[0];
      return {
        lat: feature.center[1],
        lng: feature.center[0],
        fullAddress: feature.place_name,
      };
    }
    
    async reverseGeocode(lat: number, lng: number) {
      // Convert coordinates to address
    }
    
    getStaticMapUrl(lat: number, lng: number, zoom: number = 15) {
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/600x400@2x?access_token=${this.accessToken}`;
    }
    
    async calculateDistance(coord1: [number, number], coord2: [number, number]) {
      // Use Mapbox Directions API
      // Return distance in miles
    }
  }
  ```

- [ ] Test geocoding
- [ ] Test static map generation
- [ ] Test distance calculation

### 2.3.3 Create School Ratings Integration

**File:** `lib/integrations/schools.ts`

- [ ] Create schools client:
  ```typescript
  export class SchoolsClient {
    private apiKey: string;
    
    constructor() {
      this.apiKey = process.env.GREATSCHOOLS_API_KEY || '';
    }
    
    async getSchoolsByZip(zipCode: string) {
      // Mock implementation or real API
      return {
        elementary: [
          {
            name: 'Sample Elementary',
            rating: 8,
            distance: 0.5,
            type: 'public',
          },
        ],
        middle: [],
        high: [],
      };
    }
    
    async getSchoolDetails(schoolId: string) {
      // Get detailed school info
    }
  }
  ```

- [ ] Add caching for school data
- [ ] Test with sample zip codes

### 2.3.4 Create Walk Score Integration

**File:** `lib/integrations/walkscore.ts`

- [ ] Create walk score client:
  ```typescript
  export class WalkScoreClient {
    private apiKey: string;
    
    constructor() {
      this.apiKey = process.env.WALKSCORE_API_KEY || '';
    }
    
    async getWalkScore(address: string, lat: number, lng: number) {
      // If no API key, return mock data
      if (!this.apiKey) {
        return {
          walkScore: Math.floor(Math.random() * 100),
          description: 'Car-Dependent',
          transitScore: Math.floor(Math.random() * 100),
          bikeScore: Math.floor(Math.random() * 100),
        };
      }
      
      // Call Walk Score API
      // Return scores
    }
  }
  ```

- [ ] Test with sample addresses

### 2.3.5 Create Nearby Amenities Search

**File:** `lib/integrations/amenities.ts`

- [ ] Create amenities client using Mapbox POI:
  ```typescript
  export class AmenitiesClient {
    private mapbox: MapboxClient;
    
    constructor() {
      this.mapbox = new MapboxClient();
    }
    
    async getNearbyAmenities(lat: number, lng: number, radius: number = 1) {
      // Search for POIs: grocery, restaurants, parks, etc.
      const categories = [
        'grocery',
        'restaurant',
        'park',
        'hospital',
        'pharmacy',
        'school',
      ];
      
      const amenities = [];
      
      for (const category of categories) {
        // Query Mapbox for each category
        // Add to amenities array
      }
      
      return amenities;
    }
  }
  ```

- [ ] Test nearby search

### 2.3.6 Create Crime Data Integration

**File:** `lib/integrations/crime.ts`

- [ ] Create crime data client:
  ```typescript
  export class CrimeDataClient {
    async getCrimeStats(lat: number, lng: number) {
      // Mock implementation (real APIs like SpotCrime are limited)
      return {
        crimeIndex: Math.floor(Math.random() * 100),
        safetScore: Math.floor(Math.random() * 100),
        recentIncidents: Math.floor(Math.random() * 50),
        trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)],
      };
    }
  }
  ```

- [ ] Document data source limitations

### 2.3.7 Create Data Enrichment Orchestrator

**File:** `lib/integrations/enrichment.ts`

- [ ] Create orchestrator:
  ```typescript
  import { MapboxClient } from './mapbox';
  import { SchoolsClient } from './schools';
  import { WalkScoreClient } from './walkscore';
  import { AmenitiesClient } from './amenities';
  import { CrimeDataClient } from './crime';
  import { MLSClient } from './mls';
  
  export class DataEnrichment {
    private mapbox: MapboxClient;
    private schools: SchoolsClient;
    private walkScore: WalkScoreClient;
    private amenities: AmenitiesClient;
    private crime: CrimeDataClient;
    private mls: MLSClient;
    
    constructor() {
      this.mapbox = new MapboxClient();
      this.schools = new SchoolsClient();
      this.walkScore = new WalkScoreClient();
      this.amenities = new AmenitiesClient();
      this.crime = new CrimeDataClient();
      this.mls = new MLSClient();
    }
    
    async enrichListing(listing: any) {
      const { address, city, state, zipCode, coordinates } = listing;
      
      // Parallel API calls
      const [schools, walkScore, amenities, crime, comps] = await Promise.all([
        this.schools.getSchoolsByZip(zipCode),
        this.walkScore.getWalkScore(
          `${address}, ${city}, ${state}`,
          coordinates.lat,
          coordinates.lng
        ),
        this.amenities.getNearbyAmenities(coordinates.lat, coordinates.lng),
        this.crime.getCrimeStats(coordinates.lat, coordinates.lng),
        this.mls.getComparables(address, 0.5),
      ]);
      
      return {
        schoolRatings: schools,
        walkScore: walkScore.walkScore,
        nearbyAmenities: amenities,
        crimeStats: crime,
        comps: comps,
        lastEnriched: Date.now(),
      };
    }
  }
  ```

- [ ] Test full enrichment pipeline

### 2.3.8 Create Convex Action for Enrichment

**File:** `convex/enrichment.ts`

- [ ] Create enrichment action:
  ```typescript
  import { action } from "./_generated/server";
  import { v } from "convex/values";
  
  export const enrichListingData = action({
    args: { listingId: v.id("listings") },
    handler: async (ctx, args) => {
      // Get listing from DB
      const listing = await ctx.runQuery(api.listings.getListingById, {
        id: args.listingId,
      });
      
      if (!listing) throw new Error("Listing not found");
      
      // Call enrichment service (Node.js environment)
      const { DataEnrichment } = await import("../lib/integrations/enrichment");
      const enrichment = new DataEnrichment();
      
      const enrichedData = await enrichment.enrichListing(listing);
      
      // Update listing with enriched data
      await ctx.runMutation(api.listings.updateListing, {
        id: args.listingId,
        enrichedData,
      });
      
      return { success: true };
    },
  });
  ```

- [ ] Test action from Convex dashboard

### 2.3.9 Create Caching Layer

**File:** `lib/integrations/cache.ts`

- [ ] Create simple cache:
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
  
  export const apiCache = new APICache();
  ```

- [ ] Integrate cache into API clients
- [ ] Test cache hit/miss scenarios

### 2.3.10 Create API Error Handling

**File:** `lib/integrations/errors.ts`

- [ ] Create error classes:
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
  
  export class APIKeyError extends APIError {
    constructor(service: string) {
      super(service, 401, `Invalid API key for ${service}`);
      this.name = 'APIKeyError';
    }
  }
  ```

- [ ] Add retry logic with exponential backoff
- [ ] Test error scenarios

## Acceptance Criteria
- [ ] All API clients implemented
- [ ] Error handling in place
- [ ] Caching implemented
- [ ] Mock modes work for development
- [ ] Rate limiting respected
- [ ] Enrichment pipeline functional
- [ ] Tests pass

## Testing Checklist
- [ ] Test each API individually
- [ ] Test with invalid credentials
- [ ] Test rate limiting behavior
- [ ] Test cache effectiveness
- [ ] Test full enrichment pipeline
- [ ] Verify data format consistency

## Documentation
- [ ] Document API requirements
- [ ] Document rate limits
- [ ] Document caching strategy
- [ ] Document mock data structure

## Next Steps
Proceed to Phase 3: Frontend - Buyer Portal
