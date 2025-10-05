'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PropertyGalleryProps {
  images: string[];
  videos: string[];
  address: string;
}

export default function PropertyGallery({ images, videos, address }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const allMedia = [...images, ...videos];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  if (allMedia.length === 0) {
    return (
      <div className="relative h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative h-[500px] group">
          <Image
            src={allMedia[currentIndex]}
            alt={`${address} - Photo ${currentIndex + 1}`}
            fill
            className="object-cover rounded-lg cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
            priority
          />
          
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
            onClick={() => setIsLightboxOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          {allMedia.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                onClick={goToPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {allMedia.length}
              </div>
            </>
          )}
        </div>
        
        {/* Thumbnail Strip */}
        {allMedia.length > 1 && (
          <div className="grid grid-cols-6 gap-2 overflow-x-auto">
            {allMedia.slice(0, 12).map((media, idx) => (
              <button
                key={idx}
                className={`relative h-20 rounded-md overflow-hidden ${
                  idx === currentIndex ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentIndex(idx)}
              >
                <Image
                  src={media}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
            {allMedia.length > 12 && (
              <button
                className="relative h-20 rounded-md overflow-hidden bg-muted flex items-center justify-center text-sm font-medium"
                onClick={() => setIsLightboxOpen(true)}
              >
                +{allMedia.length - 12}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <div className="relative w-full h-full">
            <Image
              src={allMedia[currentIndex]}
              alt={`${address} - Photo ${currentIndex + 1}`}
              fill
              className="object-contain"
            />

            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {allMedia.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={goToPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
                  {currentIndex + 1} / {allMedia.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
