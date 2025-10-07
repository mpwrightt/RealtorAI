# Feature: Save/Favorite Properties

**Priority:** Critical  
**Effort:** Small (2-3 days)  
**Dependencies:** None

## Overview
Allow buyers to bookmark properties for later review with persistent storage in the database. Include a dedicated favorites page and integrate favorite indicators throughout the UI.

## User Stories
- As a buyer, I want to save properties I'm interested in so I can review them later
- As a buyer, I want to add notes to my favorite properties
- As a buyer, I want to see all my favorites in one place
- As a buyer, I want to easily unfavorite properties I'm no longer interested in

## Database Schema

```typescript
// convex/schema.ts
favorites: defineTable({
  buyerSessionId: v.id("buyerSessions"),
  listingId: v.id("listings"),
  notes: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_buyer", ["buyerSessionId"])
  .index("by_listing", ["listingId"])
  .index("by_buyer_and_listing", ["buyerSessionId", "listingId"]),
```

## Convex Functions

```typescript
// convex/favorites.ts
export const addFavorite = mutation({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_buyer_and_listing", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId).eq("listingId", args.listingId)
      )
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("favorites", {
      buyerSessionId: args.buyerSessionId,
      listingId: args.listingId,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const removeFavorite = mutation({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_buyer_and_listing", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId).eq("listingId", args.listingId)
      )
      .first();
    
    if (favorite) {
      await ctx.db.delete(favorite._id);
    }
  },
});

export const getFavorites = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_buyer", (q) => q.eq("buyerSessionId", args.buyerSessionId))
      .order("desc")
      .collect();
    
    // Fetch full listing details
    const listingsWithFavorites = await Promise.all(
      favorites.map(async (fav) => {
        const listing = await ctx.db.get(fav.listingId);
        return {
          ...listing,
          favoriteId: fav._id,
          favoriteNotes: fav.notes,
          favoritedAt: fav.createdAt,
        };
      })
    );
    
    return listingsWithFavorites.filter((l) => l !== null);
  },
});

export const isFavorite = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_buyer_and_listing", (q) =>
        q.eq("buyerSessionId", args.buyerSessionId).eq("listingId", args.listingId)
      )
      .first();
    
    return !!favorite;
  },
});

export const updateFavoriteNotes = mutation({
  args: {
    favoriteId: v.id("favorites"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.favoriteId, {
      notes: args.notes,
    });
  },
});
```

## Components

### 1. Favorites Page
**File:** `app/buyer/[sessionCode]/favorites/page.tsx`

```typescript
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import FavoritesGrid from "@/components/buyer/favorites-grid";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode }
  );
  
  const favorites = await fetchQuery(api.favorites.getFavorites, {
    buyerSessionId: session._id,
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Favorite Properties
          </h1>
          <p className="text-muted-foreground mt-2">
            {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
        <Link href={`/buyer/${sessionCode}/properties`}>
          <Button>Browse More Properties</Button>
        </Link>
      </div>
      
      {favorites.length > 0 ? (
        <FavoritesGrid 
          favorites={favorites}
          sessionCode={sessionCode}
          sessionId={session._id}
        />
      ) : (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6">
            Start saving properties you're interested in
          </p>
          <Link href={`/buyer/${sessionCode}/properties`}>
            <Button>Browse Properties</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
```

### 2. Favorites Grid Component
**File:** `components/buyer/favorites-grid.tsx`

```typescript
'use client';

import { useState } from 'react';
import PropertyCard from './property-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit, Trash2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function FavoritesGrid({
  favorites,
  sessionCode,
  sessionId,
}: {
  favorites: any[];
  sessionCode: string;
  sessionId: string;
}) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const updateNotes = useMutation(api.favorites.updateFavoriteNotes);
  
  const handleRemove = async (listingId: string) => {
    await removeFavorite({
      buyerSessionId: sessionId,
      listingId,
    });
  };
  
  const handleUpdateNotes = async (favoriteId: string) => {
    await updateNotes({
      favoriteId,
      notes,
    });
    setEditingNotes(null);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite) => (
        <div key={favorite._id} className="relative">
          <PropertyCard
            listing={favorite}
            sessionCode={sessionCode}
            showFavoriteButton={false}
          />
          
          <div className="mt-3 space-y-2">
            {favorite.favoriteNotes && (
              <div className="text-sm p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Your notes:</p>
                <p>{favorite.favoriteNotes}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingNotes(favorite.favoriteId);
                      setNotes(favorite.favoriteNotes || '');
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {favorite.favoriteNotes ? 'Edit Notes' : 'Add Notes'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notes for {favorite.address}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes about this property..."
                      rows={5}
                    />
                    <Button
                      onClick={() => handleUpdateNotes(favorite.favoriteId)}
                      className="w-full"
                    >
                      Save Notes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(favorite._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3. Update Property Card with Favorite Button
**File:** `components/buyer/property-card.tsx`

Add favorite button to existing PropertyCard:

```typescript
'use client';

import { Heart } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

// Add to props
interface PropertyCardProps {
  listing: any;
  sessionCode: string;
  sessionId?: string; // Add this
  showFavoriteButton?: boolean; // Add this
}

export default function PropertyCard({
  listing,
  sessionCode,
  sessionId,
  showFavoriteButton = true,
}: PropertyCardProps) {
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  
  const isFavorite = useQuery(
    api.favorites.isFavorite,
    sessionId ? {
      buyerSessionId: sessionId,
      listingId: listing._id || listing.id,
    } : "skip"
  );
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!sessionId) return;
    
    if (isFavorite) {
      await removeFavorite({
        buyerSessionId: sessionId,
        listingId: listing._id || listing.id,
      });
    } else {
      await addFavorite({
        buyerSessionId: sessionId,
        listingId: listing._id || listing.id,
      });
    }
  };
  
  return (
    <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all">
      <Link href={`/buyer/${sessionCode}/properties/${listing._id || listing.id}`}>
        <div className="relative h-56 bg-muted">
          {/* ...existing image code... */}
          
          {/* Add favorite button */}
          {showFavoriteButton && sessionId && (
            <Button
              size="icon"
              variant="secondary"
              className={`absolute top-2 right-2 ${
                isFavorite ? 'bg-primary text-primary-foreground' : 'bg-white/90'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
      </Link>
      
      {/* ...rest of card... */}
    </div>
  );
}
```

### 4. Add Favorites Link to Navigation
Update buyer layout sidebar:

```typescript
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <Link href={`/buyer/${sessionCode}/favorites`}>
      <Heart className="h-4 w-4" />
      <span>Favorites</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
```

## AI Integration

Update AI system prompt to be aware of favorites:

```typescript
// In dashboard AI assistant context
if (context?.favorites && context.favorites.length > 0) {
  contextMessage += `\n\nFavorited Properties (${context.favorites.length}):
${context.favorites.map((fav: any, idx: number) => 
  `${idx + 1}. ${fav.address} - $${fav.price.toLocaleString()}`
).join('\n')}

When user asks about favorites, reference these properties.`;
}
```

Add AI commands:
- "Show me my favorites"
- "Compare my favorite properties"
- "What's the best deal among my favorites?"

## Testing Scenarios
1. Add property to favorites
2. Remove from favorites
3. Add notes to favorite
4. Edit existing notes
5. View favorites page when empty
6. View favorites page with multiple properties
7. Favorite button state persistence across pages
8. Compare favorited properties
9. AI queries about favorites

## Success Metrics
- 80%+ of buyers save at least 3 properties
- 40%+ of buyers add notes to favorites
- 30%+ of offers come from favorited properties
- Average 5.2 favorites per buyer session

## Future Enhancements
- Share favorites with family/friends
- Export favorites as PDF
- Set reminders for favorite properties
- Get alerts when favorited properties change price
- Organize favorites into folders/collections
