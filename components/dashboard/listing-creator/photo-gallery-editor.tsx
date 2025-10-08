'use client';

import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GripVertical, Star } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PhotoAnalysis {
  storageId: Id<'_storage'>;
  roomType: string;
  features: string[];
  qualityScore: number;
  suggestedUse: string;
  order: number;
}

interface PhotoGalleryEditorProps {
  photos: PhotoAnalysis[];
  onReorder: (photos: PhotoAnalysis[]) => void;
  suggestedCover?: Id<'_storage'>;
  disabled?: boolean;
}

function SortablePhoto({ photo, isCover }: { photo: PhotoAnalysis; isCover: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: photo.storageId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get photo URL (simplified - in production you'd query Convex storage)
  const photoUrl = `/api/storage/${photo.storageId}`;

  const formatRoomType = (type: string) => {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square"
    >
      <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-muted">
        <div className="relative w-full h-full bg-muted">
          {/* Placeholder - in production use actual image */}
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Photo {photo.order + 1}</span>
          </div>
        </div>
        
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Cover Badge */}
        {isCover && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-yellow-950 gap-1">
              <Star className="h-3 w-3 fill-current" />
              Cover
            </Badge>
          </div>
        )}

        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/90 to-transparent">
          <div className="space-y-1">
            <Badge variant="secondary" className="text-xs">
              {formatRoomType(photo.roomType)}
            </Badge>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Quality:</span>
              <div className="flex gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-1 rounded-full ${
                      i < photo.qualityScore ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium">{photo.qualityScore}/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PhotoGalleryEditor({
  photos,
  onReorder,
  suggestedCover,
  disabled,
}: PhotoGalleryEditorProps) {
  const [orderedPhotos, setOrderedPhotos] = useState(photos);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedPhotos.findIndex(p => p.storageId === active.id);
      const newIndex = orderedPhotos.findIndex(p => p.storageId === over.id);

      const newOrder = arrayMove(orderedPhotos, oldIndex, newIndex).map((photo, idx) => ({
        ...photo,
        order: idx,
      }));

      setOrderedPhotos(newOrder);
      onReorder(newOrder);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Photo Gallery ({photos.length} photos)</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Drag photos to reorder. First photo will be the cover image.
          </p>
        </div>
        {suggestedCover && (
          <Badge variant="outline" className="gap-1">
            <Star className="h-3 w-3" />
            AI suggested cover photo
          </Badge>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedPhotos.map(p => p.storageId)}
          strategy={rectSortingStrategy}
          disabled={disabled}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {orderedPhotos.map((photo, index) => (
              <SortablePhoto
                key={photo.storageId}
                photo={photo}
                isCover={index === 0}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
        <p className="font-medium mb-1">AI Photo Analysis:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
          <li>Photos have been automatically categorized by room type</li>
          <li>Quality scores help identify the best photos</li>
          <li>Suggested cover photo is based on exterior views and quality</li>
          <li>Drag to reorder - first photo will be the main listing image</li>
        </ul>
      </div>
    </div>
  );
}
