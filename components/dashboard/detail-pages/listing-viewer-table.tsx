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

interface BuyerActivityItem {
  session: any;
  viewCount: number;
  totalTime: number;
  lastViewed: number;
  engagementScore: number;
}

interface ListingViewerTableProps {
  buyerActivity: BuyerActivityItem[];
  listingPrice: number;
}

export default function ListingViewerTable({ buyerActivity, listingPrice }: ListingViewerTableProps) {
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

  // Use AI match score from the query data if available
  const getMatchScore = (item: any) => {
    // Return AI-calculated match score if available
    return item.matchScore || 70; // default to 70 if not calculated yet
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatPriceRange = (session: any) => {
    const prefs = session.preferences;
    if (prefs.minPrice && prefs.maxPrice) {
      return `$${(prefs.minPrice / 1000).toFixed(0)}k - $${(prefs.maxPrice / 1000).toFixed(0)}k`;
    }
    if (prefs.maxPrice) {
      return `Up to $${(prefs.maxPrice / 1000).toFixed(0)}k`;
    }
    if (prefs.minPrice) {
      return `$${(prefs.minPrice / 1000).toFixed(0)}k+`;
    }
    return "Any price";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buyer Activity ({buyerActivity.length})</CardTitle>
        <p className="text-sm text-muted-foreground">
          Buyers who have viewed this property
        </p>
      </CardHeader>
      <CardContent>
        {buyerActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Total Time</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Last Viewed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyerActivity.map((item) => {
                  const engagement = getEngagementBadge(item.engagementScore);
                  const matchScore = getMatchScore(item);
                  const matchColor = getMatchScoreColor(matchScore);
                  
                  return (
                    <TableRow 
                      key={item.session._id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => window.location.href = `/dashboard/buyers/${item.session._id}`}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{item.session.buyerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.session.buyerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPriceRange(item.session)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{item.viewCount}x</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatDuration(item.totalTime)}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${matchColor}`}>
                          {matchScore}%
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
                        <Link href={`/dashboard/buyers/${item.session._id}`}>
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
            <p className="text-muted-foreground">No buyers have viewed this property yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Buyer viewing data will appear here once buyers start viewing this listing
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
