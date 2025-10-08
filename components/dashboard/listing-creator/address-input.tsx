'use client';

import { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressInputProps {
  onAddressSelect: (address: {
    formatted: string;
    city: string;
    state: string;
    zipCode: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => void;
  disabled?: boolean;
}

export default function AddressInput({ onAddressSelect, disabled }: AddressInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ description: string; placeId: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const autocomplete = useAction(api.addressLookup.autocompleteAddress);
  const getDetails = useAction(api.addressLookup.getAddressDetails);

  useEffect(() => {
    // Don't fetch if user already selected an address
    if (selectedAddress) {
      return;
    }

    if (input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setApiError(false);
      try {
        const results = await autocomplete({ input });
        if (results.length === 0 && input.length >= 5) {
          setApiError(true);
        }
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setApiError(true);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500); // Increased delay to 500ms for less interruption

    return () => clearTimeout(timer);
  }, [input, autocomplete, selectedAddress]);

  const handleSelectAddress = async (placeId: string, description: string) => {
    setInput(description);
    setShowSuggestions(false);
    setSelectedAddress(true);
    setIsLoadingDetails(true);

    try {
      const details = await getDetails({ placeId });
      
      if (details) {
        onAddressSelect({
          formatted: details.address.formattedAddress,
          city: details.address.city || '',
          state: details.address.state || '',
          zipCode: details.address.zipCode || '',
          lat: details.address.lat,
          lng: details.address.lng,
          placeId: details.placeId,
        });
      }
    } catch (error) {
      console.error('Error getting address details:', error);
      setSelectedAddress(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    // If user is editing a selected address, allow new suggestions
    if (selectedAddress && value !== input) {
      setSelectedAddress(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0 && showSuggestions) {
      e.preventDefault();
      // Select first suggestion on Enter
      handleSelectAddress(suggestions[0].placeId, suggestions[0].description);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="address">Property Address *</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="address"
          type="text"
          placeholder="Start typing an address..."
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && !selectedAddress) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow click events to fire
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          disabled={disabled || isLoadingDetails}
          className={`pl-10 ${selectedAddress ? 'border-green-500' : ''}`}
        />
        {(loading || isLoadingDetails) && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {selectedAddress && !isLoadingDetails && (
          <div className="absolute right-3 top-3 h-4 w-4 text-green-500">✓</div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && !selectedAddress && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b">
            Press Enter to select first, or click to choose
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId}
              type="button"
              onMouseDown={(e) => {
                // Use onMouseDown instead of onClick to fire before onBlur
                e.preventDefault();
                handleSelectAddress(suggestion.placeId, suggestion.description);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0 ${
                index === 0 ? 'bg-muted/50' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm">{suggestion.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && input.length >= 3 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg p-4">
          {apiError ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">⚠️ Address autocomplete not available</p>
              <p className="text-xs text-muted-foreground">
                The Google Places API needs to be enabled. For now, you can type the full address manually 
                and we'll validate it.
              </p>
              <p className="text-xs text-muted-foreground">
                Admin: Enable Places API in Google Cloud Console and set up billing.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No addresses found. Try a different search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
