'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Eye, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Image from 'next/image';

interface Alert {
  _id: Id<"alerts">;
  savedSearchId: Id<"savedSearches">;
  newListingIds: Id<"listings">[];
  notified: boolean;
  createdAt: number;
  savedSearch: {
    searchName: string;
    criteria: any;
  } | null;
  listings: any[];
}

interface AlertListProps {
  alerts: Alert[];
  sessionCode: string;
}

export default function AlertList({ alerts, sessionCode }: AlertListProps) {
  const markAsNotified = useMutation(api.alerts.markAlertAsNotified);
  const markAllAsRead = useMutation(api.alerts.markAllAlertsAsRead);
  
  const handleMarkAsRead = async (alertId: Id<"alerts">) => {
    await markAsNotified({ alertId });
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert._id} className={!alert.notified ? 'border-primary' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Bell className={`h-5 w-5 mt-0.5 ${!alert.notified ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <CardTitle className="text-lg">
                    {alert.listings.length} new {alert.listings.length === 1 ? 'property' : 'properties'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alert.savedSearch ? `Matching "${alert.savedSearch.searchName}" • ` : ''}
                    {formatDate(alert.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!alert.notified && (
                  <Badge variant="default">New</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alert.listings.slice(0, 4).map((listing) => (
                <Link
                  key={listing._id}
                  href={`/buyer/${sessionCode}/properties/${listing._id}`}
                  className="block group"
                >
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-40">
                      {listing.images?.[0] ? (
                        <Image
                          src={listing.images[0]}
                          alt={listing.address}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-full bg-muted flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-lg">
                        ${listing.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {listing.address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {listing.bedrooms} bd • {listing.bathrooms} ba • {listing.sqft.toLocaleString()} sqft
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {alert.listings.length > 4 && (
              <p className="text-sm text-muted-foreground text-center">
                + {alert.listings.length - 4} more {alert.listings.length - 4 === 1 ? 'property' : 'properties'}
              </p>
            )}
            
            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Link href={`/buyer/${sessionCode}/properties`} className="flex-1">
                <Button variant="default" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Properties
                </Button>
              </Link>
              {!alert.notified && (
                <Button
                  variant="outline"
                  onClick={() => handleMarkAsRead(alert._id)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
