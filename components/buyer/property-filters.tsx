'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface PropertyFiltersProps {
  sessionCode: string;
  currentFilters: any;
  preferences: any;
}

export default function PropertyFilters({
  sessionCode,
  currentFilters,
  preferences,
}: PropertyFiltersProps) {
  const router = useRouter();
  
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || preferences.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || preferences.maxPrice || '');
  const [bedrooms, setBedrooms] = useState(currentFilters.bedrooms || preferences.bedrooms || '');
  const [bathrooms, setBathrooms] = useState(currentFilters.bathrooms || preferences.bathrooms || '');
  
  const propertyTypes = ['single-family', 'condo', 'townhouse', 'multi-family'];
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    currentFilters.propertyTypes || preferences.propertyTypes || []
  );

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    
    if (minPrice) params.set('minPrice', minPrice.toString());
    if (maxPrice) params.set('maxPrice', maxPrice.toString());
    if (bedrooms) params.set('bedrooms', bedrooms.toString());
    if (bathrooms) params.set('bathrooms', bathrooms.toString());
    if (selectedTypes.length > 0) {
      selectedTypes.forEach(type => params.append('propertyTypes', type));
    }
    
    router.push(`/buyer/${sessionCode}/properties?${params.toString()}`);
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setSelectedTypes([]);
    router.push(`/buyer/${sessionCode}/properties`);
  };

  const togglePropertyType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Bedrooms */}
        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <Input
            type="number"
            placeholder="Min bedrooms"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
        </div>

        {/* Bathrooms */}
        <div className="space-y-2">
          <Label>Bathrooms</Label>
          <Input
            type="number"
            placeholder="Min bathrooms"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
          />
        </div>

        <Separator />

        {/* Property Types */}
        <div className="space-y-3">
          <Label>Property Type</Label>
          {propertyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => togglePropertyType(type)}
              />
              <label
                htmlFor={type}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {type.replace('-', ' ')}
              </label>
            </div>
          ))}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button className="w-full" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          <Button variant="outline" className="w-full" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
