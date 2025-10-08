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

  const autocomplete = useAction(api.addressLookup.autocompleteAddress);
  const getDetails = useAction(api.addressLookup.getAddressDetails);

  useEffect(() => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await autocomplete({ input });
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input, autocomplete]);

  const handleSelectAddress = async (placeId: string, description: string) => {
    setInput(description);
    setShowSuggestions(false);
    setLoading(true);

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
    } finally {
      setLoading(false);
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
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          disabled={disabled || loading}
          className="pl-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              onClick={() => handleSelectAddress(suggestion.placeId, suggestion.description)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
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
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg p-4 text-sm text-muted-foreground">
          No addresses found. Try a different search.
        </div>
      )}
    </div>
  );
}
