import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import AnalyticsOverview from "@/components/seller/analytics-overview";
import OffersSummary from "@/components/seller/offers-summary";
import EngagementChart from "@/components/seller/engagement-chart";
import VisitorInsights from "@/components/seller/visitor-insights";
import AIRecommendations from "@/components/seller/ai-recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Home, DollarSign, Calendar } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export const metadata = {
  title: 'Seller Dashboard - Property Portal',
  description: 'Track your property performance and offers',
};

export default async function SellerDashboard({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  
  const session = await fetchQuery(
    api.sellerSessions.getSellerSessionByCode,
    { sessionCode }
  );

  if (!session) {
    return <div>Session not found</div>;
  }
  
  const analytics = await fetchQuery(
    api.sellerSessions.getSellerAnalytics,
    { sessionId: session._id }
  );
  
  const listing = await fetchQuery(
    api.listings.getListingById,
    { listingId: session.listingId as Id<"listings"> }
  );

  if (!listing) {
    return <div>Listing not found</div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <div className="space-y-8">
      {/* Property Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold">{listing.address}</h2>
          <p className="text-lg text-muted-foreground">
            {listing.city}, {listing.state} {listing.zipCode}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.sqft.toLocaleString()} sqft
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatPrice(listing.price)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {analytics.daysOnMarket} days on market
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <AnalyticsOverview analytics={analytics} />
      
      {/* AI Recommendations */}
      <AIRecommendations listing={listing} analytics={analytics} />

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementChart listingId={listing._id} />
        <VisitorInsights analytics={analytics} />
      </div>

      {/* Offers Summary */}
      <OffersSummary listingId={listing._id} />
    </div>
  );
}
