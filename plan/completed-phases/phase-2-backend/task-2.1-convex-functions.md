# Task 2.1: Convex Functions Development

**Phase:** 2 - Backend Infrastructure  
**Estimated Time:** 8-10 hours  
**Priority:** Critical  
**Dependencies:** Task 1.2 (Database Schema)

## Overview
Create all Convex backend functions for managing agents, listings, sessions, offers, and telemetry.

## Subtasks

### 2.1.1 Create Agent Management Functions

**File:** `convex/agents.ts`

- [ ] Create `createAgent` mutation:
  ```typescript
  export const createAgent = mutation({
    args: {
      userId: v.id("users"),
      agencyName: v.string(),
      licenseNumber: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      // Generate unique invite code
      // Create agent record
      // Return agentId and inviteCode
    },
  });
  ```

- [ ] Create `generateInviteCode` mutation:
  ```typescript
  export const generateInviteCode = mutation({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
      // Generate new unique code
      // Update agent record
      // Return new code
    },
  });
  ```

- [ ] Create `getAgentByInviteCode` query:
  ```typescript
  export const getAgentByInviteCode = query({
    args: { inviteCode: v.string() },
    handler: async (ctx, args) => {
      // Fetch agent by invite code
      // Return agent data or null
    },
  });
  ```

- [ ] Create `getAgentByUserId` query
- [ ] Create `updateAgentProfile` mutation
- [ ] Test all agent functions

### 2.1.2 Create Listing Management Functions

**File:** `convex/listings.ts`

- [ ] Create `createListing` mutation:
  ```typescript
  export const createListing = mutation({
    args: {
      agentId: v.id("agents"),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      price: v.number(),
      bedrooms: v.number(),
      bathrooms: v.number(),
      sqft: v.number(),
      propertyType: v.string(),
      description: v.string(),
      features: v.array(v.string()),
      images: v.array(v.string()),
      coordinates: v.object({ lat: v.number(), lng: v.number() }),
    },
    handler: async (ctx, args) => {
      // Validate agent exists
      // Create listing with timestamp
      // Return listingId
    },
  });
  ```

- [ ] Create `updateListing` mutation
- [ ] Create `deleteListing` mutation
- [ ] Create `getListingsByAgent` query:
  ```typescript
  export const getListingsByAgent = query({
    args: { agentId: v.id("agents"), status: v.optional(v.string()) },
    handler: async (ctx, args) => {
      // Query listings by agent
      // Filter by status if provided
      // Return sorted list
    },
  });
  ```

- [ ] Create `getListingById` query
- [ ] Create `searchListings` query with filters
- [ ] Create `updateListingStatus` mutation
- [ ] Test all listing functions

### 2.1.3 Create Data Enrichment Functions

**File:** `convex/enrichment.ts`

- [ ] Create `enrichListingData` action:
  ```typescript
  export const enrichListingData = action({
    args: { listingId: v.id("listings") },
    handler: async (ctx, args) => {
      // Fetch listing
      // Call external APIs (schools, walk score, etc.)
      // Update listing with enriched data
      // Return success status
    },
  });
  ```

- [ ] Create `getComparables` action
- [ ] Create `updateEnrichedData` mutation
- [ ] Test enrichment pipeline

### 2.1.4 Create Buyer Session Functions

**File:** `convex/buyerSessions.ts`

- [ ] Create `createBuyerSession` mutation:
  ```typescript
  export const createBuyerSession = mutation({
    args: {
      agentId: v.id("agents"),
      buyerName: v.string(),
      buyerEmail: v.string(),
      buyerPhone: v.optional(v.string()),
      preferences: v.object({
        minPrice: v.optional(v.number()),
        maxPrice: v.optional(v.number()),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        propertyTypes: v.array(v.string()),
        cities: v.array(v.string()),
        mustHaveFeatures: v.array(v.string()),
      }),
    },
    handler: async (ctx, args) => {
      // Generate unique session code
      // Create buyer session
      // Return sessionId and code
    },
  });
  ```

- [ ] Create `getBuyerSessionByCode` query
- [ ] Create `updateBuyerPreferences` mutation
- [ ] Create `getMatchingListings` query:
  ```typescript
  export const getMatchingListings = query({
    args: { sessionId: v.id("buyerSessions") },
    handler: async (ctx, args) => {
      // Get buyer preferences
      // Query listings matching criteria
      // Score and sort by relevance
      // Return ranked list
    },
  });
  ```

- [ ] Create `updateLastActive` mutation
- [ ] Test buyer session functions

### 2.1.5 Create Seller Session Functions

**File:** `convex/sellerSessions.ts`

- [ ] Create `createSellerSession` mutation
- [ ] Create `getSellerSessionByCode` query
- [ ] Create `getSellerAnalytics` query:
  ```typescript
  export const getSellerAnalytics = query({
    args: { sessionId: v.id("sellerSessions") },
    handler: async (ctx, args) => {
      // Get seller session and listing
      // Aggregate view data
      // Count offers
      // Calculate engagement metrics
      // Return analytics object
    },
  });
  ```

- [ ] Test seller session functions

### 2.1.6 Create Telemetry Functions

**File:** `convex/telemetry.ts`

- [ ] Create `trackPropertyView` mutation:
  ```typescript
  export const trackPropertyView = mutation({
    args: {
      listingId: v.id("listings"),
      buyerSessionId: v.optional(v.id("buyerSessions")),
      viewerType: v.string(),
      viewDuration: v.number(),
      imagesViewed: v.array(v.number()),
      videosWatched: v.array(v.number()),
      sectionsVisited: v.array(v.string()),
    },
    handler: async (ctx, args) => {
      // Create view record
      // Return viewId
    },
  });
  ```

- [ ] Create `getListingAnalytics` query:
  ```typescript
  export const getListingAnalytics = query({
    args: { 
      listingId: v.id("listings"),
      timeRange: v.optional(v.string())
    },
    handler: async (ctx, args) => {
      // Aggregate view data
      // Calculate metrics (total views, avg duration, etc.)
      // Group by time periods
      // Return analytics
    },
  });
  ```

- [ ] Create `getBuyerEngagement` query
- [ ] Test telemetry functions

### 2.1.7 Create Offer Management Functions

**File:** `convex/offers.ts`

- [ ] Create `createOffer` mutation:
  ```typescript
  export const createOffer = mutation({
    args: {
      listingId: v.id("listings"),
      buyerSessionId: v.id("buyerSessions"),
      offerAmount: v.number(),
      earnestMoney: v.number(),
      downPayment: v.number(),
      financingType: v.string(),
      contingencies: v.array(v.string()),
      closingDate: v.optional(v.string()),
      additionalTerms: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      // Validate listing and session
      // Create offer
      // Return offerId
    },
  });
  ```

- [ ] Create `updateOfferStatus` mutation
- [ ] Create `getOffersByListing` query
- [ ] Create `getOfferById` query
- [ ] Create `updateOfferAnalysis` mutation
- [ ] Test offer functions

### 2.1.8 Create AI Interaction Logging

**File:** `convex/agentInteractions.ts`

- [ ] Create `logInteraction` mutation:
  ```typescript
  export const logInteraction = mutation({
    args: {
      sessionType: v.string(),
      sessionId: v.string(),
      agentQuery: v.string(),
      agentResponse: v.string(),
      toolsUsed: v.array(v.string()),
      context: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
      // Create interaction log
      // Return logId
    },
  });
  ```

- [ ] Create `getInteractionHistory` query
- [ ] Test logging functions

### 2.1.9 Create Saved Search Functions

**File:** `convex/savedSearches.ts`

- [ ] Create `createSavedSearch` mutation
- [ ] Create `updateSavedSearch` mutation
- [ ] Create `deleteSavedSearch` mutation
- [ ] Create `getSavedSearches` query
- [ ] Create `runSavedSearch` query (execute search criteria)
- [ ] Test saved search functions

### 2.1.10 Create Utility Functions

**File:** `convex/utils.ts`

- [ ] Create unique code generator:
  ```typescript
  export function generateUniqueCode(length: number = 8): string {
    // Generate random alphanumeric code
    // Ensure uniqueness
  }
  ```

- [ ] Create date/time utilities
- [ ] Create validation helpers
- [ ] Create scoring algorithms (for matching)

## Acceptance Criteria
- [ ] All mutations compile and deploy
- [ ] All queries compile and deploy
- [ ] All actions compile and deploy
- [ ] Functions handle errors gracefully
- [ ] Type safety maintained throughout
- [ ] Functions documented with JSDoc comments

## Testing Checklist
- [ ] Test each function individually in Convex dashboard
- [ ] Verify indexes are being used (check query performance)
- [ ] Test edge cases (empty results, invalid IDs)
- [ ] Test concurrent operations
- [ ] Verify data consistency

## Next Steps
Proceed to Task 2.2: OpenRouter AI Service
