# Next.js 15 Migration Fixes

## Issues Fixed

### 1. ✅ Serialization Error - PropertyCard Missing 'use client'

**Error:**
```
Error: Event handlers cannot be passed to Client Component props.
  <button onClick={function onClick}>
```

**Root Cause:** PropertyCard component had Button with onClick handler but was missing `'use client';` directive

**Fix:** Added `'use client';` to top of `components/buyer/property-card.tsx`

---

### 2. ✅ Async Params & SearchParams (Next.js 15)

**Error:**
```
Error: Route used `params.sessionCode`. `params` should be awaited before using its properties.
Error: Route used `searchParams.minPrice`. `searchParams` should be awaited before using its properties.
```

**Root Cause:** Next.js 15 changed `params` and `searchParams` to be Promises that must be awaited

**Fix:** Updated `app/buyer/[sessionCode]/properties/page.tsx`

**Before:**
```tsx
export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: { sessionCode: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode: params.sessionCode }  // ❌ Direct access
  );
  
  const filters = {
    minPrice: searchParams.minPrice,  // ❌ Direct access
  };
}
```

**After:**
```tsx
export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionCode: string }>;  // ✅ Promise type
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;  // ✅ Promise type
}) {
  // ✅ Await both params and searchParams
  const { sessionCode } = await params;
  const searchParamsResolved = await searchParams;
  
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode }  // ✅ Use awaited value
  );
  
  const filters = {
    minPrice: searchParamsResolved.minPrice,  // ✅ Use awaited value
  };
}
```

---

### 3. ✅ Next.js Image Configuration

**Error:**
```
Error: Invalid src prop (https://images.unsplash.com/...) on `next/image`, 
hostname "images.unsplash.com" is not configured under images in your `next.config.js`
```

**Root Cause:** Next.js requires explicit hostname configuration for remote images

**Fix:** Updated `next.config.ts`

**Before:**
```tsx
const nextConfig: NextConfig = {
  /* config options here */
};
```

**After:**
```tsx
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',  // Wildcard for all subdomains
      },
    ],
  },
};
```

---

## Changes Summary

### Files Modified:

1. **`components/buyer/property-card.tsx`**
   - Added `'use client';` directive

2. **`app/buyer/[sessionCode]/properties/page.tsx`**
   - Changed params type to `Promise<{ sessionCode: string }>`
   - Changed searchParams type to `Promise<{ [key: string]: string | string[] | undefined }>`
   - Added `const { sessionCode } = await params;`
   - Added `const searchParamsResolved = await searchParams;`
   - Updated all references to use awaited values

3. **`next.config.ts`**
   - Added `images.remotePatterns` configuration for Unsplash

---

## Next.js 15 Breaking Changes

### What Changed in Next.js 15:

#### 1. Params & SearchParams are now Promises
All route params and search params must be awaited in Server Components.

**Migration pattern:**
```tsx
// Old (Next.js 14)
function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}

// New (Next.js 15)
async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

#### 2. Image hostname validation is stricter
Must explicitly configure all remote image domains.

#### 3. Client Components need explicit 'use client'
Any component with interactivity MUST have `'use client';` directive.

---

## Testing Checklist

After these fixes, verify:

- [ ] Properties page loads without errors
- [ ] Property cards display with images
- [ ] Heart icon (save button) is clickable
- [ ] Filtering works (updates URL and rerenders)
- [ ] Property detail pages load
- [ ] No console errors related to params/searchParams
- [ ] Images load from Unsplash

---

## Additional Pages to Update

These other pages may need the same params/searchParams fix:

### Check these files:
- [ ] `app/buyer/[sessionCode]/page.tsx`
- [ ] `app/buyer/[sessionCode]/properties/[listingId]/page.tsx`
- [ ] `app/buyer/[sessionCode]/saved/page.tsx`
- [ ] `app/buyer/[sessionCode]/offers/page.tsx`
- [ ] `app/seller/[sessionCode]/page.tsx`
- [ ] `app/seller/[sessionCode]/offers/page.tsx`

### Migration pattern for each:
```tsx
// Find:
export default async function Page({
  params,
}: {
  params: { sessionCode: string };
}) {
  // uses params.sessionCode directly
}

// Replace with:
export default async function Page({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  // use sessionCode variable instead
}
```

---

## Status

✅ **PropertyCard** - Fixed 'use client' directive  
✅ **Properties page** - Fixed async params/searchParams  
✅ **Next config** - Fixed image hostname configuration  
⚠️ **Other pages** - May need same params fix  

---

## Next Steps

1. **Restart dev server** (required for next.config.ts changes):
   ```bash
   npm run dev
   ```

2. **Hard refresh browser**:
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

3. **Test properties page**:
   - Navigate to `/buyer/[sessionCode]/properties`
   - Should load without errors
   - Images should display

4. **Fix other pages** (if they show params errors):
   - Apply same async params pattern
   - Test each page individually

---

## References

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Async Request APIs](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Image Configuration](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns)
