import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: 'Your Offers - Property Portal',
  description: 'View and manage your property offers',
};

export default async function OffersPage({
  params,
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode }
  );

  if (!session) {
    return <div>Session not found</div>;
  }

  const offers = await fetchQuery(
    api.offers.getOffersByBuyerSession,
    { buyerSessionId: session._id }
  );

  // Fetch listing details for each offer
  const offersWithListings = await Promise.all(
    offers.map(async (offer: any) => {
      const listing = await fetchQuery(
        api.listings.getListingById,
        { listingId: offer.listingId }
      );
      return { ...offer, listing };
    })
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Your Offers</h2>
          <p className="text-muted-foreground">
            {offers.length} offer{offers.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
      </div>

      {offersWithListings.length > 0 ? (
        <div className="grid gap-6">
          {offersWithListings.map((offer: any) => (
            <Card key={offer._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {offer.listing?.address}, {offer.listing?.city}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Submitted {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(offer.status)}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Offer Amount</div>
                      <div className="font-semibold text-lg">
                        ${offer.offerAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Down Payment</div>
                      <div className="font-semibold text-lg">
                        ${offer.downPayment.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Closing Date</div>
                      <div className="font-semibold text-lg">
                        {offer.closingDate || 'Flexible'}
                      </div>
                    </div>
                  </div>
                </div>

                {offer.contingencies && offer.contingencies.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Contingencies:</div>
                    <div className="flex flex-wrap gap-2">
                      {offer.contingencies.map((contingency: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {contingency}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {offer.aiAnalysis && (
                  <div className="border-t pt-4 mt-4">
                    <div className="text-sm font-medium mb-2">AI Analysis:</div>
                    <p className="text-sm text-muted-foreground">
                      {offer.aiAnalysis.recommendation}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/buyer/${sessionCode}/properties/${offer.listingId}`}>
                    <Button variant="outline">View Property</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
            <p className="text-muted-foreground mb-4">
              When you find a property you love, you can submit an offer here.
            </p>
            <Link href={`/buyer/${sessionCode}`}>
              <Button>Browse Properties</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
