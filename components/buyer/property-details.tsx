import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Bed, Bath, Square, Calendar, Home, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyDetailsProps {
  listing: any;
}

export default function PropertyDetails({ listing }: PropertyDetailsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const pricePerSqft = Math.round(listing.price / listing.sqft);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="features">Features & Amenities</TabsTrigger>
        <TabsTrigger value="details">Property Details</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-3">About This Home</h3>
          <p className="text-muted-foreground leading-relaxed">
            {listing.description}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4">Property Highlights</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <Bed className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                  <div className="font-semibold">{listing.bedrooms}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Bath className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                  <div className="font-semibold">{listing.bathrooms}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Square className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Square Feet</div>
                  <div className="font-semibold">{listing.sqft.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Price/sqft</div>
                  <div className="font-semibold">${pricePerSqft}</div>
                </div>
              </div>

              {listing.lotSize && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Lot Size</div>
                    <div className="font-semibold">{listing.lotSize} acres</div>
                  </div>
                </div>
              )}

              {listing.yearBuilt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Year Built</div>
                    <div className="font-semibold">{listing.yearBuilt}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Property Type</div>
                  <div className="font-semibold capitalize">
                    {listing.propertyType.replace('-', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="features" className="space-y-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4">Features & Amenities</h4>
            {listing.features && listing.features.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {listing.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No features listed</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="details" className="space-y-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4">Property Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium">{listing.address}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">City</span>
                <span className="font-medium">{listing.city}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">State</span>
                <span className="font-medium">{listing.state}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">ZIP Code</span>
                <span className="font-medium">{listing.zipCode}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </Badge>
              </div>
              {listing.mlsId && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">MLS ID</span>
                  <span className="font-medium">{listing.mlsId}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
