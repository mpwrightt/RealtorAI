'use node';

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Orchestrate the complete AI analysis workflow
export const analyzeListingDraft = action({
  args: {
    draftId: v.id("listingDrafts"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    analysis: any;
  }> => {
    console.log('🤖 Starting AI analysis for draft:', args.draftId);
    
    // Get the draft
    const draft = await ctx.runQuery(api.listingDrafts.getDraft, {
      draftId: args.draftId,
    });

    if (!draft) {
      throw new Error('Draft not found');
    }

    // If no photos, return minimal analysis
    if (draft.photos.length === 0) {
      console.log('⚠️ No photos to analyze - returning minimal data');
      
      const minimalAnalysis = {
        bedrooms: 3, // Default estimate
        bathrooms: 2, // Default estimate
        sqft: 0,
        features: ['residential-property'],
        photoAnalysis: [],
        suggestedCoverPhoto: null,
        description: `Beautiful property located at ${draft.address || 'great location'}. Contact us for more details and to schedule a showing.`,
        confidence: 0.3, // Low confidence without photos
      };

      await ctx.runMutation(api.listingDrafts.updateDraftAnalysis, {
        draftId: args.draftId,
        analysis: minimalAnalysis as any,
      });

      return {
        success: true,
        analysis: minimalAnalysis,
      };
    }

    // Step 1: Analyze photos with Gemini
    console.log(`📸 Analyzing ${draft.photos.length} photos...`);
    const photoAnalysis = await ctx.runAction(api.gemini.analyzePropertyPhotos, {
      imageStorageIds: draft.photos,
    });

    // Step 2: Generate property insights
    console.log('💡 Generating property insights...');
    const insights = await ctx.runAction(api.gemini.generatePropertyInsights, {
      photoAnalysisSummary: photoAnalysis.summary,
    });

    // Step 3: Generate AI description
    console.log('✍️ Generating property description...');
    const description = await ctx.runAction(api.listingAnalysis.generateDescription, {
      address: draft.address || 'Property',
      city: draft.city || '',
      state: draft.state || '',
      price: draft.price || 0,
      bedrooms: insights.estimatedBedrooms,
      bathrooms: insights.estimatedBathrooms,
      features: photoAnalysis.summary.detectedFeatures,
      style: insights.style,
    });

    // Step 4: Order photos intelligently
    const orderedPhotos = photoAnalysis.photos
      .map((photo, idx) => ({
        storageId: photo.storageId,
        roomType: photo.analysis.roomType,
        features: photo.analysis.features,
        qualityScore: photo.analysis.qualityScore,
        suggestedUse: photo.analysis.suggestedUse,
        order: photo.analysis.suggestedUse === 'cover-photo' ? 0 : 
               photo.analysis.roomType === 'exterior' ? 1 :
               photo.analysis.roomType === 'living-room' ? 2 :
               photo.analysis.roomType === 'kitchen' ? 3 :
               photo.analysis.roomType === 'bedroom' ? 4 + idx :
               photo.analysis.roomType === 'bathroom' ? 100 + idx :
               500 + idx,
      }))
      .sort((a, b) => a.order - b.order)
      .map((photo, idx) => ({ ...photo, order: idx }));

    // Step 5: Save analysis to draft
    const analysisData = {
      bedrooms: insights.estimatedBedrooms,
      bathrooms: insights.estimatedBathrooms,
      sqft: 0, // Can't detect from photos, agent will fill in
      features: photoAnalysis.summary.detectedFeatures,
      photoAnalysis: orderedPhotos,
      suggestedCoverPhoto: photoAnalysis.summary.suggestedCoverPhoto as any,
      description,
      confidence: photoAnalysis.summary.averageQuality / 10,
    };

    await ctx.runMutation(api.listingDrafts.updateDraftAnalysis, {
      draftId: args.draftId,
      analysis: analysisData as any,
    });

    console.log('✅ AI analysis complete!');

    return {
      success: true,
      analysis: analysisData,
    };
  },
});

// Generate property description using AI
export const generateDescription = action({
  args: {
    address: v.string(),
    city: v.string(),
    state: v.string(),
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    features: v.array(v.string()),
    style: v.optional(v.string()),
    sqft: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<string> => {
    // Use OpenRouter to generate description
    const OpenRouterModule = await import('../app/lib/openrouter/client');
    const openrouter = new OpenRouterModule.OpenRouterClient();

    const featureList = args.features
      .map(f => f.replace(/-/g, ' '))
      .slice(0, 10)
      .join(', ');

    const prompt = `You are a professional real estate copywriter. Write a compelling, engaging property description for this listing:

Address: ${args.address}, ${args.city}, ${args.state}
Price: $${args.price.toLocaleString()}
Bedrooms: ${args.bedrooms}
Bathrooms: ${args.bathrooms}
${args.sqft ? `Square Feet: ${args.sqft.toLocaleString()}` : ''}
${args.style ? `Style: ${args.style}` : ''}
Key Features: ${featureList}

Requirements:
- 3-4 paragraphs
- Highlight the key features naturally
- Use engaging, descriptive language
- Emphasize lifestyle and benefits
- Professional but warm tone
- No clichés or generic phrases
- Start with an attention-grabbing opening

Return ONLY the description text, no titles or labels.`;

    const response = await openrouter.chat([
      {
        role: 'user',
        content: prompt,
      },
    ], {
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'Beautiful property with great features.';
  },
});

// Fetch and enhance Street View + satellite images for a property
export const fetchAndEnhanceStreetView = action({
  args: {
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    photos: string[];
    error?: string;
  }> => {
    try {
      console.log('📸 Fetching Street View and satellite images...');
      
      // Get Street View and satellite URLs
      const imageData = await ctx.runAction(api.addressLookup.getStreetViewImages, {
        lat: args.lat,
        lng: args.lng,
      });

      if (!imageData?.streetViews || imageData.streetViews.length === 0) {
        console.warn('⚠️ No Street View available for this location');
        return { success: false, photos: [], error: 'No Street View available' };
      }

      const uploadedPhotos: string[] = [];
      
      // Step 1: Use AI to select best Street View angles
      console.log(`🔍 Analyzing ${imageData.streetViews.length} Street View angles with object detection...`);
      const { selectBestAngles } = await import('../lib/object-detection');
      const bestAngles = await selectBestAngles(imageData.streetViews, 2); // Select top 2
      
      console.log(`🎨 Enhancing ${bestAngles.length} best Street View angles...`);
      
      // Step 2: Only enhance the best angles (cost savings!)
      for (const view of bestAngles) {
        try {
          console.log(`  - ${view.description} (score: ${view.score}, confidence: ${view.detection.confidence.toFixed(2)})`);
          const result = await ctx.runAction(api.gemini.enhanceStreetViewImage, {
            imageUrl: view.url,
          });
          
          if (result.success && result.storageId) {
            uploadedPhotos.push(result.storageId);
          }
        } catch (error) {
          console.warn(`  ⚠️ Failed to enhance ${view.description}, skipping...`);
        }
      }
      
      // Enhance satellite view to ground-level backyard
      if (imageData.satellite) {
        try {
          console.log('🛰️ Transforming satellite view to ground-level backyard...');
          const satelliteResult = await ctx.runAction(api.gemini.enhanceSatelliteImage, {
            imageUrl: imageData.satellite,
            propertyDescription: `Property at coordinates ${args.lat}, ${args.lng}`,
          });
          
          if (satelliteResult.success && satelliteResult.storageId) {
            uploadedPhotos.push(satelliteResult.storageId);
            console.log('✅ Satellite view transformed successfully');
          }
        } catch (error) {
          console.warn('⚠️ Satellite transformation failed, skipping...');
        }
      }

      console.log(`✅ Successfully processed ${uploadedPhotos.length} images`);
      return {
        success: uploadedPhotos.length > 0,
        photos: uploadedPhotos,
        error: uploadedPhotos.length === 0 ? 'All enhancements failed' : undefined,
      };

    } catch (error: any) {
      console.error('❌ Error fetching/enhancing images:', error);
      return {
        success: false,
        photos: [],
        error: error.message,
      };
    }
  },
});

// Regenerate description with different tone
export const regenerateDescription = action({
  args: {
    draftId: v.id("listingDrafts"),
    tone: v.optional(v.union(
      v.literal("professional"),
      v.literal("warm"),
      v.literal("luxury")
    )),
  },
  handler: async (ctx, args): Promise<string> => {
    const draft = await ctx.runQuery(api.listingDrafts.getDraft, {
      draftId: args.draftId,
    });

    if (!draft || !draft.aiAnalysis) {
      throw new Error('Draft not found or not analyzed');
    }

    const tone = args.tone || 'professional';
    const toneInstructions: Record<string, string> = {
      professional: 'Use a professional, straightforward tone focused on facts and features.',
      warm: 'Use a warm, inviting tone that helps buyers imagine living there.',
      luxury: 'Use an upscale, sophisticated tone emphasizing exclusivity and premium features.',
    };

    const description = await ctx.runAction(api.listingAnalysis.generateDescription, {
      address: draft.address || 'Property',
      city: draft.city || '',
      state: draft.state || '',
      price: draft.price || 0,
      bedrooms: draft.manualOverrides?.bedrooms || draft.aiAnalysis.bedrooms || 3,
      bathrooms: draft.manualOverrides?.bathrooms || draft.aiAnalysis.bathrooms || 2,
      features: draft.manualOverrides?.features || draft.aiAnalysis.features,
      sqft: draft.manualOverrides?.sqft || draft.aiAnalysis.sqft,
    });

    // Update the draft with new description
    await ctx.runMutation(api.listingDrafts.updateManualOverrides, {
      draftId: args.draftId,
      overrides: {
        description,
      },
    });

    return description;
  },
});
