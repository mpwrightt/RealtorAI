'use node';

import { v } from "convex/values";
import { action } from "./_generated/server";

// Autocomplete address as user types
export const autocompleteAddress = action({
  args: {
    input: v.string(),
  },
  handler: async (ctx, args): Promise<Array<{
    description: string;
    placeId: string;
  }>> => {
    const { createGooglePlacesClient } = await import('../lib/google-places/client');
    const client = createGooglePlacesClient();
    
    return await client.autocompleteAddress(args.input);
  },
});

// Get full details for a selected address
export const getAddressDetails = action({
  args: {
    placeId: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log('📍 Looking up address details for place:', args.placeId);
    
    const { createGooglePlacesClient } = await import('../lib/google-places/client');
    const client = createGooglePlacesClient();
    
    const details = await client.getPlaceDetails(args.placeId);
    
    if (!details) {
      throw new Error('Address details not found');
    }
    
    console.log('✅ Address details retrieved:', details.address.formattedAddress);
    
    return details;
  },
});

// Geocode an address string directly
export const geocodeAddress = action({
  args: {
    address: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const { createGooglePlacesClient } = await import('../lib/google-places/client');
    const client = createGooglePlacesClient();
    
    return await client.geocodeAddress(args.address);
  },
});

// Get nearby amenities for a location
export const getNearbyAmenities = action({
  args: {
    lat: v.number(),
    lng: v.number(),
    radius: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<string[]> => {
    const { createGooglePlacesClient } = await import('../lib/google-places/client');
    const client = createGooglePlacesClient();
    
    return await client.getNearbyAmenities(args.lat, args.lng, args.radius);
  },
});
