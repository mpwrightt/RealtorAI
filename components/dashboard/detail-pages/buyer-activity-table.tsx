'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ViewHistoryItem {
  listing: any;
  viewCount: number;
  totalTime: number;
  lastViewed: number;
  avgImagesViewed: number;
  matchScore: number;
  engagementScore: number;
}

interface BuyerActivityTableProps {
  viewHistory: ViewHistoryItem[];
}

export default function BuyerActivityTable({ viewHistory }: BuyerActivityTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 70) return { variant: "default" as const, label: "High" };
    if (score >= 40) return { variant: "secondary" as const, label: "Medium" };
    return { variant: "outline" as const, label: "Low" };
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property View History ({viewHistory.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {viewHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Total Time</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Last Viewed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewHistory.map((item) => {
                  const engagement = getEngagementBadge(item.engagementScore);
                  const matchColor = getMatchScoreColor(item.matchScore);
                  
                  return (
                    <TableRow 
                      key={item.listing._id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => window.location.href = `/dashboard/listings/${item.listing._id}`}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{item.listing.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.listing.city}, {item.listing.state}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(item.listing.price)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{item.viewCount}x</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatDuration(item.totalTime)}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${matchColor}`}>
                          {item.matchScore}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={engagement.variant}>
                          {engagement.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.lastViewed)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/dashboard/listings/${item.listing._id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties viewed yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Properties viewed by this buyer will appear here with match scores and engagement data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
