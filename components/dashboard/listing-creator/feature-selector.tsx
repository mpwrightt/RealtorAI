'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Plus, X } from 'lucide-react';

interface FeatureSelectorProps {
  selectedFeatures: string[];
  onChange: (features: string[]) => void;
  disabled?: boolean;
}

export default function FeatureSelector({
  selectedFeatures,
  onChange,
  disabled,
}: FeatureSelectorProps) {
  const [customFeature, setCustomFeature] = useState('');

  const allFeatures = [
    'granite-countertops',
    'hardwood-floors',
    'stainless-appliances',
    'fireplace',
    'crown-molding',
    'high-ceilings',
    'updated-kitchen',
    'updated-bathroom',
    'walk-in-closet',
    'deck',
    'patio',
    'pool',
    'garage',
    'central-air',
    'washer-dryer',
    'dishwasher',
    'refrigerator',
    'smart-home',
    'security-system',
    'fenced-yard',
  ];

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      onChange(selectedFeatures.filter(f => f !== feature));
    } else {
      onChange([...selectedFeatures, feature]);
    }
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      onChange([...selectedFeatures, customFeature.trim().toLowerCase().replace(/\s+/g, '-')]);
      setCustomFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    onChange(selectedFeatures.filter(f => f !== feature));
  };

  const formatFeature = (feature: string) => {
    return feature.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>AI-Detected Features</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Click to select/deselect features. AI has detected these from your photos.
        </p>
        <div className="flex flex-wrap gap-2">
          {allFeatures.map(feature => {
            const isSelected = selectedFeatures.includes(feature);
            const isDetected = selectedFeatures.includes(feature);
            
            return (
              <Badge
                key={feature}
                variant={isSelected ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'bg-primary' : 'hover:bg-muted'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && toggleFeature(feature)}
              >
                {isSelected && <Check className="h-3 w-3 mr-1" />}
                {formatFeature(feature)}
                {isDetected && !isSelected && (
                  <span className="ml-1 text-xs">✨</span>
                )}
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Selected Features ({selectedFeatures.length})</Label>
        <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-3 border rounded-lg">
          {selectedFeatures.length === 0 ? (
            <p className="text-sm text-muted-foreground">No features selected</p>
          ) : (
            selectedFeatures.map(feature => (
              <Badge
                key={feature}
                variant="secondary"
                className="gap-1"
              >
                {formatFeature(feature)}
                {!disabled && (
                  <button
                    onClick={() => removeFeature(feature)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div>
        <Label>Add Custom Feature</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="text"
            placeholder="e.g., Solar panels, Wine cellar..."
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomFeature()}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCustomFeature}
            disabled={!customFeature.trim() || disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
