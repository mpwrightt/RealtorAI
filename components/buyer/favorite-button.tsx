'use client';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface FavoriteButtonProps {
  sessionId: Id<"buyerSessions">;
  listingId: Id<"listings">;
}

export default function FavoriteButton({ sessionId, listingId }: FavoriteButtonProps) {
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  
  const isFavorited = useQuery(
    api.favorites.isFavorite,
    { buyerSessionId: sessionId, listingId }
  );
  
  const handleToggle = async () => {
    console.log('✅ Favorite button clicked!', { sessionId, listingId, isFavorited });
    
    try {
      if (isFavorited) {
        console.log('🗑️ Removing favorite...');
        await removeFavorite({ buyerSessionId: sessionId, listingId });
        console.log('✅ Removed successfully!');
      } else {
        console.log('❤️ Adding favorite...');
        await addFavorite({ buyerSessionId: sessionId, listingId });
        console.log('✅ Added successfully! Check the Favorites page!');
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
    }
  };
  
  return (
    <Button 
      variant={isFavorited ? "default" : "outline"} 
      size="icon"
      onClick={handleToggle}
    >
      <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
    </Button>
  );
}
