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
          fields: ['address_components', 'formatted_address', 'geometry', 'types'],
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

      return {
        address: addressComponents,
        placeId,
        propertyType,
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
}

export function createGooglePlacesClient(): GooglePlacesClient {
  return new GooglePlacesClient();
}
