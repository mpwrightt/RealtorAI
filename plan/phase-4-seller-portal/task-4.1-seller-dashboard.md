# Task 4.1: Seller Dashboard & Analytics

**Phase:** 4 - Frontend - Seller Portal  
**Estimated Time:** 8-10 hours  
**Priority:** High  
**Dependencies:** Task 2.1 (Convex Functions), Task 2.6 (Telemetry)

## Overview
Create the seller portal with real-time analytics dashboard showing property engagement, offers, and visitor insights.

## Subtasks

### 4.1.1 Create Seller Routes

**File:** `app/seller/[sessionCode]/layout.tsx`

- [ ] Create seller layout:
  ```typescript
  import { verifySellerSession } from "@/lib/seller-auth";
  import { redirect } from "next/navigation";
  import SellerNav from "@/components/seller/seller-nav";
  
  export default async function SellerLayout({
    children,
    params,
  }: {
    children: React.ReactNode;
    params: { sessionCode: string };
  }) {
    const session = await verifySellerSession(params.sessionCode);
    
    if (!session) {
      redirect("/");
    }
    
    return (
      <div className="min-h-screen bg-background">
        <SellerNav session={session} />
        <main className="container py-6">{children}</main>
      </div>
    );
  }
  ```

- [ ] Create session verification helper in `lib/seller-auth.ts`

### 4.1.2 Create Analytics Overview Page

**File:** `app/seller/[sessionCode]/page.tsx`

- [ ] Create main dashboard:
  ```typescript
  import { api } from "@/convex/_generated/api";
  import { fetchQuery } from "convex/nextjs";
  import AnalyticsOverview from "@/components/seller/analytics-overview";
  import RecentActivity from "@/components/seller/recent-activity";
  import OffersSummary from "@/components/seller/offers-summary";
  
  export default async function SellerDashboard({
    params,
  }: {
    params: { sessionCode: string };
  }) {
    const session = await fetchQuery(
      api.sellerSessions.getSellerSessionByCode,
      { sessionCode: params.sessionCode }
    );
    
    const analytics = await fetchQuery(
      api.sellerSessions.getSellerAnalytics,
      { sessionId: session._id }
    );
    
    const listing = await fetchQuery(
      api.listings.getListingById,
      { id: session.listingId }
    );
    
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">{listing.address}</h2>
          <p className="text-muted-foreground">{listing.city}, {listing.state}</p>
        </div>
        
        <AnalyticsOverview analytics={analytics} />
        <OffersSummary sessionId={session._id} />
        <RecentActivity listingId={listing._id} />
      </div>
    );
  }
  ```

### 4.1.3 Create Analytics Overview Component

**File:** `components/seller/analytics-overview.tsx`

- [ ] Create KPI cards:
  ```typescript
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Eye, Clock, Heart, TrendingUp } from "lucide-react";
  
  export default function AnalyticsOverview({ analytics }: { analytics: any }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.viewsGrowth}% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time on Page</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(analytics.avgDuration / 60)}m {analytics.avgDuration % 60}s
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saves</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSaves}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.saveRate}% save rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interest Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.interestScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Based on engagement metrics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  ```

### 4.1.4 Create Engagement Chart Component

**File:** `components/seller/engagement-chart.tsx`

- [ ] Create time-series chart using Recharts:
  ```typescript
  'use client';
  
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  
  export default function EngagementChart({ data }: { data: any[] }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }
  ```

### 4.1.5 Create Visitor Insights Component

**File:** `components/seller/visitor-insights.tsx`

- [ ] Show visitor demographics:
  ```typescript
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  
  export default function VisitorInsights({ insights }: { insights: any }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitor Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Most Viewed Sections</div>
            {insights.topSections.map((section: any) => (
              <div key={section.name} className="flex justify-between items-center mb-1">
                <span className="text-sm">{section.name}</span>
                <span className="text-sm text-muted-foreground">{section.views} views</span>
              </div>
            ))}
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">Image Engagement</div>
            <div className="text-2xl font-bold">
              {insights.avgImagesViewed}/{insights.totalImages}
            </div>
            <p className="text-xs text-muted-foreground">
              Average images viewed per visit
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  ```

### 4.1.6 Create Recent Activity Feed

**File:** `components/seller/recent-activity.tsx`

- [ ] Create activity feed:
  ```typescript
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { formatDistanceToNow } from 'date-fns';
  
  export default function RecentActivity({ listingId }: { listingId: string }) {
    // Query recent views, saves, offers
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 border-b pb-3">
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp)} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  ```

### 4.1.7 Create Real-Time Updates Hook

**File:** `hooks/use-seller-analytics.ts`

- [ ] Create hook for live updates:
  ```typescript
  import { useQuery } from "convex/react";
  import { api } from "@/convex/_generated/api";
  
  export function useSellerAnalytics(sessionId: string) {
    const analytics = useQuery(api.sellerSessions.getSellerAnalytics, {
      sessionId,
    });
    
    return analytics;
  }
  ```

### 4.1.8 Create Export Analytics Feature

**File:** `components/seller/export-analytics.tsx`

- [ ] Create export button:
  ```typescript
  'use client';
  
  import { Button } from "@/components/ui/button";
  import { Download } from "lucide-react";
  
  export default function ExportAnalytics({ sessionId }: { sessionId: string }) {
    const handleExport = async () => {
      // Fetch full analytics data
      // Generate CSV or PDF
      // Trigger download
    };
    
    return (
      <Button onClick={handleExport} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export Report
      </Button>
    );
  }
  ```

### 4.1.9 Create Performance Benchmarks

**File:** `components/seller/performance-benchmarks.tsx`

- [ ] Compare to similar listings:
  ```typescript
  export default function PerformanceBenchmarks({ analytics }: { analytics: any }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance vs. Similar Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <BenchmarkBar
              label="Views"
              value={analytics.totalViews}
              average={analytics.categoryAverage.views}
            />
            <BenchmarkBar
              label="Engagement"
              value={analytics.interestScore}
              average={analytics.categoryAverage.engagement}
            />
          </div>
        </CardContent>
      </Card>
    );
  }
  ```

### 4.1.10 Create Mobile-Optimized Dashboard

- [ ] Ensure responsive design
- [ ] Add touch-friendly interactions
- [ ] Optimize charts for mobile
- [ ] Test on various devices

## Acceptance Criteria
- [ ] Dashboard loads quickly
- [ ] Real-time updates work
- [ ] Charts render correctly
- [ ] Mobile responsive
- [ ] Export functionality works
- [ ] All metrics accurate

## Testing Checklist
- [ ] Test with various data volumes
- [ ] Test real-time updates
- [ ] Test chart interactions
- [ ] Test on mobile devices
- [ ] Test export features
- [ ] Verify metric calculations

## Next Steps
Proceed to Task 4.2: Seller Offer Management
