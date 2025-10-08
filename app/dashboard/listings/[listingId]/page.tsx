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
import ListingViewerTable from "@/components/dashboard/detail-pages/listing-viewer-table";

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

      {/* Buyer Activity Table */}
      <ListingViewerTable 
        buyerActivity={buyerActivity} 
        listingPrice={listingData.listing.price}
      />
    </div>
  );
}
