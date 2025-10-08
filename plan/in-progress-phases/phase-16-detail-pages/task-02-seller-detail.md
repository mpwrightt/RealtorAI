# Task 02: Seller Session Detail Page

**Phase:** 16 - Dashboard Detail Pages  
**Effort:** 8 hours  
**Priority:** 🔥🔥 HIGH  
**Dependencies:** Task 01

---

## 🎯 Objective

Create a seller session detail page at `/dashboard/sellers/[sessionId]` that reuses existing seller portal analytics components and adds dashboard-specific quick actions.

---

## 📋 Subtasks

### 1. Create Main Page Component (3 hours)

**Create:** `app/dashboard/sellers/[sessionId]/page.tsx`

```typescript
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Copy, Mail } from "lucide-react";

// Reuse existing seller portal components
import AnalyticsOverview from "@/components/seller/analytics-overview";
import EngagementChart from "@/components/seller/engagement-chart";
import VisitorInsights from "@/components/seller/visitor-insights";
import AIRecommendations from "@/components/seller/ai-recommendations";
import OffersSummary from "@/components/seller/offers-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Seller Session Details - Dashboard",
  description: "View seller portal analytics and activity",
};

export default async function SellerDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { sessionId } = await params;

  // Get seller session
  const session = await fetchQuery(api.sellerSessions.getSellerSessionById, {
    sessionId: sessionId as Id<'sellerSessions'>,
  });

  if (!session) notFound();

  // Get listing
  const listing = await fetchQuery(api.listings.getListingById, {
    listingId: session.listingId,
  });

  if (!listing) notFound();

  // Get analytics
  const analytics = await fetchQuery(api.sellerSessions.getSellerAnalytics, {
    sessionId: session._id,
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/seller/${session.sessionCode}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sellers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Seller Session</h1>
            <p className="text-sm text-muted-foreground">
              {session.sellerName} • {session.sellerEmail}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(portalUrl);
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Portal Link
          </Button>
          <Link href={portalUrl} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Portal
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send Report
          </Button>
        </div>
      </div>

      {/* Session Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Session Code</p>
              <p className="text-lg font-mono">{session.sessionCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={session.active ? "default" : "secondary"}>
                {session.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-lg">
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Active</p>
              <p className="text-lg">
                {new Date(session.lastActive).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Property</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-lg">{listing.address}</p>
              <p className="text-muted-foreground">{listing.city}, {listing.state}</p>
              <p className="text-2xl font-bold text-primary mt-2">
                ${listing.price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.sqft} sqft
              </p>
            </div>
            <Link href={`/dashboard/listings/${listing._id}`}>
              <Button variant="outline">View Full Details</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Reuse Seller Portal Analytics Components */}
      <AnalyticsOverview analytics={analytics} />

      <AIRecommendations listing={listing} analytics={analytics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementChart listingId={listing._id} />
        <VisitorInsights analytics={analytics} />
      </div>

      <OffersSummary listingId={listing._id} />
    </div>
  );
}
```

---

### 2. Add Quick Actions Sidebar (2 hours)

**Create:** `components/dashboard/detail-pages/quick-actions-sidebar.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Mail, Ban, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsSidebarProps {
  type: "buyer" | "seller";
  portalUrl: string;
  sessionId: string;
  email: string;
  onDeactivate?: () => void;
}

export default function QuickActionsSidebar({
  type,
  portalUrl,
  sessionId,
  email,
  onDeactivate,
}: QuickActionsSidebarProps) {
  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalUrl);
    toast.success('Portal link copied to clipboard!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start" onClick={copyPortalLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Portal Link
        </Button>
        
        <Button variant="outline" className="w-full justify-start" asChild>
          <a href={portalUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Portal
          </a>
        </Button>

        <Button variant="outline" className="w-full justify-start">
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>

        {type === "buyer" && (
          <>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="h-4 w-4 mr-2" />
              Edit Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Showing
            </Button>
          </>
        )}

        {type === "seller" && (
          <Button variant="outline" className="w-full justify-start">
            <Edit className="h-4 w-4 mr-2" />
            Edit Listing
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full justify-start text-destructive"
          onClick={onDeactivate}
        >
          <Ban className="h-4 w-4 mr-2" />
          Deactivate Session
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

### 3. Test and Verify (3 hours)

- Create test seller sessions with different data scenarios
- Verify all analytics components render correctly
- Test quick actions functionality
- Ensure navigation between listing and seller detail pages works
- Test responsive design on mobile devices
- Verify loading and error states

---

## ✅ Acceptance Criteria

- [ ] Seller detail page renders at `/dashboard/sellers/[sessionId]`
- [ ] Session info card shows all details
- [ ] Property overview links to listing detail page
- [ ] Analytics components from seller portal reused
- [ ] Quick actions sidebar functional
- [ ] Copy portal link works
- [ ] Opens seller portal in new tab
- [ ] All data loads correctly
- [ ] Page is responsive
- [ ] Navigation breadcrumbs work

---

## 🧪 Testing

```bash
# Test locally
npm run dev

# Navigate to seller detail
# From dashboard, click seller name in table

# Verify:
# - All analytics match seller portal
# - Quick actions work
# - Portal link opens correctly
# - Navigation to listing detail works
```

---

*Estimated: 8 hours*  
*Priority: HIGH*  
*Next Task: 03 - Buyer Session Detail Page*
