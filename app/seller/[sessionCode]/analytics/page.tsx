import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import AnalyticsOverview from "@/components/seller/analytics-overview";
import EngagementChart from "@/components/seller/engagement-chart";
import VisitorInsights from "@/components/seller/visitor-insights";
import AIRecommendations from "@/components/seller/ai-recommendations";
import OffersSummary from "@/components/seller/offers-summary";
import type { Id } from "@/convex/_generated/dataModel";

export const metadata = {
  title: "Analytics - Seller Portal",
  description: "Detailed engagement metrics for your listing.",
};

export default async function SellerAnalyticsPage({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;

  const session = await fetchQuery(api.sellerSessions.getSellerSessionByCode, {
    sessionCode,
  });

  if (!session) {
    notFound();
  }

  if (!session.active) {
    redirect("/");
  }

  const listing = await fetchQuery(api.listings.getListingById, {
    listingId: session.listingId as Id<'listings'>,
  });

  if (!listing) {
    notFound();
  }

  const analytics = await fetchQuery(api.sellerSessions.getSellerAnalytics, {
    sessionId: session._id,
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Listing Analytics</h1>
        <p className="text-muted-foreground">
          Track how buyers are engaging with {listing.address} and see AI recommendations to boost results.
        </p>
      </div>

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
