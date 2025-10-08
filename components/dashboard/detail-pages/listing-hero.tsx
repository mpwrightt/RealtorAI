'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Bed, Bath, Maximize } from "lucide-react";
import Image from "next/image";

interface ListingHeroProps {
  listing: any;
}

export default function ListingHero({ listing }: ListingHeroProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'sold': return 'bg-blue-500';
      case 'withdrawn': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Image */}
          <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
            {listing.images?.[0] ? (
              <Image
                src={listing.images[0]}
                alt={listing.address}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Home className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{listing.address}</h1>
                <p className="text-muted-foreground text-lg">
                  {listing.city}, {listing.state} {listing.zipCode}
                </p>
              </div>
              <Badge className={getStatusColor(listing.status)}>
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </Badge>
            </div>

            <div className="text-4xl font-bold text-primary">
              {formatPrice(listing.price)}
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{listing.bedrooms} Beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{listing.bathrooms} Baths</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{listing.sqft.toLocaleString()} sqft</span>
              </div>
            </div>

            {listing.mlsId && (
              <p className="text-sm text-muted-foreground">
                MLS #: {listing.mlsId}
              </p>
            )}

            {listing.description && (
              <p className="text-sm line-clamp-3">{listing.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
