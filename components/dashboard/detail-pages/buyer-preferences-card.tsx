'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Bed, Bath, Home, MapPin, Star } from "lucide-react";

interface BuyerPreferencesCardProps {
  preferences: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyTypes: string[];
    cities: string[];
    mustHaveFeatures: string[];
  };
}

export default function BuyerPreferencesCard({ preferences }: BuyerPreferencesCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buyer Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Range */}
        {preferences.minPrice && preferences.maxPrice && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Price Range</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatPrice(preferences.minPrice)}</span>
                <span>{formatPrice(preferences.maxPrice)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          {preferences.bedrooms && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Bedrooms</span>
              </div>
              <p className="text-lg font-bold">{preferences.bedrooms}+ beds</p>
            </div>
          )}
          {preferences.bathrooms && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Bathrooms</span>
              </div>
              <p className="text-lg font-bold">{preferences.bathrooms}+ baths</p>
            </div>
          )}
        </div>

        {/* Property Types */}
        {preferences.propertyTypes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Property Types</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.propertyTypes.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Cities */}
        {preferences.cities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preferred Locations</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.cities.map((city) => (
                <Badge key={city} variant="outline">
                  {city}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Must-Have Features */}
        {preferences.mustHaveFeatures.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Must-Have Features</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.mustHaveFeatures.map((feature) => (
                <Badge key={feature} variant="default">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
