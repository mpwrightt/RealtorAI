import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Calendar, User, TrendingUp } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import OfferComparison from "@/components/seller/offer-comparison";

export const metadata = {
  title: 'Offers - Seller Portal',
  description: 'Manage offers on your property',
};

export default async function OffersPage({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  
  const session = await fetchQuery(
    api.sellerSessions.getSellerSessionByCode,
    { sessionCode }
  );

  if (!session) {
    return <div>Session not found</div>;
  }

  const listing = await fetchQuery(
    api.listings.getListingById,
    { listingId: session.listingId as Id<"listings"> }
  );

  const offers = await fetchQuery(
    api.offers.getOffersByListing,
    { listingId: session.listingId }
  );

  // Get buyer session details for each offer
  const offersWithBuyers = await Promise.all(
    offers.map(async (offer: any) => {
      const buyerSession = await fetchQuery(
        api.buyerSessions.getBuyerSessionById,
        { sessionId: offer.buyerSessionId }
      );
      return { ...offer, buyer: buyerSession };
    })
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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

  const pendingOffers = offersWithBuyers.filter((o: any) => o.status === 'pending');
  const reviewedOffers = offersWithBuyers.filter((o: any) => o.status !== 'pending');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Offers</h2>
          <p className="text-muted-foreground">
            {offers.length} offer{offers.length !== 1 ? 's' : ''} received on {listing?.address}
          </p>
        </div>
      </div>
      
      {/* Offer Comparison (if multiple pending) */}
      {pendingOffers.length >= 2 && (
        <OfferComparison offers={pendingOffers} listingPrice={listing?.price || 0} />
      )}

      {/* Pending Offers */}
      {pendingOffers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            Pending Review
            <Badge variant="secondary">{pendingOffers.length}</Badge>
          </h3>
          
          <div className="grid gap-4">
            {pendingOffers.map((offer: any) => (
              <Card key={offer._id} className="border-yellow-500/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl">
                        {formatPrice(offer.offerAmount)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        From {offer.buyer?.buyerName || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(offer.createdAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(offer.status)}>
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Down Payment</div>
                        <div className="font-semibold">{formatPrice(offer.downPayment)}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((offer.downPayment / offer.offerAmount) * 100)}% down
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Earnest Money</div>
                        <div className="font-semibold">{formatPrice(offer.earnestMoney)}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Financing</div>
                        <div className="font-semibold capitalize">{offer.financingType}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Closing Date</div>
                        <div className="font-semibold">{offer.closingDate || 'Flexible'}</div>
                      </div>
                    </div>
                  </div>

                  {offer.contingencies && offer.contingencies.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Contingencies:</div>
                      <div className="flex flex-wrap gap-2">
                        {offer.contingencies.map((contingency: any, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {contingency}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {offer.additionalTerms && (
                    <div>
                      <div className="text-sm font-medium mb-1">Additional Terms:</div>
                      <p className="text-sm text-muted-foreground">{offer.additionalTerms}</p>
                    </div>
                  )}

                  {offer.aiAnalysis && (
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium mb-2">AI Analysis:</div>
                      <p className="text-sm">{offer.aiAnalysis.recommendation}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">
                          Confidence: {Math.round(offer.aiAnalysis.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Accept Offer</Button>
                    <Button variant="outline" className="flex-1">Counter Offer</Button>
                    <Button variant="destructive" className="flex-1">Decline</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Offers */}
      {reviewedOffers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Reviewed Offers</h3>
          
          <div className="grid gap-4">
            {reviewedOffers.map((offer: any) => (
              <Card key={offer._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {formatPrice(offer.offerAmount)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        From {offer.buyer?.buyerName || 'Anonymous'} • {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(offer.status)}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Down Payment</div>
                      <div className="font-medium">{formatPrice(offer.downPayment)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Financing</div>
                      <div className="font-medium capitalize">{offer.financingType}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Closing</div>
                      <div className="font-medium">{offer.closingDate || 'Flexible'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Updated</div>
                      <div className="font-medium">{new Date(offer.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {offers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
            <p className="text-muted-foreground">
              Offers will appear here when buyers submit them through their portal.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
