# Testing the Favorites Feature

## Quick Fix Applied
The favorites button should now work! Here's what was fixed:

### Changes Made:
1. ✅ Updated `DashboardAIAssistant` to accept proper `sessionId` type
2. ✅ Ensured `sessionId` is passed to `PropertyCard` component
3. ✅ PropertyCard now correctly receives `sessionId` as `Id<"buyerSessions">`

## How to Test:

### 1. Access a Buyer Portal
```
http://localhost:3000/buyer/{SESSION_CODE}
```

You need a valid session code. To get one:
- Go to agent dashboard: `http://localhost:3000/dashboard`
- Create a new buyer session (or use existing)
- Copy the session code

### 2. Test Favorites Flow

#### From Main Dashboard (AI Search):
1. Go to buyer dashboard with your session code
2. Use AI to search: "Show me 3 bedroom homes"
3. Properties will appear in the results
4. Click the **heart icon** in the top-right of each property card
5. Heart should fill in and turn primary color

#### From Properties Page:
1. Navigate to `/buyer/{SESSION_CODE}/properties`
2. Browse all properties
3. Click heart icon on any property
4. Should toggle favorite status

#### View Favorites:
1. Click "Favorites" in the navigation menu
2. Should see all favorited properties
3. Can add notes to each favorite
4. Can remove from favorites

### 3. Expected Behavior

**When NOT favorited:**
- Heart icon is outlined (empty)
- Background: white/secondary
- Text: gray

**When favorited:**
- Heart icon is filled (solid)
- Background: primary color
- Heart color: matches primary

**Toggle Action:**
- Click once: adds to favorites
- Click again: removes from favorites
- Works immediately (real-time via Convex)

### 4. Technical Details

The favorite button uses:
```typescript
// Convex real-time query
const isFavorited = useQuery(api.favorites.isFavorite, {
  buyerSessionId: sessionId,
  listingId: listingId,
});

// Mutations
const addFavorite = useMutation(api.favorites.addFavorite);
const removeFavorite = useMutation(api.favorites.removeFavorite);
```

### 5. Troubleshooting

**If heart button doesn't work:**

1. **Check Console for Errors**
   - Open browser DevTools (F12)
   - Look for errors in Console tab

2. **Verify sessionId is present**
   - In PropertyCard, sessionId should be defined
   - If undefined, favorite button won't show

3. **Check Convex is running**
   ```bash
   npx convex dev
   ```

4. **Verify database schema**
   - Favorites table should exist
   - Check in Convex dashboard: https://dashboard.convex.dev

5. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### 6. Where sessionId Comes From

```
app/buyer/[sessionCode]/page.tsx
  ↓ passes session._id as sessionId
DashboardAIAssistant component
  ↓ passes sessionId prop
PropertyCard component
  ↓ uses sessionId for favorites
```

## Files Involved:

1. **Schema:** `convex/schema.ts`
   - Defines `favorites` table

2. **Backend:** `convex/favorites.ts`
   - `addFavorite` mutation
   - `removeFavorite` mutation
   - `isFavorite` query
   - `getFavorites` query

3. **Components:**
   - `components/buyer/property-card.tsx` - Heart button
   - `components/buyer/favorites-grid.tsx` - Favorites page grid
   - `app/buyer/[sessionCode]/favorites/page.tsx` - Favorites page

4. **Navigation:**
   - `components/buyer/buyer-nav.tsx` - Favorites link

## Testing Checklist:

- [ ] Heart button appears on property cards
- [ ] Clicking heart adds to favorites (fills in)
- [ ] Clicking again removes from favorites (outlines)
- [ ] Favorites page shows all favorited properties
- [ ] Can add notes to favorites
- [ ] Can edit existing notes
- [ ] Can remove from favorites via favorites page
- [ ] Favorite status persists across page refreshes
- [ ] Multiple properties can be favorited
- [ ] Favorite count updates in real-time

## Success!
If you can:
1. ✅ Click heart on property
2. ✅ See it fill in/change color
3. ✅ Navigate to Favorites page
4. ✅ See the property there

**The favorites feature is working!** 🎉

---

**Need Help?**
Check the browser console for any errors and verify Convex is running.
