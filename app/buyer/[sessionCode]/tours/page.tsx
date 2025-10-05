import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function ToursPage({
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
    redirect('/');
  }
  
  const tours = await fetchQuery(api.tours.getToursByBuyer, {
    buyerSessionId: session._id,
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tours</h1>
          <p className="text-muted-foreground mt-1">
            {tours.length} {tours.length === 1 ? 'tour' : 'tours'} scheduled
          </p>
        </div>
        <Link href={`/buyer/${sessionCode}`}>
          <Button>Browse Properties</Button>
        </Link>
      </div>
      
      {tours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tours.map((tour: any) => (
            <Card key={tour._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{tour.listing?.address || 'Property'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {tour.listing?.city && `${tour.listing.city}, ${tour.listing.state} ${tour.listing.zipCode}`}
                    </p>
                  </div>
                  <Badge className={getStatusColor(tour.status)}>
                    {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Image */}
                <div className="relative h-40 rounded-lg overflow-hidden">
                  {tour.listing?.images?.[0] ? (
                    <Image
                      src={tour.listing.images[0]}
                      alt={tour.listing.address || 'Property'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full bg-muted flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Tour Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(tour.requestedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{tour.timeSlot}</span>
                  </div>
                </div>
                
                {tour.notes && (
                  <div className="text-sm p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Your notes:</p>
                    <p>{tour.notes}</p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/buyer/${sessionCode}/properties/${tour.listingId}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Property
                    </Button>
                  </Link>
                  {tour.status === 'pending' && (
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No tours scheduled</h2>
            <p className="text-muted-foreground mb-6">
              When you find a property you love, schedule a tour to see it in person
            </p>
            <Link href={`/buyer/${sessionCode}`}>
              <Button>Browse Properties</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
