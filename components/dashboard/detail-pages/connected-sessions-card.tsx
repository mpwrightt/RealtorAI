'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ConnectedSessionsCardProps {
  sellerSession: any;
  buyerSessions: any[];
  listingId: string;
}

export default function ConnectedSessionsCard({
  sellerSession,
  buyerSessions,
  listingId,
}: ConnectedSessionsCardProps) {
  return (
    <div className="space-y-4">
      {/* Seller Session */}
      {sellerSession ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seller Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{sellerSession.sellerName}</p>
                <p className="text-sm text-muted-foreground">{sellerSession.sellerEmail}</p>
                <Badge className="mt-2" variant={sellerSession.active ? "default" : "secondary"}>
                  {sellerSession.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Link href={`/dashboard/sellers/${sellerSession._id}`}>
                <Button variant="outline" size="sm">
                  View Details
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No seller session created yet</p>
            <Link href={`/dashboard/sellers/new?listingId=${listingId}`}>
              <Button size="sm">Create Seller Session</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Buyer Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Interested Buyers ({buyerSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {buyerSessions.length > 0 ? (
            <div className="space-y-3">
              {buyerSessions.map((session: any) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{session.buyerName}</p>
                    <p className="text-sm text-muted-foreground">{session.buyerEmail}</p>
                  </div>
                  <Link href={`/dashboard/buyers/${session._id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No buyers have viewed this property yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
