# Phase 7: Buyer Journey Completion (Solo Agent Focus)

**Priority:** HIGH  
**Timeline:** 2-3 weeks  
**Dependencies:** Phase 1-6 (completed)

## 🎯 For Solo Agents
These features enable **buyers to do more themselves**, reducing agent workload by 50%+ while providing a premium experience. Perfect for agents handling 5-20 transactions per year.

## Overview
Complete the core buyer experience by adding property comparison, favorites, offer management, alerts, and tour scheduling. These features enable buyers to fully evaluate properties and make informed decisions **without constant agent hand-holding**.

## Goals (Solo Agent Benefits)
- ✅ **Reduce agent time per buyer by 5+ hours** (comparison, favorites automation)
- ✅ **Buyers self-qualify properties** (less tire-kickers)
- ✅ **Automated offer workflow** (no manual paperwork)
- ✅ **24/7 buyer engagement** (alerts work while you sleep)
- ✅ **Self-service tour requests** (no phone tag)

## Features

### 1. Property Comparison View
**File:** `1-property-comparison.md`  
**Priority:** Critical  
**Effort:** Medium (3-4 days)

Compare 2-4 selected properties with visual charts and AI analysis.

### 2. Save/Favorite Properties
**File:** `2-favorite-properties.md`  
**Priority:** Critical  
**Effort:** Small (2-3 days)

Persistent property bookmarking with dedicated favorites page.

### 3. Offer Management Dashboard
**File:** `3-offer-management.md`  
**Priority:** Critical  
**Effort:** Large (5-6 days)

Complete offer submission, tracking, and status management.

### 4. Property Alerts
**File:** `4-property-alerts.md`  
**Priority:** High  
**Effort:** Medium (3-4 days)

Automated notifications when new properties match saved criteria.

### 5. Tour Scheduling
**File:** `5-tour-scheduling.md`  
**Priority:** High  
**Effort:** Medium (3-4 days)

Request and manage property tour appointments.

## Database Changes

### New Tables
```typescript
// Favorites
favorites: {
  buyerSessionId: v.id("buyerSessions"),
  listingId: v.id("listings"),
  notes: v.optional(v.string()),
  createdAt: v.number(),
}

// Tours
tours: {
  buyerSessionId: v.id("buyerSessions"),
  listingId: v.id("listings"),
  requestedDate: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("completed"),
    v.literal("cancelled")
  ),
  timeSlot: v.string(),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}

// Property Alerts
alerts: {
  buyerSessionId: v.id("buyerSessions"),
  savedSearchId: v.id("savedSearches"),
  newListingIds: v.array(v.id("listings")),
  notified: v.boolean(),
  createdAt: v.number(),
}
```

### Table Updates
```typescript
// Update Offers table
offers: {
  // ... existing fields
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("rejected"),
    v.literal("countered"), // NEW
    v.literal("withdrawn")  // NEW
  ),
  counterOffer: v.optional(v.object({ // NEW
    amount: v.number(),
    terms: v.string(),
    expiresAt: v.number(),
  })),
  viewedBySellerAt: v.optional(v.number()), // NEW
}
```

## API Routes
- `POST /api/favorites/add` - Add property to favorites
- `DELETE /api/favorites/remove` - Remove from favorites
- `GET /api/favorites/:sessionId` - Get all favorites
- `POST /api/tours/request` - Request tour
- `GET /api/tours/:sessionId` - Get buyer's tours
- `POST /api/alerts/create` - Create property alert
- `GET /api/alerts/:sessionId` - Get active alerts

## Components

### New Components
- `components/buyer/property-comparison.tsx` - Side-by-side comparison
- `components/buyer/comparison-chart.tsx` - Visual data charts
- `components/buyer/favorites-grid.tsx` - Favorites display
- `components/buyer/offer-dashboard.tsx` - Offer tracking
- `components/buyer/offer-status-card.tsx` - Individual offer card
- `components/buyer/tour-request-form.tsx` - Tour scheduling form
- `components/buyer/tour-list.tsx` - Upcoming tours
- `components/buyer/alert-manager.tsx` - Manage alerts

### Updated Components
- `components/buyer/property-card.tsx` - Add favorite button
- `components/buyer/dashboard-ai-assistant.tsx` - Add comparison commands

## Routes

### New Pages
- `app/buyer/[sessionCode]/compare/page.tsx` - Comparison view
- `app/buyer/[sessionCode]/favorites/page.tsx` - Favorites page
- `app/buyer/[sessionCode]/offers/page.tsx` - Offer dashboard
- `app/buyer/[sessionCode]/tours/page.tsx` - Tour schedule

## AI Enhancements

### New AI Capabilities
- "Compare these properties" - Trigger comparison view
- "Save this property" - Add to favorites
- "Schedule a tour for [property]" - Request tour
- "What's the status of my offer?" - Check offer status
- "Help me decide between these" - AI decision support

### Updated System Prompts
Add context for:
- Saved properties in favorites
- Submitted offers and their status
- Scheduled tours
- Active alerts

## Success Metrics
- **Comparison Usage:** 60%+ of buyers compare 2+ properties
- **Favorites:** 80%+ of buyers save at least 3 properties
- **Offers:** 40%+ increase in offers submitted
- **Tours:** 70%+ of tour requests get confirmed
- **Alerts:** 50%+ of buyers set up at least 1 alert

## Testing Checklist
- [ ] Property comparison with 2, 3, and 4 properties
- [ ] Add/remove favorites functionality
- [ ] Offer submission and status tracking
- [ ] Tour request and confirmation flow
- [ ] Alert creation and notification delivery
- [ ] AI commands for all new features
- [ ] Mobile responsive design for all features
- [ ] Edge cases: empty states, no properties selected, etc.

## Dependencies
- Existing property search and display (Phase 1-6)
- AI assistant integration (Phase 6)
- Email service for notifications (tours/alerts)
- Calendar integration for tour scheduling

## Rollout Plan
1. **Week 1:** Favorites + Property Comparison
2. **Week 2:** Offer Management Dashboard
3. **Week 3:** Alerts + Tour Scheduling

## Notes
- Start with favorites (simplest) to build momentum
- Comparison view leverages existing selection feature
- Offer management is most complex - allocate extra time
- Consider using existing email service or add SendGrid/Resend
- Tours might need calendar integration (Google Calendar API)
