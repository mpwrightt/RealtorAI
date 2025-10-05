import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import PropertyCard from "@/components/buyer/property-card";
import PropertyFilters from "@/components/buyer/property-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";

export const metadata = {
  title: 'Browse Properties - Property Portal',
  description: 'Browse all available properties',
};

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionCode: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await params and searchParams (Next.js 15 requirement)
  const { sessionCode } = await params;
  const searchParamsResolved = await searchParams;
  
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode }
  );

  if (!session) {
    return <div>Session not found</div>;
  }

  // Parse search params for filtering
  const filters = {
    minPrice: searchParamsResolved.minPrice ? Number(searchParamsResolved.minPrice) : undefined,
    maxPrice: searchParamsResolved.maxPrice ? Number(searchParamsResolved.maxPrice) : undefined,
    bedrooms: searchParamsResolved.bedrooms ? Number(searchParamsResolved.bedrooms) : undefined,
    bathrooms: searchParamsResolved.bathrooms ? Number(searchParamsResolved.bathrooms) : undefined,
    cities: searchParamsResolved.cities 
      ? (Array.isArray(searchParamsResolved.cities) ? searchParamsResolved.cities : [searchParamsResolved.cities])
      : undefined,
    propertyTypes: searchParamsResolved.propertyTypes
      ? (Array.isArray(searchParamsResolved.propertyTypes) ? searchParamsResolved.propertyTypes : [searchParamsResolved.propertyTypes])
      : undefined,
  };

  const listings = await fetchQuery(
    api.listings.searchListings,
    {
      ...filters,
      status: "active",
    }
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Browse Properties</h2>
        <p className="text-muted-foreground">
          {listings.length} properties available
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <PropertyFilters 
            sessionCode={sessionCode}
            currentFilters={filters}
            preferences={session.preferences ? {
              minPrice: session.preferences.minPrice as number | undefined,
              maxPrice: session.preferences.maxPrice as number | undefined,
              bedrooms: session.preferences.bedrooms as number | undefined,
              bathrooms: session.preferences.bathrooms as number | undefined,
              propertyTypes: (session.preferences.propertyTypes || []) as string[],
              cities: (session.preferences.cities || []) as string[],
              mustHaveFeatures: (session.preferences.mustHaveFeatures || []) as string[],
            } : {
              minPrice: undefined,
              maxPrice: undefined,
              bedrooms: undefined,
              bathrooms: undefined,
              propertyTypes: [],
              cities: [],
              mustHaveFeatures: [],
            }}
          />
        </aside>
        
        <div className="lg:col-span-3">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing: any) => (
                <PropertyCard
                  key={listing._id}
                  listing={{
                    _id: listing._id as string,
                    address: listing.address as string,
                    city: listing.city as string,
                    state: listing.state as string,
                    zipCode: listing.zipCode as string,
                    price: listing.price as number,
                    bedrooms: listing.bedrooms as number,
                    bathrooms: listing.bathrooms as number,
                    sqft: listing.sqft as number,
                    propertyType: listing.propertyType as string,
                    images: listing.images as string[],
                    status: listing.status as string,
                  }}
                  sessionCode={sessionCode}
                  sessionId={session._id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to see more results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
