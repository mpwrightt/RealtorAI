'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, School, Footprints, Store, Coffee, TrendingUp, Sparkles } from 'lucide-react';

interface NeighborhoodSummaryProps {
  address: string;
  city: string;
  state: string;
  enrichedData?: {
    walkScore?: number;
    schoolRatings?: any;
    nearbyAmenities?: any[];
  };
}

export default function NeighborhoodSummary({ address, city, state, enrichedData }: NeighborhoodSummaryProps) {
  // Generate AI-style summary based on available data
  const generateSummary = () => {
    const parts = [];
    
    // Walkability
    if (enrichedData?.walkScore) {
      const score = enrichedData.walkScore;
      if (score >= 90) {
        parts.push("This neighborhood is a walker's paradise with excellent walkability");
      } else if (score >= 70) {
        parts.push("Enjoy a very walkable neighborhood where most errands can be accomplished on foot");
      } else if (score >= 50) {
        parts.push("This area offers moderate walkability with some amenities within walking distance");
      } else {
        parts.push("This location is best navigated by car, with most errands requiring a vehicle");
      }
    }
    
    // Schools
    if (enrichedData?.schoolRatings?.elementary?.[0]) {
      const rating = enrichedData.schoolRatings.elementary[0].rating;
      if (rating >= 8) {
        parts.push("highly-rated schools nearby");
      } else if (rating >= 6) {
        parts.push("good schools in the area");
      }
    }
    
    // Amenities
    if (enrichedData?.nearbyAmenities && enrichedData.nearbyAmenities.length > 0) {
      const count = enrichedData.nearbyAmenities.length;
      if (count >= 10) {
        parts.push(`abundant local amenities with ${count}+ points of interest nearby`);
      } else if (count >= 5) {
        parts.push(`convenient access to ${count} local amenities`);
      }
    }
    
    if (parts.length === 0) {
      return `Located in ${city}, ${state}, this property offers a unique living opportunity in the area.`;
    }
    
    return `Located in ${city}, ${state}, this property features ${parts.join(", ")}.`;
  };

  const getWalkScoreDescription = (score: number) => {
    if (score >= 90) return "Walker's Paradise";
    if (score >= 70) return "Very Walkable";
    if (score >= 50) return "Somewhat Walkable";
    return "Car-Dependent";
  };

  const getWalkScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="space-y-4">
      {/* AI Summary Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Neighborhood Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {generateSummary()}
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Walk Score */}
        {enrichedData?.walkScore !== undefined && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Footprints className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Walk Score
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${getWalkScoreColor(enrichedData.walkScore)}`}>
                    {enrichedData.walkScore}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getWalkScoreDescription(enrichedData.walkScore)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schools */}
        {enrichedData?.schoolRatings?.elementary?.[0] && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Nearby School
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {enrichedData.schoolRatings.elementary[0].rating}
                    <span className="text-lg text-muted-foreground">/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {enrichedData.schoolRatings.elementary[0].name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Amenities Count */}
        {enrichedData?.nearbyAmenities && enrichedData.nearbyAmenities.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Nearby Places
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600">
                    {enrichedData.nearbyAmenities.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Points of interest
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Amenities List */}
      {enrichedData?.nearbyAmenities && enrichedData.nearbyAmenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What's Nearby</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {enrichedData.nearbyAmenities.slice(0, 8).map((amenity: any, index: number) => {
                const getAmenityIcon = (type: string) => {
                  if (type.toLowerCase().includes('school')) return School;
                  if (type.toLowerCase().includes('store') || type.toLowerCase().includes('shop')) return Store;
                  if (type.toLowerCase().includes('restaurant') || type.toLowerCase().includes('cafe')) return Coffee;
                  return MapPin;
                };
                
                const Icon = getAmenityIcon(amenity.type || '');
                
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{amenity.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {amenity.distance || 'Nearby'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {enrichedData.nearbyAmenities.length > 8 && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                + {enrichedData.nearbyAmenities.length - 8} more nearby places
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* School Details */}
      {enrichedData?.schoolRatings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <School className="h-5 w-5" />
              School Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrichedData.schoolRatings.elementary?.slice(0, 3).map((school: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{school.name}</p>
                    <p className="text-xs text-muted-foreground">Elementary School</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {school.rating}
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {school.rating >= 8 ? 'Excellent' : school.rating >= 6 ? 'Good' : 'Average'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
