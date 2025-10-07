# Task 3.1: Buyer Portal Routes & Layout

**Phase:** 3 - Frontend - Buyer Portal  
**Estimated Time:** 6-8 hours  
**Priority:** High  
**Dependencies:** Task 2.1 (Convex Functions)

## Overview
Create the buyer portal route structure with session-based authentication and navigation.

## Subtasks

### 3.1.1 Create Buyer Session Verification Middleware

**File:** `lib/buyer-auth.ts`

- [ ] Create session verification helper:
  ```typescript
  import { api } from "@/convex/_generated/api";
  import { fetchQuery } from "convex/nextjs";
  
  export async function verifyBuyerSession(sessionCode: string) {
    const session = await fetchQuery(api.buyerSessions.getBuyerSessionByCode, {
      sessionCode,
    });
    
    if (!session || !session.active) {
      return null;
    }
    
    return session;
  }
  ```

- [ ] Test verification logic

### 3.1.2 Create Buyer Layout

**File:** `app/buyer/[sessionCode]/layout.tsx`

- [ ] Create layout with session verification:
  ```typescript
  import { verifyBuyerSession } from "@/lib/buyer-auth";
  import { redirect } from "next/navigation";
  import BuyerNav from "@/components/buyer/buyer-nav";
  
  export default async function BuyerLayout({
    children,
    params,
  }: {
    children: React.ReactNode;
    params: { sessionCode: string };
  }) {
    const session = await verifyBuyerSession(params.sessionCode);
    
    if (!session) {
      redirect("/");
    }
    
    return (
      <div className="min-h-screen bg-background">
        <BuyerNav session={session} />
        <main className="container py-6">{children}</main>
      </div>
    );
  }
  ```

- [ ] Test layout renders correctly

### 3.1.3 Create Buyer Navigation Component

**File:** `components/buyer/buyer-nav.tsx`

- [ ] Create navigation:
  ```typescript
  import Link from "next/link";
  import { Home, Search, Heart, FileText, MessageSquare } from "lucide-react";
  
  export default function BuyerNav({ session }: { session: any }) {
    const sessionCode = session.sessionCode;
    
    return (
      <nav className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Property Portal</h1>
            <div className="flex gap-4">
              <Link href={`/buyer/${sessionCode}`}>
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link href={`/buyer/${sessionCode}/properties`}>
                <Search className="h-5 w-5" />
                <span>Browse</span>
              </Link>
              <Link href={`/buyer/${sessionCode}/saved`}>
                <Heart className="h-5 w-5" />
                <span>Saved</span>
              </Link>
              <Link href={`/buyer/${sessionCode}/offers`}>
                <FileText className="h-5 w-5" />
                <span>Offers</span>
              </Link>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome, {session.buyerName}
          </div>
        </div>
      </nav>
    );
  }
  ```

- [ ] Style navigation with existing design system

### 3.1.4 Create Buyer Dashboard Page

**File:** `app/buyer/[sessionCode]/page.tsx`

- [ ] Create dashboard:
  ```typescript
  import { api } from "@/convex/_generated/api";
  import { fetchQuery } from "convex/nextjs";
  import PropertyCard from "@/components/buyer/property-card";
  
  export default async function BuyerDashboard({
    params,
  }: {
    params: { sessionCode: string };
  }) {
    const session = await fetchQuery(
      api.buyerSessions.getBuyerSessionByCode,
      { sessionCode: params.sessionCode }
    );
    
    const matchingListings = await fetchQuery(
      api.buyerSessions.getMatchingListings,
      { sessionId: session._id }
    );
    
    return (
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Welcome back, {session.buyerName}!
          </h2>
          <p className="text-muted-foreground">
            We found {matchingListings.length} properties matching your preferences.
          </p>
        </section>
        
        <section>
          <h3 className="text-xl font-semibold mb-4">Recommended for You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingListings.slice(0, 6).map((listing) => (
              <PropertyCard
                key={listing._id}
                listing={listing}
                sessionCode={params.sessionCode}
              />
            ))}
          </div>
        </section>
      </div>
    );
  }
  ```

- [ ] Test dashboard loads correctly

### 3.1.5 Create Properties Browse Page

**File:** `app/buyer/[sessionCode]/properties/page.tsx`

- [ ] Create browse page with filters:
  ```typescript
  import PropertyGrid from "@/components/buyer/property-grid";
  import PropertyFilters from "@/components/buyer/property-filters";
  
  export default async function PropertiesPage({
    params,
    searchParams,
  }: {
    params: { sessionCode: string };
    searchParams: { [key: string]: string | string[] | undefined };
  }) {
    // Parse filters from searchParams
    // Query listings with filters
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <PropertyFilters sessionCode={params.sessionCode} />
        </aside>
        <div className="lg:col-span-3">
          <PropertyGrid
            sessionCode={params.sessionCode}
            filters={searchParams}
          />
        </div>
      </div>
    );
  }
  ```

- [ ] Test filtering functionality

### 3.1.6 Create Property Detail Page

**File:** `app/buyer/[sessionCode]/properties/[listingId]/page.tsx`

- [ ] Create detail page:
  ```typescript
  import { api } from "@/convex/_generated/api";
  import { fetchQuery } from "convex/nextjs";
  import PropertyGallery from "@/components/buyer/property-gallery";
  import PropertyDetails from "@/components/buyer/property-details";
  import NeighborhoodInsights from "@/components/buyer/neighborhood-insights";
  import AIChat from "@/components/buyer/ai-chat-widget";
  
  export default async function PropertyDetailPage({
    params,
  }: {
    params: { sessionCode: string; listingId: string };
  }) {
    const listing = await fetchQuery(api.listings.getListingById, {
      id: params.listingId as any,
    });
    
    if (!listing) {
      return <div>Property not found</div>;
    }
    
    return (
      <div className="space-y-8">
        <PropertyGallery images={listing.images} videos={listing.videos} />
        <PropertyDetails listing={listing} />
        <NeighborhoodInsights enrichedData={listing.enrichedData} />
        <AIChat
          sessionCode={params.sessionCode}
          listingId={params.listingId}
        />
      </div>
    );
  }
  ```

- [ ] Test detail page loads all sections

### 3.1.7 Create Saved Properties Page

**File:** `app/buyer/[sessionCode]/saved/page.tsx`

- [ ] Create saved page:
  ```typescript
  // Query saved/favorited properties
  // Display in grid with comparison tools
  // Allow removing from saved
  ```

- [ ] Implement save/unsave functionality

### 3.1.8 Create Offers Page

**File:** `app/buyer/[sessionCode]/offers/page.tsx`

- [ ] Create offers page:
  ```typescript
  import OffersList from "@/components/buyer/offers-list";
  import NewOfferButton from "@/components/buyer/new-offer-button";
  
  export default async function OffersPage({
    params,
  }: {
    params: { sessionCode: string };
  }) {
    const session = await fetchQuery(
      api.buyerSessions.getBuyerSessionByCode,
      { sessionCode: params.sessionCode }
    );
    
    const offers = await fetchQuery(api.offers.getOffersByBuyerSession, {
      sessionId: session._id,
    });
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Offers</h2>
          <NewOfferButton sessionCode={params.sessionCode} />
        </div>
        <OffersList offers={offers} />
      </div>
    );
  }
  ```

- [ ] Test offers display correctly

### 3.1.9 Create Error and Loading States

**File:** `app/buyer/[sessionCode]/error.tsx`

- [ ] Create error boundary:
  ```typescript
  'use client';
  
  export default function BuyerError({
    error,
    reset,
  }: {
    error: Error;
    reset: () => void;
  }) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <button onClick={reset}>Try again</button>
      </div>
    );
  }
  ```

**File:** `app/buyer/[sessionCode]/loading.tsx`

- [ ] Create loading state:
  ```typescript
  export default function BuyerLoading() {
    return <div>Loading...</div>;
  }
  ```

### 3.1.10 Add Route Metadata

- [ ] Add metadata to each route:
  ```typescript
  export const metadata = {
    title: 'Property Portal - Dashboard',
    description: 'Your personalized property search dashboard',
  };
  ```

## Acceptance Criteria
- [ ] All routes created and functional
- [ ] Session verification works
- [ ] Navigation is intuitive
- [ ] Pages load without errors
- [ ] Responsive design on mobile
- [ ] Error states handled gracefully

## Testing Checklist
- [ ] Test with valid session code
- [ ] Test with invalid session code
- [ ] Test navigation between pages
- [ ] Test on mobile devices
- [ ] Test loading states
- [ ] Test error states

## Next Steps
Proceed to Task 3.2: Buyer Components
