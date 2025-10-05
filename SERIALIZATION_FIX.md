# Serialization Error Fix

## Issue
Next.js error: "Event handlers cannot be passed to Client Component props"

## Root Cause
Convex objects contain internal metadata that can't be serialized when passing from Server Components to Client Components.

## Solution
Explicitly extract only primitive values before passing to client components.

## Fixed Files

### 1. `/app/buyer/[sessionCode]/properties/page.tsx`

**Before:**
```tsx
<PropertyCard
  listing={listing}  // ❌ Convex object with metadata
  sessionCode={params.sessionCode}
/>
```

**After:**
```tsx
<PropertyCard
  listing={{
    _id: listing._id as string,
    address: listing.address as string,
    city: listing.city as string,
    state: listing.state as string,
    zipCode: listing.zipCode as string,
    price: listing.price as number,
    bedrooms: listing.bedrooms as number,
    bathrooms: listing.bathrooms as number,
    sqft: listing.sqft as number,
    propertyType: listing.propertyType as string,
    images: listing.images as string[],
    status: listing.status as string,
  }}  // ✅ Plain JavaScript object
  sessionCode={params.sessionCode}
/>
```

### 2. Cleared Next.js cache
```bash
rm -rf .next
```

## Why This Happens

Next.js App Router has strict serialization between server and client:
- **Server Components** fetch Convex data
- **Convex returns** objects with internal types/metadata
- **Client Components** need plain JS objects only

## How to Prevent

Always extract primitives when passing Convex data to client components:

```tsx
// ❌ DON'T
<ClientComponent data={convexObject} />

// ✅ DO
<ClientComponent data={{
  id: convexObject._id as string,
  name: convexObject.name as string,
  count: convexObject.count as number,
}} />
```

## Status
✅ **Fixed!** Application should now load without serialization errors.

## Testing
1. Clear browser cache
2. Refresh the page
3. Navigate to `/buyer/[sessionCode]/properties`
4. Should load without errors

If you still see the error, try:
```bash
rm -rf .next
npm run dev
```
