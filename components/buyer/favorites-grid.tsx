'use client';

import { useState } from 'react';
import PropertyCard from './property-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit, Trash2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface Favorite {
  _id: Id<"listings">;
  favoriteId: Id<"favorites">;
  favoriteNotes?: string;
  favoritedAt: number;
  address: string;
  [key: string]: any;
}

interface FavoritesGridProps {
  favorites: Favorite[];
  sessionCode: string;
  sessionId: Id<"buyerSessions">;
}

export default function FavoritesGrid({
  favorites,
  sessionCode,
  sessionId,
}: FavoritesGridProps) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const updateNotes = useMutation(api.favorites.updateFavoriteNotes);
  
  const handleRemove = async (listingId: Id<"listings">) => {
    if (!confirm('Remove this property from your favorites?')) return;
    
    await removeFavorite({
      buyerSessionId: sessionId,
      listingId,
    });
  };
  
  const handleUpdateNotes = async (favoriteId: Id<"favorites">) => {
    try {
      await updateNotes({
        favoriteId,
        notes,
      });
      setOpenDialog(null);
      setEditingNotes(null);
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('This favorite no longer exists. Please refresh the page.');
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite) => (
        <div key={favorite._id} className="relative">
          <PropertyCard
            listing={favorite}
            sessionCode={sessionCode}
            sessionId={sessionId}
            showFavoriteButton={true}
          />
          
          <div className="mt-3 space-y-2">
            {favorite.favoriteNotes && (
              <div className="text-sm p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Your notes:</p>
                <p className="whitespace-pre-wrap">{favorite.favoriteNotes}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Dialog open={openDialog === favorite._id} onOpenChange={(open) => setOpenDialog(open ? favorite._id : null)}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingNotes(favorite.favoriteId);
                      setNotes(favorite.favoriteNotes || '');
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {favorite.favoriteNotes ? 'Edit Notes' : 'Add Notes'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notes for {favorite.address}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes about this property..."
                      rows={5}
                    />
                    <Button
                      onClick={() => handleUpdateNotes(favorite.favoriteId)}
                      className="w-full"
                    >
                      Save Notes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(favorite._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
