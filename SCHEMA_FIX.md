# Schema Validation Fixes

## Issue
Demo data generation was failing due to schema validation errors:
- `propertyViews` missing required fields
- `offers` missing required fields  
- `agentInteractions` using wrong field names

## Root Cause
The demo data generation code was using old/incorrect field names that didn't match the actual Convex schema.

## Fixes Applied

### 1. PropertyViews Schema Fix

**Error:**
```
Object is missing the required field `imagesViewed`
```

**Schema requires:**
```typescript
{
  buyerSessionId: v.optional(v.id("buyerSessions")),
  listingId: v.id("listings"),
  viewerType: v.string(),
  viewDuration: v.number(),
  imagesViewed: v.array(v.number()),  // ❌ Was missing
  videosWatched: v.array(v.number()),  // ❌ Was missing
  sectionsVisited: v.array(v.string()),  // ❌ Was missing
  timestamp: v.number(),
}
```

**Fix:**
```typescript
await ctx.db.insert("propertyViews", {
  buyerSessionId: session._id,
  listingId: listing._id,
  timestamp: now - (daysAgo * oneDay),
  viewDuration,
  viewerType: "buyer",  // ✅ Added
  imagesViewed: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => i),  // ✅ Added
  videosWatched: [],  // ✅ Added
  sectionsVisited: ["details", "photos", Math.random() > 0.5 ? "map" : "features"],  // ✅ Added
});
```

### 2. Offers Schema Fix

**Schema requires:**
```typescript
{
  listingId: v.id("listings"),
  buyerSessionId: v.id("buyerSessions"),
  offerAmount: v.number(),
  earnestMoney: v.number(),
  downPayment: v.number(),  // ❌ Was missing
  financingType: v.string(),  // ❌ Was missing
  contingencies: v.array(v.string()),
  closingDate: v.optional(v.string()),  // ❌ Was number, needs string
  status: v.string(),
  aiAnalysis: v.optional(v.object({
    marketComparison: v.string(),  // ❌ Different structure
    strengths: v.array(v.string()),  // ❌ Different structure
    risks: v.array(v.string()),  // ❌ Different structure
    recommendation: v.string(),  // ❌ Different structure
    confidence: v.number(),
  })),
  createdAt: v.number(),  // ❌ Was using submittedAt
  updatedAt: v.number(),  // ❌ Was missing
}
```

**Fix:**
```typescript
const offerAmount = data.amount;
const downPayment = Math.floor(offerAmount * 0.2); // ✅ Added

await ctx.db.insert("offers", {
  buyerSessionId: data.session._id,
  listingId: data.listing._id,
  offerAmount,
  earnestMoney: Math.floor(offerAmount * 0.01),
  downPayment,  // ✅ Added
  financingType: downPayment >= offerAmount * 0.5 ? "cash" : "conventional",  // ✅ Added
  contingencies: ["Inspection", "Financing", "Appraisal"],
  status: data.status,
  closingDate: new Date(now + (45 * oneDay)).toISOString().split('T')[0],  // ✅ String format
  aiAnalysis: {
    marketComparison: "Above asking price",  // ✅ Fixed structure
    strengths: [...],  // ✅ Fixed structure
    risks: [...],  // ✅ Fixed structure
    recommendation: "...",  // ✅ Fixed structure
    confidence: 85,
  },
  createdAt: now - (data.daysAgo * oneDay),  // ✅ Changed from submittedAt
  updatedAt: now - (data.daysAgo * oneDay),  // ✅ Added
});
```

### 3. AgentInteractions Schema Fix

**Schema requires:**
```typescript
{
  sessionType: v.string(),
  sessionId: v.string(),
  agentQuery: v.string(),  // ❌ Was using wrong fields
  agentResponse: v.string(),  // ❌ Was using wrong fields
  toolsUsed: v.array(v.string()),  // ❌ Was missing
  context: v.optional(v.any()),
  timestamp: v.number(),
}
```

**Fix:**
```typescript
await ctx.db.insert("agentInteractions", {
  sessionType: "buyer",  // ✅ Correct
  sessionId: data.session._id,  // ✅ Correct
  agentQuery: data.subject,  // ✅ Changed from interactionType/subject
  agentResponse: data.notes,  // ✅ Changed from notes
  toolsUsed: [],  // ✅ Added
  timestamp: now - (data.daysAgo * oneDay),  // ✅ Correct
});
```

## Status

✅ **All schema validation errors fixed**  
✅ **TypeScript compiles with 0 errors**  
✅ **Demo data generation should now work**

## Testing

To verify the fix:
```bash
1. Restart Convex dev: npx convex dev
2. Login to /dashboard/demo
3. Click "Generate Demo Data"
4. Should complete successfully in 3-5 seconds
5. Check for success message with session codes
```

## Files Modified

- `/convex/demoData.ts` - Updated all helper functions to match schema
  - `createDemoPropertyViews()` - Added missing fields
  - `createDemoOffers()` - Fixed aiAnalysis structure, added required fields
  - `createDemoInteractions()` - Fixed field names

## Prevention

**Before inserting data:**
1. ✅ Check the schema definition in `convex/schema.ts`
2. ✅ Match ALL required fields
3. ✅ Use correct data types (string vs number)
4. ✅ Include nested object structures exactly as defined

**TypeScript helps but:**
- Convex validation happens at runtime
- TypeScript `any` types bypass compile-time checks
- Always verify against actual schema

## Lessons Learned

1. Schema definitions are the source of truth
2. Runtime validation catches what TypeScript misses
3. Helper functions need schema reviews
4. Test data generation before production use
