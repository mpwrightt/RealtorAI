'use client';

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

interface OffersSummaryProps {
  listingId: Id<"listings">;
}

export default function OffersSummary({ listingId }: OffersSummaryProps) {
  const offers = useQuery(api.offers.getOffersByListing, {
    listingId,
  });

  if (!offers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Loading offers...
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingOffers = offers.filter((o: any) => o.status === 'pending');
  const acceptedOffers = offers.filter((o: any) => o.status === 'accepted');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'countered':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Offers ({offers.length})
          </CardTitle>
          {pendingOffers.length > 0 && (
            <Badge variant="secondary">
              {pendingOffers.length} Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {offers.length > 0 ? (
          <div className="space-y-4">
            {offers.slice(0, 5).map((offer: any) => (
              <div key={offer._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">
                      {formatPrice(offer.offerAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Submitted {new Date(offer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className={getStatusColor(offer.status)}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Down Payment
                    </div>
                    <div className="font-medium">{formatPrice(offer.downPayment)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Financing</div>
                    <div className="font-medium capitalize">{offer.financingType}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Closing
                    </div>
                    <div className="font-medium">{offer.closingDate || 'Flexible'}</div>
                  </div>
                </div>

                {offer.contingencies && offer.contingencies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {offer.contingencies.map((contingency: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {contingency}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {offers.length > 5 && (
              <Button variant="outline" className="w-full">
                View All {offers.length} Offers
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
            <p className="text-muted-foreground text-sm">
              Offers will appear here when buyers submit them
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
