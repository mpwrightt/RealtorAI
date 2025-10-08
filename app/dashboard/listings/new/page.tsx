'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import AddressInput from '@/components/dashboard/listing-creator/address-input';
import PhotoUploader from '@/components/dashboard/listing-creator/photo-uploader';
import ProcessingLoader from '@/components/dashboard/listing-creator/processing-loader';
import { useUser } from '@clerk/nextjs';

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useUser();
  
  const [step, setStep] = useState<'input' | 'processing' | 'error'>('input');
  const [address, setAddress] = useState<any>(null);
  const [price, setPrice] = useState('');
  const [photos, setPhotos] = useState<Id<'_storage'>[]>([]);
  const [draftId, setDraftId] = useState<Id<'listingDrafts'> | null>(null);
  const [error, setError] = useState<string | null>(null);

  type StepStatus = 'pending' | 'processing' | 'complete';
  const [processingSteps, setProcessingSteps] = useState<Array<{ label: string; status: StepStatus }>>([
    { label: 'Address validated', status: 'pending' },
    { label: 'Analyzing photos with AI', status: 'pending' },
    { label: 'Detecting rooms and features', status: 'pending' },
    { label: 'Generating property description', status: 'pending' },
    { label: 'Finalizing listing details', status: 'pending' },
  ]);

  const createDraft = useMutation(api.listingDrafts.createDraft);
  const updateDraftAddress = useMutation(api.listingDrafts.updateDraftAddress);
  const updateDraftPrice = useMutation(api.listingDrafts.updateDraftPrice);
  const addPhotos = useMutation(api.listingDrafts.addPhotos);
  const analyzeDraft = useAction(api.listingAnalysis.analyzeListingDraft);

  // Get current agent from Clerk user
  const agents = useQuery(api.agents.listActiveAgents);
  const currentAgent = agents?.find((a: any) => a.clerkUserId === user?.id);

  const canSubmit = address && price && photos.length > 0;

  const updateStepStatus = (stepIndex: number, status: StepStatus) => {
    setProcessingSteps(prev => prev.map((step, idx) => 
      idx === stepIndex ? { ...step, status } : step
    ));
  };

  const handleAnalyze = async () => {
    if (!canSubmit || !currentAgent) return;

    setError(null);
    setStep('processing');

    try {
      // Step 1: Create draft
      updateStepStatus(0, 'processing');
      const newDraftId = await createDraft({ agentId: currentAgent._id });
      setDraftId(newDraftId);

      // Step 2: Update address
      await updateDraftAddress({
        draftId: newDraftId,
        address: address.formatted,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        coordinates: { lat: address.lat, lng: address.lng },
      });
      updateStepStatus(0, 'complete');

      // Step 3: Update price
      await updateDraftPrice({
        draftId: newDraftId,
        price: parseFloat(price),
      });

      // Step 4: Add photos
      await addPhotos({
        draftId: newDraftId,
        photoIds: photos,
      });

      // Step 5: Run AI analysis
      updateStepStatus(1, 'processing');
      updateStepStatus(2, 'processing');
      updateStepStatus(3, 'processing');
      updateStepStatus(4, 'processing');

      const result = await analyzeDraft({ draftId: newDraftId });

      updateStepStatus(1, 'complete');
      updateStepStatus(2, 'complete');
      updateStepStatus(3, 'complete');
      updateStepStatus(4, 'complete');

      // Navigate to review page
      setTimeout(() => {
        router.push(`/dashboard/listings/new/review?draftId=${newDraftId}`);
      }, 1000);

    } catch (err: any) {
      console.error('Error analyzing listing:', err);
      setError(err.message || 'Failed to analyze listing. Please try again.');
      setStep('error');
    }
  };

  if (step === 'processing') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/listings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Creating Your Listing</h1>
            <p className="text-muted-foreground">Please wait while AI analyzes your property</p>
          </div>
        </div>

        <ProcessingLoader steps={processingSteps} />
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/listings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Error</h1>
            <p className="text-muted-foreground">Something went wrong</p>
          </div>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Analysis Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setStep('input')} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/listings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Add New Listing</h1>
          <p className="text-muted-foreground">
            Let AI do the heavy lifting - just provide address, photos, and price
          </p>
        </div>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Provide basic information and AI will automatically detect property details,
            features, and generate a compelling description from your photos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address Input */}
          <AddressInput
            onAddressSelect={setAddress}
            disabled={false}
          />

          {address && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                ✓ Address validated
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {address.formatted}
              </p>
            </div>
          )}

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">Listing Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">$</span>
              <Input
                id="price"
                type="number"
                placeholder="500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the listing price in dollars
            </p>
          </div>

          {/* Photo Uploader */}
          <div className="space-y-2">
            <Label>Property Photos * (Recommended: 10-20 photos)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload photos and AI will automatically detect rooms, features, and suggest the best cover photo.
              Include exterior, interior rooms, and key features for best results.
            </p>
            <PhotoUploader
              onPhotosUploaded={setPhotos}
              maxPhotos={20}
              disabled={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/listings">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleAnalyze}
          disabled={!canSubmit}
          size="lg"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Analyze with AI
        </Button>
      </div>

      {!canSubmit && (
        <p className="text-sm text-muted-foreground text-center">
          Please provide address, price, and at least one photo to continue
        </p>
      )}
    </div>
  );
}
