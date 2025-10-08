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
