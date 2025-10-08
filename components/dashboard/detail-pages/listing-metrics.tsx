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
