'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import EditableField from '@/components/dashboard/listing-creator/editable-field';
import FeatureSelector from '@/components/dashboard/listing-creator/feature-selector';
import DescriptionEditor from '@/components/dashboard/listing-creator/description-editor';
import PhotoGalleryEditor from '@/components/dashboard/listing-creator/photo-gallery-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUser } from '@clerk/nextjs';

function ReviewListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId') as Id<'listingDrafts'> | null;
  const { user } = useUser();

  const [saving, setSaving] = useState(false);
  const [propertyType, setPropertyType] = useState('single-family');
  
  const draft = useQuery(api.listingDrafts.getDraft, draftId ? { draftId } : 'skip');
  const updateOverrides = useMutation(api.listingDrafts.updateManualOverrides);
  const agents = useQuery(api.agents.listActiveAgents);
  const createListing = useMutation(api.listings.createListing);

  const currentAgent = agents?.find((a: any) => a.clerkUserId === user?.id);

  useEffect(() => {
    if (!draftId) {
      router.push('/dashboard/listings/new');
    }
  }, [draftId, router]);

  if (!draft || !draftId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Loading draft...</p>
        </div>
      </div>
    );
  }

  const aiAnalysis = draft.aiAnalysis;
  const manualOverrides = draft.manualOverrides || {};

  const bedrooms = manualOverrides.bedrooms ?? aiAnalysis?.bedrooms ?? 3;
  const bathrooms = manualOverrides.bathrooms ?? aiAnalysis?.bathrooms ?? 2;
  const sqft = manualOverrides.sqft ?? aiAnalysis?.sqft ?? 0;
  const features = manualOverrides.features ?? aiAnalysis?.features ?? [];
  const description = manualOverrides.description ?? aiAnalysis?.description ?? '';

  const handleSaveBedrooms = async (value: number | string) => {
    await updateOverrides({
      draftId,
      overrides: { bedrooms: Number(value) },
    });
  };

  const handleSaveBathrooms = async (value: number | string) => {
    await updateOverrides({
      draftId,
      overrides: { bathrooms: Number(value) },
    });
  };

  const handleSaveSqft = async (value: number | string) => {
    await updateOverrides({
      draftId,
      overrides: { sqft: Number(value) },
    });
  };

  const handleFeaturesChange = async (newFeatures: string[]) => {
    await updateOverrides({
      draftId,
      overrides: { features: newFeatures },
    });
  };

  const handleDescriptionChange = async (newDescription: string) => {
    await updateOverrides({
      draftId,
      overrides: { description: newDescription },
    });
  };

  const handlePublish = async () => {
    if (!currentAgent) return;

    setSaving(true);
    try {
      // Convert draft to listing
      await createListing({
        agentId: currentAgent._id,
        address: draft.address || '',
        city: draft.city || '',
        state: draft.state || '',
        zipCode: draft.zipCode || '',
        price: draft.price || 0,
        bedrooms,
        bathrooms,
        sqft,
        propertyType: manualOverrides.propertyType || propertyType,
        description,
        features,
        images: draft.photos.map(id => id.toString()),
        videos: [],
        coordinates: draft.coordinates || { lat: 0, lng: 0 },
      } as any);

      // Redirect to listings page
      router.push('/dashboard/listings');
    } catch (error) {
      console.error('Error publishing listing:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/listings/new">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Review & Publish</h1>
            <p className="text-muted-foreground">
              Review AI-generated details and make any adjustments
            </p>
          </div>
        </div>
        <Button onClick={handlePublish} disabled={saving} size="lg" className="gap-2">
          {saving ? (
            <>
              <Save className="h-4 w-4 animate-pulse" />
              Publishing...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Publish Listing
            </>
          )}
        </Button>
      </div>

      {/* AI Confidence Badge */}
      {aiAnalysis && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">AI Analysis Complete</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyzed {draft.photos.length} photos with {Math.round(aiAnalysis.confidence * 100)}% confidence.
                  Detected {aiAnalysis.features.length} features and categorized all rooms.
                  Review the details below and make any adjustments before publishing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
          <CardDescription>Click any field to edit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Bedrooms"
              value={bedrooms}
              onSave={handleSaveBedrooms}
              type="number"
            />
            <EditableField
              label="Bathrooms"
              value={bathrooms}
              onSave={handleSaveBathrooms}
              type="number"
            />
            <EditableField
              label="Square Feet"
              value={sqft || 0}
              onSave={handleSaveSqft}
              type="number"
              suffix=" sqft"
            />
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-family">Single Family</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="multi-family">Multi-Family</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">Address</p>
            <p className="text-muted-foreground">{draft.address}</p>
            <p className="text-sm text-muted-foreground">
              {draft.city}, {draft.state} {draft.zipCode}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Price</p>
            <p className="text-2xl font-bold">${draft.price?.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Property Features</CardTitle>
          <CardDescription>
            AI detected these features from your photos. Select or deselect as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureSelector
            selectedFeatures={features}
            onChange={handleFeaturesChange}
          />
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Property Description</CardTitle>
          <CardDescription>
            AI generated this description based on your photos and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DescriptionEditor
            description={description}
            onChange={handleDescriptionChange}
            draftId={draftId}
          />
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {aiAnalysis?.photoAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Photo Gallery</CardTitle>
            <CardDescription>
              Drag to reorder photos. First photo will be the cover image.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoGalleryEditor
              photos={aiAnalysis.photoAnalysis}
              onReorder={(photos) => {
                // Handle photo reordering if needed
                console.log('Photos reordered:', photos);
              }}
              suggestedCover={aiAnalysis.suggestedCoverPhoto}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
        <Link href="/dashboard/listings/new">
          <Button variant="outline">Back to Edit</Button>
        </Link>
        <Button onClick={handlePublish} disabled={saving} size="lg" className="gap-2">
          {saving ? (
            <>
              <Save className="h-4 w-4 animate-pulse" />
              Publishing...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Publish Listing
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function ReviewListingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Loading draft...</p>
        </div>
      </div>
    }>
      <ReviewListingContent />
    </Suspense>
  );
}
