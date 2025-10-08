import { Client } from "@googlemaps/google-maps-services-js";

export interface AddressComponents {
  streetNumber?: string;
  route?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

export interface PropertyDetails {
  address: AddressComponents;
  placeId: string;
  propertyType?: string;
  nearbyAmenities?: string[];
  photos?: Array<{
    photoReference: string;
    height: number;
    width: number;
    url?: string;
  }>;
  streetViewUrl?: string;
}

export class GooglePlacesClient {
  private client: Client;
  private apiKey: string;

  constructor() {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY environment variable is required');
    }

    this.client = new Client({});
    this.apiKey = apiKey;
  }

  async autocompleteAddress(input: string): Promise<Array<{
    description: string;
    placeId: string;
  }>> {
    try {
      const response = await this.client.placeAutocomplete({
        params: {
          input,
          key: this.apiKey,
          types: 'address' as any,
        },
      });

      return response.data.predictions.map(pred => ({
        description: pred.description,
        placeId: pred.place_id,
      }));
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.error('❌ Google Places API Error: API not enabled or billing not set up');
        console.error('To fix this:');
        console.error('1. Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
        console.error('2. Enable the Places API');
        console.error('3. Set up billing for your project');
        console.error('4. Wait a few minutes for changes to propagate');
      } else {
        console.error('Error in address autocomplete:', error.message);
      }
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<PropertyDetails | null> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: ['address_components', 'formatted_address', 'geometry', 'types', 'photos'],
        },
      });

      const result = response.data.result;
      
      if (!result) {
        return null;
      }

      // Parse address components
      const addressComponents: AddressComponents = {
        formattedAddress: result.formatted_address || '',
        lat: result.geometry?.location.lat || 0,
        lng: result.geometry?.location.lng || 0,
      };

      result.address_components?.forEach(component => {
        const types = component.types as string[];
        if (types.includes('street_number')) {
          addressComponents.streetNumber = component.long_name;
        } else if (types.includes('route')) {
          addressComponents.route = component.long_name;
        } else if (types.includes('locality')) {
          addressComponents.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          addressComponents.state = component.short_name;
        } else if (types.includes('postal_code')) {
          addressComponents.zipCode = component.long_name;
        } else if (types.includes('country')) {
          addressComponents.country = component.long_name;
        }
      });

      // Determine property type from place types
      let propertyType = 'single-family';
      const types = result.types as string[] || [];
      if (types.includes('apartment')) {
        propertyType = 'condo';
      } else if (types.includes('house')) {
        propertyType = 'single-family';
      }

      // Get photos from Google Places
      const photos = result.photos?.slice(0, 5).map(photo => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
        url: this.getPhotoUrl(photo.photo_reference, 1600), // High resolution
      })) || [];

      // Generate Street View URL
      const streetViewUrl = await this.getStreetViewUrl(
        addressComponents.lat,
        addressComponents.lng
      );

      return {
        address: addressComponents,
        placeId,
        propertyType,
        photos,
        streetViewUrl,
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  async geocodeAddress(address: string): Promise<AddressComponents | null> {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });

      const result = response.data.results[0];
      
      if (!result) {
        return null;
      }

      const addressComponents: AddressComponents = {
        formattedAddress: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      };

      result.address_components.forEach(component => {
        const types = component.types as string[];
        if (types.includes('street_number')) {
          addressComponents.streetNumber = component.long_name;
        } else if (types.includes('route')) {
          addressComponents.route = component.long_name;
        } else if (types.includes('locality')) {
          addressComponents.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          addressComponents.state = component.short_name;
        } else if (types.includes('postal_code')) {
          addressComponents.zipCode = component.long_name;
        } else if (types.includes('country')) {
          addressComponents.country = component.long_name;
        }
      });

      return addressComponents;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  async getNearbyAmenities(lat: number, lng: number, radius: number = 1000): Promise<string[]> {
    try {
      const response = await this.client.placesNearby({
        params: {
          location: { lat, lng },
          radius,
          key: this.apiKey,
        },
      });

      return response.data.results
        .slice(0, 10)
        .map(place => place.name || '')
        .filter(name => name.length > 0);
    } catch (error) {
      console.error('Error getting nearby amenities:', error);
      return [];
    }
  }

  // Get URL for a Google Places photo
  getPhotoUrl(photoReference: string, maxWidth: number = 1600): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  // Get Street View metadata to find best position and heading
  async getStreetViewMetadata(lat: number, lng: number, radius: number = 50): Promise<{
    location: { lat: number; lng: number };
    heading?: number;
    available: boolean;
  } | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&radius=${radius}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        return { location: { lat, lng }, available: false };
      }
      
      // Calculate heading from camera position to property
      const cameraLat = data.location.lat;
      const cameraLng = data.location.lng;
      
      // Calculate bearing from camera to property
      const heading = this.calculateBearing(cameraLat, cameraLng, lat, lng);
      
      return {
        location: data.location,
        heading,
        available: true,
      };
    } catch (error) {
      console.error('Error getting Street View metadata:', error);
      return null;
    }
  }
  
  // Calculate bearing between two points
  private calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360
  }

  // Get Street View static image URL with smart heading
  async getStreetViewUrl(lat: number, lng: number, size: string = '1600x900'): Promise<string> {
    const metadata = await this.getStreetViewMetadata(lat, lng);
    const heading = metadata?.heading || 0;
    const location = metadata?.location || { lat, lng };
    
    return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${location.lat},${location.lng}&fov=80&heading=${Math.round(heading)}&pitch=10&key=${this.apiKey}`;
  }

  // Get multiple Street View angles around the property
  async getStreetViewAngles(lat: number, lng: number): Promise<Array<{ heading: number; url: string; description: string }>> {
    const metadata = await this.getStreetViewMetadata(lat, lng);
    
    if (!metadata?.available) {
      return [];
    }
    
    const baseHeading = metadata.heading || 0;
    const location = metadata.location;
    
    // Get views from slightly different angles around the main heading
    const angles = [
      { offset: 0, description: 'Front view' },
      { offset: 30, description: 'Front-right angle' },
      { offset: -30, description: 'Front-left angle' },
      { offset: 90, description: 'Side view (right)' },
    ];
    
    return angles.map(({ offset, description }) => ({
      heading: Math.round((baseHeading + offset + 360) % 360),
      url: `https://maps.googleapis.com/maps/api/streetview?size=1600x900&location=${location.lat},${location.lng}&fov=80&heading=${Math.round((baseHeading + offset + 360) % 360)}&pitch=10&key=${this.apiKey}`,
      description,
    }));
  }
  
  // Get satellite/aerial image of property
  // Zoom 21 is maximum for satellite imagery (most detailed)
  getStaticMapUrl(lat: number, lng: number, zoom: number = 21, size: string = '1600x900'): string {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=satellite&key=${this.apiKey}`;
  }

  // Get multiple satellite zoom levels for better enhancement
  getMultiZoomSatelliteUrls(lat: number, lng: number): Array<{ url: string; zoom: number; description: string }> {
    return [
      {
        url: this.getStaticMapUrl(lat, lng, 21), // Maximum detail
        zoom: 21,
        description: 'Close-up aerial view'
      },
      {
        url: this.getStaticMapUrl(lat, lng, 20), // Slightly wider
        zoom: 20,
        description: 'Property context view'
      },
    ];
  }
}

export function createGooglePlacesClient(): GooglePlacesClient {
  return new GooglePlacesClient();
}
