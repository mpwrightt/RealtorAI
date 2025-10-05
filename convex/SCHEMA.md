# Convex Database Schema

## Overview
This document describes the database schema for the Neighborhood Deal Finder application.

## Tables

### Core Tables

#### `users`
Synced from Clerk authentication service.
- `name`: User's display name
- `externalId`: Clerk user ID
- **Indexes**: `byExternalId`

#### `agents`
Real estate agent profiles.
- `userId`: Reference to `users` table (Clerk synced user)
- `agencyName`: Name of the real estate agency
- `licenseNumber`: Real estate license number
- `inviteCode`: Unique code for agent invitations
- `phone`: Contact phone number (optional)
- `email`: Contact email
- `bio`: Agent biography (optional)
- `profileImage`: Profile image URL (optional)
- `active`: Whether the agent is active
- `createdAt`: Timestamp of creation
- **Indexes**: `byInviteCode`, `byUserId`, `byActive`
- **Relationships**: One-to-one with `users`

#### `listings`
Property listings managed by agents.
- `agentId`: Reference to `agents` table
- `mlsId`: MLS listing ID (optional)
- `address`: Street address
- `city`: City name
- `state`: State code
- `zipCode`: ZIP code
- `price`: Listing price
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `sqft`: Square footage
- `lotSize`: Lot size in acres (optional)
- `yearBuilt`: Year property was built (optional)
- `propertyType`: Type (single-family, condo, townhouse, etc.)
- `status`: Listing status (active, pending, sold, withdrawn)
- `description`: Property description
- `features`: Array of property features
- `images`: Array of image URLs
- `videos`: Array of video URLs
- `virtualTourUrl`: Virtual tour URL (optional)
- `coordinates`: { lat, lng } object for map display
- `enrichedData`: AI-enriched property data (optional)
  - `schoolRatings`: School rating information
  - `walkScore`: Walk score (0-100)
  - `crimeStats`: Crime statistics for the area
  - `nearbyAmenities`: Array of nearby amenities
  - `comps`: Array of comparable properties
  - `lastEnriched`: Timestamp of last enrichment
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update
- **Indexes**: `byAgentId`, `byStatus`, `byMlsId`, `byCity`, `byPrice`
- **Relationships**: Many-to-one with `agents`

### Session Management

#### `buyerSessions`
Buyer portal access sessions (no login required).
- `agentId`: Reference to `agents` table
- `buyerName`: Buyer's name
- `buyerEmail`: Buyer's email
- `buyerPhone`: Buyer's phone (optional)
- `sessionCode`: Unique session access code
- `preferences`: Buyer preferences object
  - `minPrice`: Minimum price filter (optional)
  - `maxPrice`: Maximum price filter (optional)
  - `bedrooms`: Bedroom count filter (optional)
  - `bathrooms`: Bathroom count filter (optional)
  - `propertyTypes`: Array of preferred property types
  - `cities`: Array of preferred cities
  - `mustHaveFeatures`: Array of required features
- `active`: Whether session is active
- `createdAt`: Timestamp of creation
- `lastActive`: Timestamp of last activity
- **Indexes**: `bySessionCode`, `byAgentId`, `byActive`
- **Relationships**: Many-to-one with `agents`

#### `sellerSessions`
Seller portal access sessions.
- `agentId`: Reference to `agents` table
- `listingId`: Reference to `listings` table
- `sellerName`: Seller's name
- `sellerEmail`: Seller's email
- `sellerPhone`: Seller's phone (optional)
- `sessionCode`: Unique session access code
- `active`: Whether session is active
- `createdAt`: Timestamp of creation
- `lastActive`: Timestamp of last activity
- **Indexes**: `bySessionCode`, `byListingId`, `byAgentId`
- **Relationships**: Many-to-one with `agents`, one-to-one with `listings`

### Transaction Tables

#### `offers`
Purchase offers from buyers.
- `listingId`: Reference to `listings` table
- `buyerSessionId`: Reference to `buyerSessions` table
- `offerAmount`: Offer price
- `earnestMoney`: Earnest money deposit amount
- `downPayment`: Down payment amount
- `financingType`: Type of financing (cash, conventional, fha, va)
- `contingencies`: Array of contingency strings
- `inspectionPeriod`: Inspection period in days (optional)
- `closingDate`: Preferred closing date (optional)
- `additionalTerms`: Additional offer terms (optional)
- `status`: Offer status (pending, accepted, rejected, countered, withdrawn)
- `aiAnalysis`: AI-generated offer analysis (optional)
  - `marketComparison`: Market comparison analysis
  - `strengths`: Array of offer strengths
  - `risks`: Array of potential risks
  - `recommendation`: AI recommendation
  - `confidence`: Confidence score (0-1)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update
- **Indexes**: `byListingId`, `byBuyerSessionId`, `byStatus`
- **Relationships**: Many-to-one with `listings` and `buyerSessions`

### Analytics Tables

#### `propertyViews`
Property viewing analytics and telemetry.
- `listingId`: Reference to `listings` table
- `buyerSessionId`: Reference to `buyerSessions` table (optional)
- `viewerType`: Type of viewer (buyer, anonymous, agent)
- `viewDuration`: Time spent viewing in seconds
- `imagesViewed`: Array of viewed image indices
- `videosWatched`: Array of watched video indices
- `sectionsVisited`: Array of visited section names
- `timestamp`: Timestamp of view
- **Indexes**: `byListingId`, `byBuyerSessionId`, `byTimestamp`
- **Relationships**: Many-to-one with `listings`, optional many-to-one with `buyerSessions`

#### `agentInteractions`
AI agent conversation logs for transparency.
- `sessionType`: Type of session (buyer, seller, agent)
- `sessionId`: Session identifier
- `agentQuery`: User's query to AI
- `agentResponse`: AI's response
- `toolsUsed`: Array of tools/functions called by AI
- `context`: Additional context data (optional)
- `timestamp`: Timestamp of interaction
- **Indexes**: `bySessionId`, `bySessionType`, `byTimestamp`

### Saved Data

#### `savedSearches`
Saved property searches for buyers.
- `buyerSessionId`: Reference to `buyerSessions` table
- `searchName`: Name of saved search
- `criteria`: Search criteria object
  - `minPrice`: Minimum price (optional)
  - `maxPrice`: Maximum price (optional)
  - `bedrooms`: Bedroom count (optional)
  - `bathrooms`: Bathroom count (optional)
  - `cities`: Array of cities
  - `features`: Array of required features
- `notificationsEnabled`: Whether to send notifications
- `createdAt`: Timestamp of creation
- `lastRun`: Timestamp of last search run (optional)
- **Indexes**: `byBuyerSessionId`
- **Relationships**: Many-to-one with `buyerSessions`

## Relationships Diagram

```
users (Clerk synced)
  └─→ agents (1:1)
       ├─→ listings (1:many)
       │    ├─→ offers (1:many)
       │    ├─→ propertyViews (1:many)
       │    └─→ sellerSessions (1:1)
       └─→ buyerSessions (1:many)
            ├─→ offers (1:many)
            ├─→ savedSearches (1:many)
            └─→ propertyViews (1:many)
```

## Data Types

- **IDs**: Generated by Convex, use `v.id("tableName")`
- **Timestamps**: Unix timestamps in milliseconds (number)
- **Strings**: UTF-8 text
- **Numbers**: IEEE 754 double precision floats
- **Booleans**: true/false
- **Arrays**: Ordered lists
- **Objects**: Key-value maps
- **Optional**: Fields that may be undefined

## Query Patterns

### Common Queries

1. **Get agent by Clerk user ID**
   ```typescript
   ctx.db.query("agents").withIndex("byUserId", q => q.eq("userId", userId)).unique()
   ```

2. **Get active listings for agent**
   ```typescript
   ctx.db.query("listings")
     .withIndex("byAgentId", q => q.eq("agentId", agentId))
     .filter(q => q.eq(q.field("status"), "active"))
   ```

3. **Get buyer session by code**
   ```typescript
   ctx.db.query("buyerSessions")
     .withIndex("bySessionCode", q => q.eq("sessionCode", code))
     .unique()
   ```

4. **Get offers for listing**
   ```typescript
   ctx.db.query("offers")
     .withIndex("byListingId", q => q.eq("listingId", listingId))
   ```

5. **Get property views for listing**
   ```typescript
   ctx.db.query("propertyViews")
     .withIndex("byListingId", q => q.eq("listingId", listingId))
   ```

## Migration Notes

- Schema changes are applied automatically by Convex
- Existing data is preserved during schema updates
- New optional fields default to `undefined`
- Indexes are built asynchronously
- Breaking changes require data migration scripts

## Security Considerations

- Agent data is protected by Clerk authentication
- Buyer/seller sessions use unique, unguessable codes
- Session codes should be at least 16 characters (UUID recommended)
- Sensitive data (SSN, financial details) should never be stored
- All timestamps use server time to prevent client manipulation
