'use node';

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Analyze a single property photo
export const analyzePropertyPhoto = action({
  args: {
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<{
    storageId: string;
    analysis: any;
    analyzedAt: number;
  }> => {
    console.log('📸 Analyzing property photo:', args.imageStorageId);
    
    // Get image from Convex storage
    const imageUrl = await ctx.storage.getUrl(args.imageStorageId);
    
    if (!imageUrl) {
      throw new Error('Image not found in storage');
    }

    // Fetch image data
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // Analyze with Gemini
    const { GeminiClient } = await import('../lib/gemini/client');
    const gemini = new GeminiClient();
    
    const result = await gemini.analyzePropertyPhoto(
      base64, 
      response.headers.get('content-type') || 'image/jpeg'
    );
    
    console.log('✅ Analysis complete:', result.roomType, `(${result.features.length} features)`);
    
    return {
      storageId: args.imageStorageId,
      analysis: result,
      analyzedAt: Date.now(),
    };
  },
});

// Analyze multiple photos in batch
export const analyzePropertyPhotos = action({
  args: {
    imageStorageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args): Promise<{
    photos: Array<{
      storageId: string;
      analysis: any;
      analyzedAt: number;
    }>;
    summary: {
      totalPhotos: number;
      detectedFeatures: string[];
      roomCounts: Record<string, number>;
      suggestedCoverPhoto?: string;
      averageQuality: number;
    };
  }> => {
    console.log(`📸 Analyzing ${args.imageStorageIds.length} property photos...`);
    
    // Fetch all images
    const images = await Promise.all(
      args.imageStorageIds.map(async (storageId) => {
        const imageUrl = await ctx.storage.getUrl(storageId);
        if (!imageUrl) return null;
        
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        return {
          storageId,
          data: base64,
          mimeType: response.headers.get('content-type') || 'image/jpeg',
        };
      })
    );
    
    const validImages = images.filter((img): img is NonNullable<typeof img> => img !== null);
    
    // Analyze with Gemini
    const { GeminiClient } = await import('../lib/gemini/client');
    const gemini = new GeminiClient();
    
    const results = await gemini.analyzeBatch(
      validImages.map(img => ({ data: img.data, mimeType: img.mimeType }))
    );
    
    // Combine results with storage IDs
    const analysisResults = validImages.map((img, idx) => ({
      storageId: img.storageId,
      analysis: results[idx],
      analyzedAt: Date.now(),
    }));
    
    // Aggregate features from all photos
    const allFeatures = new Set<string>();
    results.forEach(r => r.features.forEach(f => allFeatures.add(f)));
    
    // Count room types
    const roomCounts: Record<string, number> = {};
    results.forEach(r => {
      if (r.roomType !== 'other' && r.roomType !== 'exterior') {
        roomCounts[r.roomType] = (roomCounts[r.roomType] || 0) + 1;
      }
    });
    
    // Find best cover photo candidate
    const coverPhoto = analysisResults
      .filter(r => r.analysis.suggestedUse === 'cover-photo' || r.analysis.roomType === 'exterior')
      .sort((a, b) => b.analysis.qualityScore - a.analysis.qualityScore)[0];
    
    const averageQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    
    console.log(`✅ Analysis complete. Detected ${allFeatures.size} features across ${validImages.length} photos`);
    console.log(`   Room counts:`, roomCounts);
    console.log(`   Average quality:`, averageQuality.toFixed(1));
    
    return {
      photos: analysisResults,
      summary: {
        totalPhotos: validImages.length,
        detectedFeatures: Array.from(allFeatures),
        roomCounts,
        suggestedCoverPhoto: coverPhoto?.storageId,
        averageQuality,
      },
    };
  },
});

// Generate property insights from photo analysis
export const generatePropertyInsights = action({
  args: {
    photoAnalysisSummary: v.object({
      totalPhotos: v.number(),
      detectedFeatures: v.array(v.string()),
      roomCounts: v.any(),
      suggestedCoverPhoto: v.optional(v.string()),
      averageQuality: v.number(),
    }),
  },
  handler: async (ctx, args): Promise<{
    estimatedBedrooms: number;
    estimatedBathrooms: number;
    style: string;
    highlights: string[];
    photoQuality: string;
  }> => {
    const { roomCounts, detectedFeatures, averageQuality } = args.photoAnalysisSummary;
    
    // Estimate bedrooms and bathrooms from photo analysis
    const estimatedBedrooms = roomCounts['bedroom'] || 3;
    const estimatedBathrooms = roomCounts['bathroom'] || 2;
    
    // Determine property style based on features
    let style = 'traditional';
    if (detectedFeatures.some((f: string) => f.includes('modern') || f.includes('contemporary'))) {
      style = 'modern';
    } else if (detectedFeatures.some((f: string) => f.includes('updated') || f.includes('renovated'))) {
      style = 'updated';
    }
    
    return {
      estimatedBedrooms,
      estimatedBathrooms,
      style,
      highlights: detectedFeatures.slice(0, 8),
      photoQuality: averageQuality > 7 ? 'excellent' : averageQuality > 5 ? 'good' : 'fair',
    };
  },
});

// Enhance a Street View image and upload to storage
export const enhanceStreetViewImage = action({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    storageId?: string;
    error?: string;
  }> => {
    try {
      console.log('🎨 Enhancing Street View image...');
      
      // Initialize Gemini client
      const { createGeminiClient } = await import('../lib/gemini/client');
      const gemini = createGeminiClient();
      
      // Enhance the image
      const result = await gemini.generateEnhancedPropertyPhoto(
        args.imageUrl,
        'street-view'
      );
      
      if (!result.success || !result.enhancedImageUrl) {
        console.error('❌ Enhancement failed:', result.error);
        return { success: false, error: result.error };
      }
      
      // Convert base64 data URL to blob
      const base64Data = result.enhancedImageUrl.split(',')[1];
      const blob = Buffer.from(base64Data, 'base64');
      
      // Upload to Convex storage
      const storageId = await ctx.storage.store(
        new Blob([blob], { type: 'image/jpeg' }) as any
      );
      
      console.log('✅ Enhanced image uploaded:', storageId);
      
      return {
        success: true,
        storageId,
      };
      
    } catch (error: any) {
      console.error('❌ Error enhancing Street View:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
