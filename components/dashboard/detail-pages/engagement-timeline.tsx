'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Clock } from "lucide-react";

interface TimelineEvent {
  type: "view" | "offer";
  timestamp: number;
  buyerName: string;
  duration?: number;
  imagesViewed?: number;
  amount?: number;
  status?: string;
}

interface EngagementTimelineProps {
  timeline: TimelineEvent[];
}

export default function EngagementTimeline({ timeline }: EngagementTimelineProps) {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {timeline.length > 0 ? (
            timeline.map((event, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="mt-1">
                  {event.type === "view" ? (
                    <Eye className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  {event.type === "view" ? (
                    <>
                      <p className="font-medium">{event.buyerName} viewed property</p>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {Math.round((event.duration || 0) / 60)} min • {event.imagesViewed || 0} images viewed
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{event.buyerName} submitted offer</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(event.amount || 0)}
                      </p>
                      <Badge
                        variant={
                          event.status === "accepted"
                            ? "default"
                            : event.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                        className="mt-1"
                      >
                        {event.status}
                      </Badge>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
