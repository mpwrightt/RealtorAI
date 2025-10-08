# Task 01: Listing Detail Page

**Phase:** 16 - Dashboard Detail Pages  
**Effort:** 10 hours  
**Priority:** 🔥🔥🔥 CRITICAL  
**Dependencies:** None (starts the phase)

---

## 🎯 Objective

Create a comprehensive listing detail page at `/dashboard/listings/[listingId]` that displays property information, engagement analytics, connected sessions, offers, and AI insights.

---

## 📋 Subtasks

### 1. Create New Convex Queries (2 hours)

**Add to `convex/listings.ts`:**

```typescript
// Get comprehensive listing details with all related data
export const getListingWithAnalytics = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) return null;

    // Get view analytics
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Get unique viewers
    const uniqueViewers = new Set(
      views.map((v) => v.buyerSessionId).filter((id) => id !== undefined)
    ).size;

    // Get all offers
    const offers = await ctx.db
      .query("offers")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Calculate days on market
    const daysOnMarket = Math.floor(
      (Date.now() - listing.createdAt) / (1000 * 60 * 60 * 24)
    );

    return {
      listing,
      analytics: {
        totalViews: views.length,
        uniqueViewers,
        avgViewDuration:
          views.length > 0
            ? views.reduce((sum, v) => sum + v.viewDuration, 0) / views.length
            : 0,
        daysOnMarket,
      },
      offers: {
        total: offers.length,
        pending: offers.filter((o) => o.status === "pending").length,
        accepted: offers.filter((o) => o.status === "accepted").length,
        rejected: offers.filter((o) => o.status === "rejected").length,
      },
    };
  },
});

// Get all buyers who viewed this listing
export const getListingBuyerActivity = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Group by buyer session
    const buyerViews = new Map<string, any>();
    
    for (const view of views) {
      if (!view.buyerSessionId) continue;
      
      if (!buyerViews.has(view.buyerSessionId)) {
        const session = await ctx.db.get(view.buyerSessionId);
        if (!session) continue;
        
        buyerViews.set(view.buyerSessionId, {
          session,
          viewCount: 0,
          totalTime: 0,
          lastViewed: 0,
          engagementScore: 0,
        });
      }
      
      const buyer = buyerViews.get(view.buyerSessionId)!;
      buyer.viewCount += 1;
      buyer.totalTime += view.viewDuration;
      buyer.lastViewed = Math.max(buyer.lastViewed, view.timestamp);
    }

    // Calculate engagement scores
    return Array.from(buyerViews.values()).map((buyer) => ({
      ...buyer,
      engagementScore: Math.min(
        100,
        Math.round((buyer.viewCount * 10) + (buyer.totalTime / 60))
      ),
    })).sort((a, b) => b.engagementScore - a.engagementScore);
  },
});

// Get activity timeline for listing
export const getListingEngagementTimeline = query({
  args: {
    listingId: v.id("listings"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Get views
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Get offers
    const offers = await ctx.db
      .query("offers")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Combine into timeline
    const timeline: any[] = [];

    for (const view of views) {
      let buyerName = "Anonymous";
      if (view.buyerSessionId) {
        const session = await ctx.db.get(view.buyerSessionId);
        if (session) buyerName = session.buyerName;
      }

      timeline.push({
        type: "view",
        timestamp: view.timestamp,
        buyerName,
        duration: view.viewDuration,
        imagesViewed: view.imagesViewed.length,
      });
    }

    for (const offer of offers) {
      const session = await ctx.db.get(offer.buyerSessionId);
      
      timeline.push({
        type: "offer",
        timestamp: offer.createdAt,
        buyerName: session?.buyerName || "Unknown",
        amount: offer.offerAmount,
        status: offer.status,
      });
    }

    return timeline
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },
});

// Get connected sessions
export const getListingConnectedSessions = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    // Get seller session
    const sellerSession = await ctx.db
      .query("sellerSessions")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .unique();

    // Get buyer sessions that viewed this property
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byListingId", (q) => q.eq("listingId", args.listingId))
      .collect();

    const buyerSessionIds = new Set(
      views.map((v) => v.buyerSessionId).filter((id) => id !== undefined)
    );

    const buyerSessions = await Promise.all(
      Array.from(buyerSessionIds).map((id) => ctx.db.get(id))
    );

    return {
      sellerSession,
      buyerSessions: buyerSessions.filter((s) => s !== null),
    };
  },
});
```

---

### 2. Create Hero Component (1.5 hours)

**Create:** `components/dashboard/detail-pages/listing-hero.tsx`

```typescript
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Bed, Bath, Maximize } from "lucide-react";
import Image from "next/image";

interface ListingHeroProps {
  listing: any;
}

export default function ListingHero({ listing }: ListingHeroProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'sold': return 'bg-blue-500';
      case 'withdrawn': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Image */}
          <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
            {listing.images?.[0] ? (
              <Image
                src={listing.images[0]}
                alt={listing.address}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Home className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{listing.address}</h1>
                <p className="text-muted-foreground text-lg">
                  {listing.city}, {listing.state} {listing.zipCode}
                </p>
              </div>
              <Badge className={getStatusColor(listing.status)}>
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </Badge>
            </div>

            <div className="text-4xl font-bold text-primary">
              {formatPrice(listing.price)}
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{listing.bedrooms} Beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{listing.bathrooms} Baths</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{listing.sqft.toLocaleString()} sqft</span>
              </div>
            </div>

            {listing.mlsNumber && (
              <p className="text-sm text-muted-foreground">
                MLS #: {listing.mlsNumber}
              </p>
            )}

            {listing.description && (
              <p className="text-sm line-clamp-3">{listing.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 3. Create Metrics Cards Component (1.5 hours)

**Create:** `components/dashboard/detail-pages/listing-metrics.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, Clock, Calendar, FileText, Link as LinkIcon } from "lucide-react";

interface ListingMetricsProps {
  analytics: {
    totalViews: number;
    uniqueViewers: number;
    avgViewDuration: number;
    daysOnMarket: number;
  };
  offers: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  connectedSessions: {
    buyerCount: number;
    hasSellerSession: boolean;
  };
}

export default function ListingMetrics({ 
  analytics, 
  offers, 
  connectedSessions 
}: ListingMetricsProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalViews}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.uniqueViewers}</div>
          <p className="text-xs text-muted-foreground">Individual buyers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Avg View Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(analytics.avgViewDuration)}
          </div>
          <p className="text-xs text-muted-foreground">Per visitor</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Days on Market</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.daysOnMarket}</div>
          <p className="text-xs text-muted-foreground">Since listing</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{offers.total}</div>
          <p className="text-xs text-muted-foreground">
            {offers.pending} pending, {offers.accepted} accepted
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Connected Sessions</CardTitle>
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {connectedSessions.buyerCount + (connectedSessions.hasSellerSession ? 1 : 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {connectedSessions.buyerCount} buyers, {connectedSessions.hasSellerSession ? '1' : '0'} seller
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 4. Create Connected Sessions Component (1 hour)

**Create:** `components/dashboard/detail-pages/connected-sessions-card.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ConnectedSessionsCardProps {
  sellerSession: any;
  buyerSessions: any[];
  listingId: string;
}

export default function ConnectedSessionsCard({
  sellerSession,
  buyerSessions,
  listingId,
}: ConnectedSessionsCardProps) {
  return (
    <div className="space-y-4">
      {/* Seller Session */}
      {sellerSession ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seller Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{sellerSession.sellerName}</p>
                <p className="text-sm text-muted-foreground">{sellerSession.sellerEmail}</p>
                <Badge className="mt-2" variant={sellerSession.active ? "default" : "secondary"}>
                  {sellerSession.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Link href={`/dashboard/sellers/${sellerSession._id}`}>
                <Button variant="outline" size="sm">
                  View Details
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No seller session created yet</p>
            <Link href={`/dashboard/sellers/new?listingId=${listingId}`}>
              <Button size="sm">Create Seller Session</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Buyer Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Interested Buyers ({buyerSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {buyerSessions.length > 0 ? (
            <div className="space-y-3">
              {buyerSessions.map((session: any) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{session.buyerName}</p>
                    <p className="text-sm text-muted-foreground">{session.buyerEmail}</p>
                  </div>
                  <Link href={`/dashboard/buyers/${session._id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No buyers have viewed this property yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 5. Create Engagement Timeline Component (1.5 hours)

**Create:** `components/dashboard/detail-pages/engagement-timeline.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Clock } from "lucide-react";

interface TimelineEvent {
  type: "view" | "offer";
  timestamp: number;
  buyerName: string;
  duration?: number;
  imagesViewed?: number;
  amount?: number;
  status?: string;
}

interface EngagementTimelineProps {
  timeline: TimelineEvent[];
}

export default function EngagementTimeline({ timeline }: EngagementTimelineProps) {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {timeline.length > 0 ? (
            timeline.map((event, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="mt-1">
                  {event.type === "view" ? (
                    <Eye className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  {event.type === "view" ? (
                    <>
                      <p className="font-medium">{event.buyerName} viewed property</p>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {Math.round((event.duration || 0) / 60)} min • {event.imagesViewed || 0} images viewed
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{event.buyerName} submitted offer</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(event.amount || 0)}
                      </p>
                      <Badge
                        variant={
                          event.status === "accepted"
                            ? "default"
                            : event.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                        className="mt-1"
                      >
                        {event.status}
                      </Badge>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 6. Create Main Page Component (2.5 hours)

**Create:** `app/dashboard/listings/[listingId]/page.tsx`

```typescript
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Share2, Trash } from "lucide-react";

import ListingHero from "@/components/dashboard/detail-pages/listing-hero";
import ListingMetrics from "@/components/dashboard/detail-pages/listing-metrics";
import ConnectedSessionsCard from "@/components/dashboard/detail-pages/connected-sessions-card";
import EngagementTimeline from "@/components/dashboard/detail-pages/engagement-timeline";

export const metadata = {
  title: "Listing Details - Dashboard",
  description: "View detailed analytics and information for this listing",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { listingId } = await params;

  // Get listing data
  const listingData = await fetchQuery(api.listings.getListingWithAnalytics, {
    listingId: listingId as Id<'listings'>,
  });

  if (!listingData) {
    notFound();
  }

  // Get connected sessions
  const connectedSessions = await fetchQuery(
    api.listings.getListingConnectedSessions,
    { listingId: listingId as Id<'listings'> }
  );

  // Get buyer activity
  const buyerActivity = await fetchQuery(api.listings.getListingBuyerActivity, {
    listingId: listingId as Id<'listings'>,
  });

  // Get timeline
  const timeline = await fetchQuery(api.listings.getListingEngagementTimeline, {
    listingId: listingId as Id<'listings'>,
    limit: 20,
  });

  // Get all offers
  const offers = await fetchQuery(api.offers.getOffersByListing, {
    listingId: listingId as Id<'listings'>,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/listings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Listing Details</h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive analytics and activity
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/listings/${listingId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <ListingHero listing={listingData.listing} />

      {/* Metrics */}
      <ListingMetrics
        analytics={listingData.analytics}
        offers={listingData.offers}
        connectedSessions={{
          buyerCount: buyerActivity.length,
          hasSellerSession: !!connectedSessions.sellerSession,
        }}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EngagementTimeline timeline={timeline} />
        </div>
        <div className="lg:col-span-1">
          <ConnectedSessionsCard
            sellerSession={connectedSessions.sellerSession}
            buyerSessions={connectedSessions.buyerSessions}
            listingId={listingId}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Acceptance Criteria

- [ ] Listing detail page renders at `/dashboard/listings/[listingId]`
- [ ] Hero section shows property info and image
- [ ] Metrics cards display accurate stats
- [ ] Connected sessions show seller and buyers
- [ ] Activity timeline loads and displays events
- [ ] Links to buyer/seller detail pages work
- [ ] Quick actions (edit, share, delete) functional
- [ ] Page is responsive on mobile
- [ ] Loading and error states handled
- [ ] Navigation breadcrumbs work

---

## 🧪 Testing

```bash
# 1. Run TypeScript check
npx tsc --noEmit

# 2. Test locally
npm run dev

# 3. Navigate to listing detail
# Click on a listing address from dashboard

# 4. Verify all data loads
# Check metrics, timeline, connected sessions

# 5. Test navigation
# Click links to buyer/seller detail pages
```

---

*Estimated: 10 hours*  
*Priority: CRITICAL*  
*Next Task: 02 - Seller Session Detail Page*
