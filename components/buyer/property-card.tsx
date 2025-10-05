'use client';

import Image from "next/image";
import Link from "next/link";
import { Heart, Bed, Bath, Square, MapPin, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface PropertyCardProps {
  listing: any;
  sessionCode: string;
  sessionId?: Id<"buyerSessions">;
  showMatchScore?: boolean;
  showFavoriteButton?: boolean;
}

export default function PropertyCard({
  listing,
  sessionCode,
  sessionId,
  showMatchScore = false,
  showFavoriteButton = true,
}: PropertyCardProps) {
  console.log('PropertyCard rendered with:', { 
    sessionCode, 
    sessionId, 
    showFavoriteButton,
    listingId: listing._id || (listing as any).id 
  });
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handle both _id (from Convex) and id (from search results)
  const listingId = listing._id || (listing as any).id;
  
  // Favorite functionality
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  
  const isFavorited = useQuery(
    api.favorites.isFavorite,
    sessionId && listingId ? {
      buyerSessionId: sessionId,
      listingId: listingId as Id<"listings">,
    } : "skip"
  );
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Heart clicked!', { sessionId, listingId, isFavorited });
    
    if (!sessionId || !listingId) {
      console.error('Missing sessionId or listingId:', { sessionId, listingId });
      return;
    }
    
    try {
      if (isFavorited) {
        console.log('Removing favorite...');
        await removeFavorite({
          buyerSessionId: sessionId,
          listingId: listingId as Id<"listings">,
        });
        console.log('Removed!');
      } else {
        console.log('Adding favorite...');
        await addFavorite({
          buyerSessionId: sessionId,
          listingId: listingId as Id<"listings">,
        });
        console.log('Added!');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all relative">
      {/* Favorite Button - OUTSIDE Link so clicks work */}
      <button
        type="button"
        className={`absolute top-2 right-2 p-2.5 rounded-full transition-all z-20 shadow-md ${
          isFavorited 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
            : 'bg-white/95 hover:bg-white text-muted-foreground hover:text-foreground'
        }`}
        onClick={handleToggleFavorite}
      >
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
      </button>
      
      {!sessionId && (
        <div className="absolute top-12 right-2 bg-red-500 text-white text-xs p-1 rounded z-20">
          No sessionId!
        </div>
      )}
      
      <Link href={`/buyer/${sessionCode}/properties/${listingId}`}>
        <div className="relative h-56 bg-muted">
          {listing.images && listing.images.length > 0 ? (
            <Image
              src={listing.images[0]}
              alt={listing.address}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Home className="h-12 w-12" />
            </div>
          )}
          
          {showMatchScore && listing.matchScore && (
            <Badge className="absolute top-2 left-2 bg-primary">
              {listing.matchScore}% Match
            </Badge>
          )}
        </div>
      </Link>
      
      <div className="p-4 space-y-3">
        <div>
          <div className="text-2xl font-bold text-primary">
            {formatPrice(listing.price)}
          </div>
          <div className="flex items-start gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">
              {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>{listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4 text-muted-foreground" />
            <span>{listing.sqft.toLocaleString()} sqft</span>
          </div>
        </div>

        {listing.features && listing.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.features.slice(0, 3).map((feature: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {listing.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{listing.features.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <Link href={`/buyer/${sessionCode}/properties/${listingId}`}>
          <Button className="w-full" variant="default">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
