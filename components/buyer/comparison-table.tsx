'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface Listing {
  _id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  yearBuilt?: number;
  lotSize?: number;
  features?: string[];
}

interface ComparisonTableProps {
  listings: Listing[];
}

export default function ComparisonTable({ listings }: ComparisonTableProps) {
  // Extract all unique features
  const allFeatures = new Set<string>();
  listings.forEach((listing) => {
    listing.features?.forEach((f: string) => allFeatures.add(f));
  });
  
  const features = [
    { label: 'Price', getValue: (l: Listing) => `$${l.price.toLocaleString()}` },
    { label: 'Bedrooms', getValue: (l: Listing) => l.bedrooms.toString() },
    { label: 'Bathrooms', getValue: (l: Listing) => l.bathrooms.toString() },
    { label: 'Square Feet', getValue: (l: Listing) => l.sqft.toLocaleString() },
    { label: 'Price per sqft', getValue: (l: Listing) => `$${Math.round(l.price / l.sqft)}` },
    { label: 'Property Type', getValue: (l: Listing) => l.propertyType },
    { label: 'Year Built', getValue: (l: Listing) => l.yearBuilt?.toString() || 'N/A' },
    { label: 'Lot Size', getValue: (l: Listing) => l.lotSize ? `${l.lotSize} acres` : 'N/A' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Feature</th>
                {listings.map((listing, idx) => (
                  <th key={listing._id} className="text-center p-3 font-medium">
                    Property {idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.label} className="border-b hover:bg-muted/50">
                  <td className="p-3 text-muted-foreground">{feature.label}</td>
                  {listings.map((listing) => (
                    <td key={listing._id} className="p-3 text-center font-medium">
                      {feature.getValue(listing)}
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Feature checkboxes */}
              {Array.from(allFeatures).length > 0 && (
                <tr className="border-b">
                  <td colSpan={listings.length + 1} className="p-3 font-semibold bg-muted/30">
                    Property Features
                  </td>
                </tr>
              )}
              {Array.from(allFeatures).map((feature) => (
                <tr key={feature} className="border-b hover:bg-muted/50">
                  <td className="p-3 text-muted-foreground capitalize">{feature}</td>
                  {listings.map((listing) => (
                    <td key={listing._id} className="p-3 text-center">
                      {listing.features?.includes(feature) ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
