import { School, Footprints, Shield, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NeighborhoodInsightsProps {
  enrichedData: any;
}

export default function NeighborhoodInsights({ enrichedData }: NeighborhoodInsightsProps) {
  if (!enrichedData) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">Neighborhood Insights</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Walk Score */}
        {enrichedData.walkScore !== undefined && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 font-medium">
                <Footprints className="h-4 w-4 text-primary" />
                Walk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrichedData.walkScore}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {enrichedData.walkScore >= 90 && "Walker's Paradise"}
                {enrichedData.walkScore >= 70 && enrichedData.walkScore < 90 && "Very Walkable"}
                {enrichedData.walkScore >= 50 && enrichedData.walkScore < 70 && "Somewhat Walkable"}
                {enrichedData.walkScore < 50 && "Car-Dependent"}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Schools */}
        {enrichedData.schoolRatings && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 font-medium">
                <School className="h-4 w-4 text-primary" />
                Nearby Schools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enrichedData.schoolRatings.elementary?.[0] && (
                  <div>
                    <div className="text-2xl font-bold">
                      {enrichedData.schoolRatings.elementary[0].rating}/10
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {enrichedData.schoolRatings.elementary[0].name}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Nearby Amenities */}
        {enrichedData.nearbyAmenities && enrichedData.nearbyAmenities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                Nearby Places
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {enrichedData.nearbyAmenities.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Points of interest
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparables */}
        {enrichedData.comps && enrichedData.comps.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                Market Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrichedData.comps.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Recent comparables
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
