'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy } from 'lucide-react';

interface CreateListingFormProps {
  agentId: Id<'agents'>;
}

export function CreateListingForm({ agentId }: CreateListingFormProps) {
  const router = useRouter();
  const createListing = useMutation(api.listings.createListing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<Id<'listings'> | null>(null);

  const [formData, setFormData] = useState({
    mlsId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    lotSize: '',
    yearBuilt: '',
    propertyType: 'single-family',
    description: '',
    features: '',
    images: '',
    videos: '',
    virtualTourUrl: '',
    latitude: '',
    longitude: '',
  });

  const propertyTypes = [
    'single-family',
    'condo',
    'townhouse',
    'multi-family',
    'land',
    'commercial',
  ];

  const resetForm = () => {
    setFormData({
      mlsId: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      sqft: '',
      lotSize: '',
      yearBuilt: '',
      propertyType: 'single-family',
      description: '',
      features: '',
      images: '',
      videos: '',
      virtualTourUrl: '',
      latitude: '',
      longitude: '',
    });
  };

  const parseList = (value: string) =>
    value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please provide full address details.');
      return;
    }

    if (!formData.price || !formData.bedrooms || !formData.bathrooms || !formData.sqft) {
      toast.error('Price, bedrooms, bathrooms, and square footage are required.');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Latitude and longitude are required for mapping features.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createListing({
        agentId,
        mlsId: formData.mlsId || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        sqft: Number(formData.sqft),
        lotSize: formData.lotSize ? Number(formData.lotSize) : undefined,
        yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
        propertyType: formData.propertyType,
        description: formData.description || 'Listing created from dashboard.',
        features: parseList(formData.features),
        images: parseList(formData.images),
        videos: formData.videos ? parseList(formData.videos) : undefined,
        virtualTourUrl: formData.virtualTourUrl || undefined,
        coordinates: {
          lat: Number(formData.latitude),
          lng: Number(formData.longitude),
        },
      });

      setCreatedListingId(result.listingId);
      toast.success('Listing created successfully!');
      resetForm();
    } catch (error: any) {
      console.error('Failed to create listing', error);
      toast.error(error?.message ?? 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdListingId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Listing Created</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your property is now available in your listings table. Share this listing with clients by adding it to their buyer sessions.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Listing ID</Label>
            <div className="flex gap-2">
              <Input readOnly value={createdListingId} className="font-mono" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(createdListingId);
                  toast.success('Listing ID copied to clipboard');
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this ID when referencing the listing elsewhere in the dashboard.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/listings')} className="flex-1">
              View Listings
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setCreatedListingId(null)}
            >
              Create Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mlsId">MLS ID</Label>
              <Input
                id="mlsId"
                value={formData.mlsId}
                onChange={(e) => setFormData((prev) => ({ ...prev, mlsId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                maxLength={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, propertyType: value }))}
              >
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                step="1"
                value={formData.bedrooms}
                onChange={(e) => setFormData((prev) => ({ ...prev, bedrooms: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData((prev) => ({ ...prev, bathrooms: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sqft">Square Footage *</Label>
              <Input
                id="sqft"
                type="number"
                min="0"
                value={formData.sqft}
                onChange={(e) => setFormData((prev) => ({ ...prev, sqft: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lotSize">Lot Size (sqft)</Label>
              <Input
                id="lotSize"
                type="number"
                min="0"
                value={formData.lotSize}
                onChange={(e) => setFormData((prev) => ({ ...prev, lotSize: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.yearBuilt}
                onChange={(e) => setFormData((prev) => ({ ...prev, yearBuilt: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Highlight key features, recent upgrades, or neighborhood perks."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma or newline separated)</Label>
              <Textarea
                id="features"
                rows={4}
                placeholder="Pool, Gourmet kitchen, Home office"
                value={formData.features}
                onChange={(e) => setFormData((prev) => ({ ...prev, features: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Image URLs (comma or newline separated)</Label>
              <Textarea
                id="images"
                rows={4}
                placeholder="https://example.com/photo.jpg"
                value={formData.images}
                onChange={(e) => setFormData((prev) => ({ ...prev, images: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="videos">Video URLs</Label>
              <Textarea
                id="videos"
                rows={3}
                placeholder="https://example.com/video.mp4"
                value={formData.videos}
                onChange={(e) => setFormData((prev) => ({ ...prev, videos: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
              <Input
                id="virtualTourUrl"
                value={formData.virtualTourUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, virtualTourUrl: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                value={formData.latitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                value={formData.longitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
