'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, School, Footprints, Store, Home, Users, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';

interface NeighborhoodSummarySectionedProps {
  listingId: Id<"listings">;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  enrichedData?: {
    walkScore?: number;
    schoolRatings?: any;
    nearbyAmenities?: any[];
    crimeStats?: any;
    comps?: any[];
  };
}

export default function NeighborhoodSummarySectioned({ 
  listingId,
  address, 
  city, 
  state, 
  zipCode, 
  propertyType, 
  enrichedData 
}: NeighborhoodSummarySectionedProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const existingSummary = useQuery(api.neighborhoodSummary.getNeighborhoodSummary, { listingId });
  const generateSummary = useAction(api.neighborhoodSummary.generateNeighborhoodSummary);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await generateSummary({
        listingId,
        address,
        city,
        state,
        zipCode,
        propertyType,
        enrichedData: enrichedData ? {
          walkScore: enrichedData.walkScore,
          schoolRatings: enrichedData.schoolRatings,
          nearbyAmenities: enrichedData.nearbyAmenities,
          crimeStats: enrichedData.crimeStats,
          comps: enrichedData.comps,
        } : undefined,
      });
    } catch (error) {
      console.error('Error regenerating summary:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const sections = [
    {
      title: 'Property Location',
      icon: Home,
      content: existingSummary?.propertyContext,
      color: 'text-blue-600',
    },
    {
      title: 'Walkability & Transit',
      icon: Footprints,
      content: existingSummary?.walkabilityTransit,
      color: 'text-green-600',
    },
    {
      title: 'Amenities & Dining',
      icon: Store,
      content: existingSummary?.amenitiesDining,
      color: 'text-purple-600',
    },
    {
      title: 'Schools & Family',
      icon: School,
      content: existingSummary?.schoolsFamily,
      color: 'text-orange-600',
    },
    {
      title: 'Community & Lifestyle',
      icon: Users,
      content: existingSummary?.communityLifestyle,
      color: 'text-pink-600',
    },
  ];

  if (!existingSummary && !isRegenerating) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Neighborhood Summary
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Generate a detailed AI analysis of this neighborhood
            </p>
            <Button onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Neighborhood Summary
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Section Cards */}
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className={`h-4 w-4 ${section.color}`} />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isRegenerating ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {section.content}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {existingSummary && (
        <p className="text-xs text-center text-muted-foreground">
          Generated {new Date(existingSummary.generatedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
