import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import PropertyCard from "@/components/buyer/property-card";
import DashboardAIAssistant from "@/components/buyer/dashboard-ai-assistant";
import PreQualificationTracker from "@/components/buyer/pre-qualification-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Heart, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: 'Property Portal - Dashboard',
  description: 'Your personalized property search dashboard',
};

export default async function BuyerDashboard({
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
  
  const matchingListings = await fetchQuery(
    api.buyerSessions.getMatchingListings,
    { sessionId: session._id }
  );

  const offers = await fetchQuery(
    api.offers.getOffersByBuyerSession,
    { buyerSessionId: session._id }
  );
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {session.buyerName}!
        </h2>
        <p className="text-muted-foreground text-lg">
          We found {matchingListings.length} properties matching your preferences.
        </p>
      </section>

      {/* Pre-Qualification & AI Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardAIAssistant 
            sessionCode={sessionCode}
            sessionId={session._id}
          />
        </div>
        <div>
          <PreQualificationTracker 
            sessionId={session._id}
            preQualification={session.preQualification}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Matching Properties
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchingListings.length}</div>
            <p className="text-xs text-muted-foreground">
              Based on your preferences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Offers
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offers.filter((o: any) => o.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Saved Properties
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Properties you liked
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recommended Properties */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Recommended for You</h3>
          <Link href={`/buyer/${sessionCode}/properties`}>
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        
        {matchingListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingListings.slice(0, 6).map((listing: any) => (
              <PropertyCard
                key={listing._id}
                listing={listing}
                sessionCode={sessionCode}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matching properties yet</h3>
              <p className="text-muted-foreground mb-4">
                We'll notify you when new properties match your preferences.
              </p>
              <Link href={`/buyer/${sessionCode}/properties`}>
                <Button>Browse All Properties</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Your Preferences */}
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold">Your Preferences</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Price Range</div>
                <div className="font-semibold">
                  ${session.preferences.minPrice?.toLocaleString() || 'Any'} - ${session.preferences.maxPrice?.toLocaleString() || 'Any'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Bedrooms</div>
                <div className="font-semibold">{session.preferences.bedrooms || 'Any'}+</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Bathrooms</div>
                <div className="font-semibold">{session.preferences.bathrooms || 'Any'}+</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Cities</div>
                <div className="font-semibold">
                  {session.preferences.cities.length > 0 
                    ? session.preferences.cities.join(', ') 
                    : 'Any'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
