# Task 1.2: Database Schema Extension

**Phase:** 1 - Foundation & Setup  
**Estimated Time:** 3-4 hours  
**Priority:** Critical  
**Dependencies:** Task 1.1 (Environment Setup)

## Overview
Extend the existing Convex schema to support real estate agents, listings, buyer/seller sessions, offers, and analytics.

## Subtasks

### 1.2.1 Create Agent Schema

**File:** `convex/schema.ts`

- [ ] Add agents table definition:
  ```typescript
  agents: defineTable({
    userId: v.id("users"),
    agencyName: v.string(),
    licenseNumber: v.string(),
    inviteCode: v.string(),
    phone: v.optional(v.string()),
    email: v.string(),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("byInviteCode", ["inviteCode"])
    .index("byUserId", ["userId"])
    .index("byActive", ["active"]),
  ```

- [ ] Verify table compiles without errors

### 1.2.2 Create Listings Schema

- [ ] Add listings table definition:
  ```typescript
  listings: defineTable({
    agentId: v.id("agents"),
    mlsId: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    sqft: v.number(),
    lotSize: v.optional(v.number()),
    yearBuilt: v.optional(v.number()),
    propertyType: v.string(), // "single-family", "condo", "townhouse", etc.
    status: v.string(), // "active", "pending", "sold", "withdrawn"
    description: v.string(),
    features: v.array(v.string()),
    images: v.array(v.string()),
    videos: v.array(v.string()),
    virtualTourUrl: v.optional(v.string()),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    enrichedData: v.optional(v.object({
      schoolRatings: v.any(),
      walkScore: v.optional(v.number()),
      crimeStats: v.any(),
      nearbyAmenities: v.array(v.any()),
      comps: v.array(v.any()),
      lastEnriched: v.optional(v.number()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byAgentId", ["agentId"])
    .index("byStatus", ["status"])
    .index("byMlsId", ["mlsId"])
    .index("byCity", ["city"])
    .index("byPrice", ["price"]),
  ```

### 1.2.3 Create Buyer Sessions Schema

- [ ] Add buyerSessions table:
  ```typescript
  buyerSessions: defineTable({
    agentId: v.id("agents"),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.optional(v.string()),
    sessionCode: v.string(),
    preferences: v.object({
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      propertyTypes: v.array(v.string()),
      cities: v.array(v.string()),
      mustHaveFeatures: v.array(v.string()),
    }),
    active: v.boolean(),
    createdAt: v.number(),
    lastActive: v.number(),
  })
    .index("bySessionCode", ["sessionCode"])
    .index("byAgentId", ["agentId"])
    .index("byActive", ["active"]),
  ```

### 1.2.4 Create Seller Sessions Schema

- [ ] Add sellerSessions table:
  ```typescript
  sellerSessions: defineTable({
    agentId: v.id("agents"),
    listingId: v.id("listings"),
    sellerName: v.string(),
    sellerEmail: v.string(),
    sellerPhone: v.optional(v.string()),
    sessionCode: v.string(),
    active: v.boolean(),
    createdAt: v.number(),
    lastActive: v.number(),
  })
    .index("bySessionCode", ["sessionCode"])
    .index("byListingId", ["listingId"])
    .index("byAgentId", ["agentId"]),
  ```

### 1.2.5 Create Property Views Telemetry Schema

- [ ] Add propertyViews table:
  ```typescript
  propertyViews: defineTable({
    listingId: v.id("listings"),
    buyerSessionId: v.optional(v.id("buyerSessions")),
    viewerType: v.string(), // "buyer", "anonymous", "agent"
    viewDuration: v.number(),
    imagesViewed: v.array(v.number()),
    videosWatched: v.array(v.number()),
    sectionsVisited: v.array(v.string()),
    timestamp: v.number(),
  })
    .index("byListingId", ["listingId"])
    .index("byBuyerSessionId", ["buyerSessionId"])
    .index("byTimestamp", ["timestamp"]),
  ```

### 1.2.6 Create Offers Schema

- [ ] Add offers table:
  ```typescript
  offers: defineTable({
    listingId: v.id("listings"),
    buyerSessionId: v.id("buyerSessions"),
    offerAmount: v.number(),
    earnestMoney: v.number(),
    downPayment: v.number(),
    financingType: v.string(), // "cash", "conventional", "fha", "va"
    contingencies: v.array(v.string()),
    inspectionPeriod: v.optional(v.number()),
    closingDate: v.optional(v.string()),
    additionalTerms: v.optional(v.string()),
    status: v.string(), // "pending", "accepted", "rejected", "countered", "withdrawn"
    aiAnalysis: v.optional(v.object({
      marketComparison: v.string(),
      strengths: v.array(v.string()),
      risks: v.array(v.string()),
      recommendation: v.string(),
      confidence: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byListingId", ["listingId"])
    .index("byBuyerSessionId", ["buyerSessionId"])
    .index("byStatus", ["status"]),
  ```

### 1.2.7 Create AI Interactions Schema

- [ ] Add agentInteractions table:
  ```typescript
  agentInteractions: defineTable({
    sessionType: v.string(), // "buyer", "seller", "agent"
    sessionId: v.string(),
    agentQuery: v.string(),
    agentResponse: v.string(),
    toolsUsed: v.array(v.string()),
    context: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("bySessionId", ["sessionId"])
    .index("bySessionType", ["sessionType"])
    .index("byTimestamp", ["timestamp"]),
  ```

### 1.2.8 Create Saved Searches Schema

- [ ] Add savedSearches table:
  ```typescript
  savedSearches: defineTable({
    buyerSessionId: v.id("buyerSessions"),
    searchName: v.string(),
    criteria: v.object({
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      cities: v.array(v.string()),
      features: v.array(v.string()),
    }),
    notificationsEnabled: v.boolean(),
    createdAt: v.number(),
    lastRun: v.optional(v.number()),
  })
    .index("byBuyerSessionId", ["buyerSessionId"]),
  ```

### 1.2.9 Test Schema Deployment

- [ ] Save `convex/schema.ts` file
- [ ] Watch Convex console for schema deployment:
  ```bash
  # In terminal where convex dev is running
  # Look for: "Schema updated successfully"
  ```
- [ ] Verify no deployment errors
- [ ] Check Convex dashboard to confirm all tables appear

### 1.2.10 Create Schema Validation Tests

**File:** `convex/tests/schema-validation.ts`

- [ ] Create test file:
  ```typescript
  import { Id } from "./_generated/dataModel";
  
  // Type validation tests
  export type AgentId = Id<"agents">;
  export type ListingId = Id<"listings">;
  export type BuyerSessionId = Id<"buyerSessions">;
  export type SellerSessionId = Id<"sellerSessions">;
  export type OfferId = Id<"offers">;
  
  // Ensure types compile correctly
  const testIds: {
    agent: AgentId;
    listing: ListingId;
    buyer: BuyerSessionId;
    seller: SellerSessionId;
    offer: OfferId;
  } = {} as any;
  ```

- [ ] Verify TypeScript compilation succeeds

## Acceptance Criteria
- [ ] All tables defined in schema
- [ ] All indexes created properly
- [ ] Schema deploys without errors
- [ ] Tables visible in Convex dashboard
- [ ] TypeScript types generate correctly
- [ ] No TypeScript compilation errors

## Validation Checklist
- [ ] Each table has appropriate indexes for query patterns
- [ ] Foreign key relationships use `v.id()` correctly
- [ ] Optional fields marked with `v.optional()`
- [ ] Timestamps use `v.number()` (Unix timestamps)
- [ ] Arrays use `v.array()` syntax
- [ ] Objects use `v.object()` with defined properties

## Documentation

**Create schema documentation:**
- [ ] Create `convex/SCHEMA.md` documenting:
  - Table purposes
  - Relationships between tables
  - Index usage
  - Data types and constraints

## Next Steps
Proceed to Phase 2: Backend Infrastructure
