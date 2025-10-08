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
  const [fetchingStreetView, setFetchingStreetView] = useState(false);
  const [streetViewPhotos, setStreetViewPhotos] = useState<Id<'_storage'>[]>([]);

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
  const fetchAndEnhanceStreetView = useAction(api.listingAnalysis.fetchAndEnhanceStreetView);

  // Get current agent from Clerk user
  const agents = useQuery(api.agents.listActiveAgents);
  const currentAgent = agents?.find((a: any) => a.clerkUserId === user?.id);

  // Can submit with just address and price - Street View photos are optional but will be auto-generated
  const canSubmit = address && price;
  
  // Auto-fetch Street View when address is selected
  const handleAddressSelect = async (selectedAddress: any) => {
    setAddress(selectedAddress);
    
    // Auto-fetch Street View images if coordinates are available
    if (selectedAddress?.lat && selectedAddress?.lng) {
      setFetchingStreetView(true);
      try {
        console.log('📸 Fetching enhanced Street View images...');
        const result = await fetchAndEnhanceStreetView({
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
        });
        
        if (result.success && result.photos.length > 0) {
          setStreetViewPhotos(result.photos);
          console.log(`✅ Added ${result.photos.length} enhanced Street View photos`);
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch Street View images:', err);
        // Non-blocking - continue without Street View
      } finally {
        setFetchingStreetView(false);
      }
    }
  };

  const updateStepStatus = (stepIndex: number, status: StepStatus) => {
    setProcessingSteps(prev => prev.map((step, idx) => 
      idx === stepIndex ? { ...step, status } : step
    ));
  };

  const handleAnalyze = async () => {
    if (!canSubmit || !currentAgent) {
      console.log('❌ Cannot submit:', { canSubmit, hasAgent: !!currentAgent });
      return;
    }

    console.log('🚀 Starting listing analysis...', {
      address: address?.formatted,
      price,
      streetViewPhotos: streetViewPhotos.length,
      uploadedPhotos: photos.length,
      totalPhotos: streetViewPhotos.length + photos.length,
    });

    setError(null);
    setStep('processing');

    try {
      // Step 1: Create draft
      updateStepStatus(0, 'processing');
      console.log('📝 Creating draft for agent:', currentAgent._id);
      const newDraftId = await createDraft({ agentId: currentAgent._id });
      console.log('✅ Draft created:', newDraftId);
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

      // Step 4: Add photos (Street View + uploaded)
      const allPhotos = [...streetViewPhotos, ...photos];
      console.log('📸 Adding photos:', allPhotos.length, 'total');
      
      if (allPhotos.length > 0) {
        await addPhotos({
          draftId: newDraftId,
          photoIds: allPhotos,
        });
        console.log('✅ Photos added to draft');
      } else {
        console.log('⚠️ No photos to add - proceeding with minimal analysis');
      }

      // Step 5: Run AI analysis
      updateStepStatus(1, 'processing');
      updateStepStatus(2, 'processing');
      updateStepStatus(3, 'processing');
      updateStepStatus(4, 'processing');

      console.log('🤖 Running AI analysis...');
      const result = await analyzeDraft({ draftId: newDraftId });
      console.log('✅ AI analysis complete:', result);

      updateStepStatus(1, 'complete');
      updateStepStatus(2, 'complete');
      updateStepStatus(3, 'complete');
      updateStepStatus(4, 'complete');

      // Navigate to review page
      console.log('🎉 Navigating to review page...');
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
            onAddressSelect={handleAddressSelect}
            disabled={false}
          />

          {address && (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ Address validated
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {address.formatted}
                </p>
              </div>
              
              {fetchingStreetView && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Fetching and enhancing Street View images with AI...
                    </p>
                  </div>
                </div>
              )}
              
              {streetViewPhotos.length > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    ✨ {streetViewPhotos.length} AI-enhanced Street View photo{streetViewPhotos.length > 1 ? 's' : ''} added
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Professional exterior photos generated automatically
                  </p>
                </div>
              )}
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
            <Label>
              {streetViewPhotos.length > 0 
                ? `Additional Property Photos (${streetViewPhotos.length} Street View + ${photos.length} uploaded)`
                : 'Property Photos (Optional - AI will generate from Street View)'}
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              {streetViewPhotos.length > 0 
                ? '✨ We\'ve added enhanced Street View photos. Optionally upload interior photos for a more complete listing.'
                : 'Upload photos if available. If not, we\'ll automatically generate professional exterior photos from Google Street View when you enter the address.'}
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
          Please provide address and price to continue
          {streetViewPhotos.length > 0 && ' (photos added automatically)'}
        </p>
      )}
      
      {canSubmit && photos.length === 0 && streetViewPhotos.length === 0 && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
          💡 Tip: Street View photos will be generated automatically when you click "Analyze with AI"
        </p>
      )}
    </div>
  );
}
