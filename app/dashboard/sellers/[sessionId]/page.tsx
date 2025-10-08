import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SellerDetailActions from "@/components/dashboard/detail-pages/seller-detail-actions";

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
        <SellerDetailActions portalUrl={portalUrl} sessionId={session._id} />
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
