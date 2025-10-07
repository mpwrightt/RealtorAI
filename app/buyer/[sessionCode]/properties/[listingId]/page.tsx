import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import PropertyGallery from "@/components/buyer/property-gallery";
import PropertyDetails from "@/components/buyer/property-details";
import NeighborhoodInsights from "@/components/buyer/neighborhood-insights";
import NeighborhoodSummary from "@/components/buyer/neighborhood-summary";
import MortgageCalculator from "@/components/buyer/mortgage-calculator";
import EnhancedChatWidget from "@/components/ag-ui/enhanced-chat-widget";
import FavoriteButton from "@/components/buyer/favorite-button";
import { Button } from "@/components/ui/button";
import { Share2, MapPin, FileText, Calendar } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  
  try {
    const listing = await fetchQuery(api.listings.getListingById, {
      listingId: listingId as Id<"listings">,
    });

    return {
      title: `${listing?.address} - Property Portal`,
      description: listing?.description,
    };
  } catch {
    return {
      title: 'Property Details',
    };
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ sessionCode: string; listingId: string }>;
}) {
  const { sessionCode, listingId } = await params;
  
  const session = await fetchQuery(api.buyerSessions.getBuyerSessionByCode, {
    sessionCode,
  });
  
  const listing = await fetchQuery(api.listings.getListingById, {
    listingId: listingId as Id<"listings">,
  });
  
  if (!listing || !session) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{formatPrice(listing.price)}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-lg">
              {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">{listing.bedrooms} beds</span>
            <span>•</span>
            <span className="font-medium">{listing.bathrooms} baths</span>
            <span>•</span>
            <span className="font-medium">{listing.sqft.toLocaleString()} sqft</span>
            <span>•</span>
            <span className="font-medium capitalize">{listing.propertyType.replace('-', ' ')}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <FavoriteButton 
            sessionId={session._id} 
            listingId={listingId as Id<"listings">}
          />
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Photo Gallery */}
      <PropertyGallery 
        images={listing.images} 
        videos={listing.videos}
        address={listing.address}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <PropertyDetails listing={listing} />
          
          {/* Enhanced Neighborhood Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Neighborhood</h2>
            <NeighborhoodSummary 
              address={listing.address}
              city={listing.city}
              state={listing.state}
              zipCode={listing.zipCode}
              propertyType={listing.propertyType}
              enrichedData={listing.enrichedData}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <MortgageCalculator listingPrice={listing.price} />
          
          <Link href={`/buyer/${sessionCode}/properties/${listingId}/schedule-tour`}>
            <Button className="w-full" size="lg" variant="outline">
              <Calendar className="h-5 w-5 mr-2" />
              Schedule a Tour
            </Button>
          </Link>
          
          <Link href={`/buyer/${sessionCode}/properties/${listingId}/make-offer`}>
            <Button className="w-full" size="lg" variant="default">
              <FileText className="h-5 w-5 mr-2" />
              Make an Offer
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced AG-UI Chat Widget */}
      <EnhancedChatWidget 
        sessionId={sessionCode}
        context={{
          listingId: listingId as string,
          address: listing.address as string,
          city: listing.city as string,
          state: listing.state as string,
          price: listing.price as number,
          bedrooms: listing.bedrooms as number,
          bathrooms: listing.bathrooms as number,
          sqft: listing.sqft as number,
          coordinates: {
            lat: listing.coordinates?.lat as number,
            lng: listing.coordinates?.lng as number,
          },
        }}
      />
    </div>
  );
}
