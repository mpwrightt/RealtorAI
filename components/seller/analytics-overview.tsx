import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, FileText, TrendingUp, Users } from "lucide-react";

interface AnalyticsOverviewProps {
  analytics: {
    views: {
      total: number;
      unique: number;
      avgDuration: number;
    };
    offers: {
      total: number;
      pending: number;
      accepted: number;
      highest: number;
      average: number;
    };
    daysOnMarket: number;
  };
}

export default function AnalyticsOverview({ analytics }: AnalyticsOverviewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.views.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.views.unique} unique viewers
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Avg. View Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(analytics.views.avgDuration)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Per visitor session
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Offers Received</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.offers.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.offers.pending} pending review
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Highest Offer</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.offers.highest > 0 ? formatPrice(analytics.offers.highest) : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.offers.average > 0 ? `Avg: ${formatPrice(analytics.offers.average)}` : 'No offers yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
