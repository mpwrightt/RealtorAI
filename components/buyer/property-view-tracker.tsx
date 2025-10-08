'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface PropertyViewTrackerProps {
  listingId: Id<'listings'>;
  buyerSessionId: Id<'buyerSessions'>;
}

export default function PropertyViewTracker({
  listingId,
  buyerSessionId,
}: PropertyViewTrackerProps) {
  const trackView = useMutation(api.telemetry.trackPropertyView);
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    // Track when component unmounts (user leaves page)
    return () => {
      if (hasTrackedRef.current) return;
      
      const viewDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      // Only track if viewed for at least 1 second
      if (viewDuration >= 1) {
        hasTrackedRef.current = true;
        
        trackView({
          listingId,
          buyerSessionId,
          viewerType: 'buyer',
          viewDuration,
          imagesViewed: [], // Could enhance to track which images viewed
          videosWatched: [],
          sectionsVisited: ['details'], // Could enhance to track scroll
        }).catch((error) => {
          console.error('Failed to track property view:', error);
        });
      }
    };
  }, [listingId, buyerSessionId, trackView]);

  return null; // This component doesn't render anything
}
