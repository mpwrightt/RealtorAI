# Phase 17: AI-Powered Listing Creator

## Overview
Revolutionize the listing creation experience by leveraging AI to automatically extract property details from photos and addresses, reducing manual data entry from minutes to seconds.

## Goals
- Reduce listing creation time by 80%
- Minimize manual data entry errors
- Provide intelligent defaults based on AI analysis
- Create compelling, AI-generated property descriptions
- Maintain accuracy with human review/editing capability

## Technical Stack
- **Image Analysis:** Google AI Studio (Gemini API)
- **Address Lookup:** Google Places API + Geocoding
- **Content Generation:** OpenRouter (existing)
- **File Storage:** Convex Storage (existing)
- **Form State:** React Hook Form with auto-save

## User Flow

### Step 1: Quick Input
Agent provides minimal information:
- Property address (with autocomplete)
- Photos (drag & drop, multiple upload)
- Listing price

### Step 2: AI Processing
System automatically:
- Validates and enriches address data
- Analyzes photos with Gemini Vision
- Detects property features and room types
- Generates property description
- Orders photos intelligently

### Step 3: Review & Publish
Agent reviews AI-generated data:
- Edit any auto-filled fields
- Add/remove detected features
- Refine AI description
- Reorder photos if needed
- One-click publish

## Tasks

### Task 01: Google AI Studio Integration
**File:** `convex/gemini.ts`
- [ ] Set up Google AI Studio API client
- [ ] Create image analysis action
- [ ] Implement feature detection from photos
- [ ] Detect room types (bedroom, kitchen, bathroom, etc.)
- [ ] Extract visible features (granite, hardwood, pool, etc.)
- [ ] Rate photo quality and suggest cover photo
- [ ] Handle multi-image batch analysis
- [ ] Error handling and fallbacks

**Environment:**
```bash
GOOGLE_AI_STUDIO_API_KEY=your_api_key_here
GOOGLE_AI_MODEL=gemini-1.5-pro-latest
```

### Task 02: Address Lookup Integration
**File:** `lib/google-places/client.ts`
- [ ] Set up Google Places API client
- [ ] Implement address autocomplete
- [ ] Geocoding for lat/lng
- [ ] Fetch nearby amenities
- [ ] Get property type suggestions
- [ ] Error handling for invalid addresses

**Environment:**
```bash
GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Task 03: Smart Listing Form UI
**File:** `app/dashboard/listings/new/page.tsx`
- [ ] Create multi-step wizard layout
- [ ] Step 1: Address input with autocomplete
- [ ] Step 1: Bulk photo upload with drag-and-drop
- [ ] Step 1: Price input
- [ ] Loading state with progress indicators
- [ ] Auto-save draft functionality
- [ ] Error states and validation

**Components:**
- `components/dashboard/listing-creator/address-input.tsx`
- `components/dashboard/listing-creator/photo-uploader.tsx`
- `components/dashboard/listing-creator/processing-loader.tsx`

### Task 04: AI Analysis Orchestrator
**File:** `convex/listingAnalysis.ts`
- [ ] Create orchestration action that coordinates:
  - Address validation and enrichment
  - Photo upload to Convex storage
  - Gemini image analysis
  - Feature aggregation from all photos
  - Description generation
  - Photo ordering logic
- [ ] Store analysis results in draft
- [ ] Handle partial failures gracefully

### Task 05: Review & Edit Interface
**File:** `app/dashboard/listings/new/review/page.tsx`
- [ ] Display all AI-generated fields
- [ ] Inline editing for all fields
- [ ] Feature checklist (AI-detected + manual)
- [ ] AI description editor with regenerate option
- [ ] Photo gallery with drag-to-reorder
- [ ] Photo categorization display
- [ ] Live preview pane
- [ ] Validation before publish

**Components:**
- `components/dashboard/listing-creator/editable-field.tsx`
- `components/dashboard/listing-creator/feature-selector.tsx`
- `components/dashboard/listing-creator/description-editor.tsx`
- `components/dashboard/listing-creator/photo-gallery-editor.tsx`

### Task 06: AI Description Generator
**File:** `convex/listingDescription.ts`
- [ ] Create action using OpenRouter
- [ ] Generate from property details
- [ ] Incorporate detected features
- [ ] Use neighborhood data
- [ ] Multiple tone options (professional, warm, luxury)
- [ ] Regenerate functionality
- [ ] Highlight key features intelligently

### Task 07: Draft System
**File:** `convex/listingDrafts.ts`
- [ ] Schema for listing drafts
- [ ] Auto-save every 30 seconds
- [ ] Store AI analysis results
- [ ] Resume from draft
- [ ] Draft list view
- [ ] Delete draft functionality

**Schema Addition:**
```typescript
listingDrafts: defineTable({
  agentId: v.id("agents"),
  address: v.optional(v.string()),
  price: v.optional(v.number()),
  photos: v.array(v.id("_storage")),
  aiAnalysis: v.optional(v.object({
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    features: v.array(v.string()),
    photoCategories: v.object({}), // photoId -> category
    suggestedCoverPhoto: v.optional(v.id("_storage")),
    description: v.optional(v.string()),
  })),
  manualOverrides: v.optional(v.object({})),
  lastSaved: v.number(),
  createdAt: v.number(),
})
```

### Task 08: Photo Analysis Details
**Gemini Prompt Structure:**
```
Analyze this real estate property photo and provide:
1. Room type (bedroom, kitchen, bathroom, living-room, dining-room, exterior, other)
2. Features visible in photo (granite-countertops, hardwood-floors, stainless-appliances, 
   fireplace, crown-molding, high-ceilings, updated-fixtures, pool, deck, etc.)
3. Photo quality score (1-10)
4. Suggested use (cover-photo, gallery, skip)
5. Condition indicators (excellent, good, fair, poor)

Return JSON format.
```

### Task 09: Testing & Refinement
- [ ] Test with various property types
- [ ] Test with different photo qualities
- [ ] Test address lookup in multiple cities
- [ ] Test AI accuracy on feature detection
- [ ] Test draft save/resume functionality
- [ ] Performance optimization for multiple photos
- [ ] Error handling for API failures

### Task 10: Migration Path
- [ ] Keep existing manual form as fallback
- [ ] Add "Use AI Assistant" toggle
- [ ] Provide "Start from scratch" option
- [ ] Update listings table with draft indicators
- [ ] Add analytics to track AI usage

## Database Schema Changes

```typescript
// Add to schema.ts
listings: defineTable({
  // ... existing fields ...
  
  // New AI-related fields
  aiGenerated: v.optional(v.boolean()),
  aiAnalysis: v.optional(v.object({
    detectedFeatures: v.array(v.string()),
    confidence: v.number(),
    photosAnalyzed: v.number(),
    analysisDate: v.number(),
  })),
  photoMetadata: v.optional(v.array(v.object({
    storageId: v.id("_storage"),
    category: v.string(), // bedroom, kitchen, etc.
    qualityScore: v.number(),
    order: v.number(),
  }))),
})
```

## API Integrations

### Google AI Studio (Gemini)
- **Purpose:** Image analysis and feature detection
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent`
- **Cost:** ~$0.001 per image
- **Rate Limits:** 60 requests/minute

### Google Places API
- **Purpose:** Address autocomplete and validation
- **Endpoints:** 
  - Place Autocomplete
  - Place Details
  - Geocoding
- **Cost:** ~$0.017 per autocomplete session
- **Rate Limits:** Per billing account

## Success Metrics
- **Time to Create Listing:** < 2 minutes (vs 10-15 minutes manual)
- **AI Accuracy:** > 90% for basic features (beds/baths)
- **AI Accuracy:** > 75% for detailed features
- **Agent Satisfaction:** > 4.5/5 stars
- **Adoption Rate:** > 80% of new listings use AI
- **Edit Rate:** < 30% of AI suggestions need changes

## Future Enhancements
- Voice input for address and price
- Bulk import from MLS CSV
- 360° photo support
- Video analysis for virtual tours
- Auto-generate social media posts
- Price suggestion based on comps
- Scheduled listing activation

## Dependencies
- Phase 2: Backend Setup (OpenRouter integration) ✅
- Phase 16: Dashboard Detail Pages ✅
- Convex file storage ✅

## Estimated Timeline
- Task 01-02: 2 days (API integrations)
- Task 03: 1 day (form UI)
- Task 04: 2 days (orchestration)
- Task 05: 2 days (review interface)
- Task 06: 1 day (description generator)
- Task 07: 1 day (draft system)
- Task 08-09: 2 days (testing)
- Task 10: 1 day (migration)

**Total: ~12 days**

## Notes
- Start with single-photo analysis, then batch
- Prioritize accuracy over speed initially
- Provide clear feedback when AI is uncertain
- Allow manual override of all AI suggestions
- Track AI performance metrics for improvement
