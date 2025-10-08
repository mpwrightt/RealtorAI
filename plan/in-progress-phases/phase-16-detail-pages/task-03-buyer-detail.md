# Task 03: Buyer Session Detail Page

**Phase:** 16 - Dashboard Detail Pages  
**Effort:** 10 hours  
**Priority:** 🔥🔥 HIGH  
**Dependencies:** Task 02

---

## 🎯 Objective

Create a buyer session detail page at `/dashboard/buyers/[sessionId]` with comprehensive activity tracking, preferences visualization, and AI-powered behavioral insights.

---

## 📋 Subtasks

### 1. Create Buyer View History Query (1.5 hours)

**Add to `convex/buyerSessions.ts`:**

```typescript
// Get buyer's property view history with engagement details
export const getBuyerViewHistory = query({
  args: { sessionId: v.id("buyerSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Get all views by this buyer
    const views = await ctx.db
      .query("propertyViews")
      .withIndex("byBuyerSessionId", (q) => 
        q.eq("buyerSessionId", args.sessionId)
      )
      .collect();

    // Group by listing
    const listingViews = new Map<string, any>();
    
    for (const view of views) {
      if (!listingViews.has(view.listingId)) {
        const listing = await ctx.db.get(view.listingId);
        if (!listing) continue;
        
        // Calculate match score based on preferences
        const prefs = session.preferences;
        let matchScore = 100;
        
        if (prefs.minPrice && listing.price < prefs.minPrice) matchScore -= 20;
        if (prefs.maxPrice && listing.price > prefs.maxPrice) matchScore -= 20;
        if (prefs.bedrooms && listing.bedrooms < prefs.bedrooms) matchScore -= 15;
        if (prefs.bathrooms && listing.bathrooms < prefs.bathrooms) matchScore -= 15;
        
        listingViews.set(view.listingId, {
          listing,
          viewCount: 0,
          totalTime: 0,
          lastViewed: 0,
          avgImagesViewed: 0,
          matchScore: Math.max(0, matchScore),
        });
      }
      
      const data = listingViews.get(view.listingId)!;
      data.viewCount += 1;
      data.totalTime += view.viewDuration;
      data.lastViewed = Math.max(data.lastViewed, view.timestamp);
      data.avgImagesViewed = Math.round(
        (data.avgImagesViewed * (data.viewCount - 1) + view.imagesViewed.length) / data.viewCount
      );
    }

    // Calculate engagement scores
    return Array.from(listingViews.values())
      .map((data) => ({
        ...data,
        engagementScore: Math.min(
          100,
          Math.round((data.viewCount * 15) + (data.totalTime / 120))
        ),
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore);
  },
});
```

---

### 2. Create Buyer Preferences Card (2 hours)

**Create:** `components/dashboard/detail-pages/buyer-preferences-card.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Bed, Bath, Home, MapPin, Star } from "lucide-react";

interface BuyerPreferencesCardProps {
  preferences: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyTypes: string[];
    cities: string[];
    mustHaveFeatures: string[];
  };
}

export default function BuyerPreferencesCard({ preferences }: BuyerPreferencesCardProps) {
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
        <CardTitle>Buyer Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Range */}
        {preferences.minPrice && preferences.maxPrice && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Price Range</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatPrice(preferences.minPrice)}</span>
                <span>{formatPrice(preferences.maxPrice)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          {preferences.bedrooms && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Bedrooms</span>
              </div>
              <p className="text-lg font-bold">{preferences.bedrooms}+ beds</p>
            </div>
          )}
          {preferences.bathrooms && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Bathrooms</span>
              </div>
              <p className="text-lg font-bold">{preferences.bathrooms}+ baths</p>
            </div>
          )}
        </div>

        {/* Property Types */}
        {preferences.propertyTypes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Property Types</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.propertyTypes.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Cities */}
        {preferences.cities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preferred Locations</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.cities.map((city) => (
                <Badge key={city} variant="outline">
                  {city}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Must-Have Features */}
        {preferences.mustHaveFeatures.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Must-Have Features</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.mustHaveFeatures.map((feature) => (
                <Badge key={feature} variant="default">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 3. Create Activity Table Component (2 hours)

**Create:** `components/dashboard/detail-pages/buyer-activity-table.tsx`

```typescript
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ViewHistoryItem {
  listing: any;
  viewCount: number;
  totalTime: number;
  lastViewed: number;
  avgImagesViewed: number;
  matchScore: number;
  engagementScore: number;
}

interface BuyerActivityTableProps {
  viewHistory: ViewHistoryItem[];
}

export default function BuyerActivityTable({ viewHistory }: BuyerActivityTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { variant: "default" as const, label: "High" };
    if (score >= 40) return { variant: "secondary" as const, label: "Medium" };
    return { variant: "outline" as const, label: "Low" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property View History ({viewHistory.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {viewHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Total Time</TableHead>
                <TableHead>Match Score</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Last Viewed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewHistory.map((item) => {
                const engagement = getScoreBadge(item.engagementScore);
                return (
                  <TableRow key={item.listing._id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[200px]">
                        <p className="truncate">{item.listing.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.listing.city}, {item.listing.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(item.listing.price)}</TableCell>
                    <TableCell>{item.viewCount}x</TableCell>
                    <TableCell>{formatDuration(item.totalTime)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.matchScore}%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={engagement.variant}>
                        {engagement.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(item.lastViewed)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/listings/${item.listing._id}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No properties viewed yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 4. Create AI Insights Component (2 hours)

**Create:** `components/dashboard/detail-pages/ai-insights-card.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle, ThumbsUp } from "lucide-react";

interface AIInsightsCardProps {
  buyerName: string;
  viewHistory: any[];
  offers: any[];
  preferences: any;
}

export default function AIInsightsCard({
  buyerName,
  viewHistory,
  offers,
  preferences,
}: AIInsightsCardProps) {
  // Generate insights based on behavior
  const insights = [];

  // Property type preference
  if (viewHistory.length > 0) {
    const propertyTypes = viewHistory.map((v) => v.listing.propertyType);
    const mostCommon = propertyTypes.sort(
      (a, b) =>
        propertyTypes.filter((v) => v === a).length -
        propertyTypes.filter((v) => v === b).length
    ).pop();
    insights.push({
      type: "behavior",
      icon: ThumbsUp,
      text: `Highly interested in ${mostCommon} properties`,
      color: "text-blue-500",
    });
  }

  // Price sensitivity
  if (preferences.maxPrice && viewHistory.length > 3) {
    const avgViewed = viewHistory.reduce((sum, v) => sum + v.listing.price, 0) / viewHistory.length;
    const budgetAdherence = (avgViewed / preferences.maxPrice) * 100;
    
    if (budgetAdherence < 80) {
      insights.push({
        type: "price",
        icon: TrendingUp,
        text: `Budget-conscious - views properties below max budget`,
        color: "text-green-500",
      });
    } else if (budgetAdherence > 95) {
      insights.push({
        type: "price",
        icon: AlertCircle,
        text: `May need higher budget - viewing at price ceiling`,
        color: "text-yellow-500",
      });
    }
  }

  // Engagement level
  const highEngagement = viewHistory.filter((v) => v.engagementScore > 70).length;
  if (highEngagement > 0) {
    insights.push({
      type: "engagement",
      icon: Sparkles,
      text: `${highEngagement} properties with high engagement - ready to make offers`,
      color: "text-purple-500",
    });
  }

  // Offer likelihood
  if (viewHistory.length > 5 && offers.length === 0) {
    insights.push({
      type: "action",
      icon: AlertCircle,
      text: `High activity but no offers yet - may need encouragement`,
      color: "text-orange-500",
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <insight.icon className={`h-5 w-5 ${insight.color} mt-0.5`} />
              <p className="text-sm">{insight.text}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Not enough activity to generate insights yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 5. Create Main Page (2.5 hours)

**Create:** `app/dashboard/buyers/[sessionId]/page.tsx`

```typescript
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, FileText, Calendar } from "lucide-react";

import BuyerPreferencesCard from "@/components/dashboard/detail-pages/buyer-preferences-card";
import BuyerActivityTable from "@/components/dashboard/detail-pages/buyer-activity-table";
import AIInsightsCard from "@/components/dashboard/detail-pages/ai-insights-card";
import QuickActionsSidebar from "@/components/dashboard/detail-pages/quick-actions-sidebar";

export const metadata = {
  title: "Buyer Session Details - Dashboard",
  description: "View buyer activity, preferences, and engagement analytics",
};

export default async function BuyerDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { sessionId } = await params;

  // Get buyer session
  const session = await fetchQuery(api.buyerSessions.getBuyerSessionById, {
    sessionId: sessionId as Id<'buyerSessions'>,
  });

  if (!session) notFound();

  // Get view history
  const viewHistory = await fetchQuery(api.buyerSessions.getBuyerViewHistory, {
    sessionId: session._id,
  });

  // Get engagement metrics
  const engagement = await fetchQuery(api.telemetry.getBuyerEngagement, {
    buyerSessionId: session._id,
  });

  // Get offers
  const offers = await fetchQuery(api.offers.getOffersByBuyerSession, {
    buyerSessionId: session._id,
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/buyer/${session.sessionCode}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/buyers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{session.buyerName}</h1>
            <p className="text-sm text-muted-foreground">
              {session.buyerEmail} {session.buyerPhone && `• ${session.buyerPhone}`}
            </p>
          </div>
        </div>
        <Badge variant={session.active ? "default" : "secondary"}>
          {session.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Properties Viewed</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.propertiesViewed}</div>
            <p className="text-xs text-muted-foreground">{engagement.totalViews} total views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total View Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(engagement.totalViewTime / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Avg {Math.round(engagement.avgViewDuration / 60)}m per property
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offers Submitted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
            <p className="text-xs text-muted-foreground">
              {offers.filter((o: any) => o.status === "pending").length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((Date.now() - session.lastActive) / (1000 * 60 * 60 * 24))}d
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(session.lastActive).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BuyerPreferencesCard preferences={session.preferences} />
          <BuyerActivityTable viewHistory={viewHistory} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <AIInsightsCard
            buyerName={session.buyerName}
            viewHistory={viewHistory}
            offers={offers}
            preferences={session.preferences}
          />
          <QuickActionsSidebar
            type="buyer"
            portalUrl={portalUrl}
            sessionId={session._id}
            email={session.buyerEmail}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Acceptance Criteria

- [ ] Buyer detail page renders at `/dashboard/buyers/[sessionId]`
- [ ] Activity metrics cards show accurate stats
- [ ] Preferences card displays all preferences visually
- [ ] View history table shows all properties viewed
- [ ] Engagement scores calculate correctly
- [ ] AI insights generate relevant recommendations
- [ ] Quick actions sidebar functional
- [ ] Links to listing detail pages work
- [ ] Page is responsive
- [ ] Loading and error states handled

---

*Estimated: 10 hours*  
*Priority: HIGH*  
*Next Task: 04 - Table Updates & Navigation*
