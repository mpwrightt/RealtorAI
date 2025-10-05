'use client';

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface EngagementChartProps {
  listingId: Id<"listings">;
}

export default function EngagementChart({ listingId }: EngagementChartProps) {
  const analytics = useQuery(api.telemetry.getListingAnalytics, {
    listingId,
    timeRange: "30d",
  });

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Views Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert viewsOverTime object to array for display
  const chartData = Object.entries(analytics.viewsOverTime || {})
    .map(([date, views]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views,
    }))
    .slice(-14); // Last 14 days

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Views Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Views</div>
              <div className="text-2xl font-bold">{analytics.totalViews}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Unique Viewers</div>
              <div className="text-2xl font-bold">{analytics.uniqueViewers}</div>
            </div>
          </div>

          {/* Simple bar chart visualization */}
          <div className="space-y-2">
            {chartData.length > 0 ? (
              chartData.map((day: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-16 text-xs text-muted-foreground">{day.date}</div>
                  <div className="flex-1 bg-muted rounded overflow-hidden">
                    <div
                      className="bg-primary h-6 flex items-center justify-end px-2 text-xs text-primary-foreground font-medium"
                      style={{
                        width: `${Math.max((day.views / Math.max(...chartData.map((d: any) => d.views))) * 100, 5)}%`,
                      }}
                    >
                      {day.views > 0 && day.views}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No view data available yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
