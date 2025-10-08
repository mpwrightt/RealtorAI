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
      console.log('🎨 Fetching Street View image from URL...');
      
      // Fetch the Street View image first
      const imageResponse = await fetch(args.imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      
      console.log('✅ Image fetched, enhancing with AI...');
      
      // Initialize Gemini client
      const { createGeminiClient } = await import('../lib/gemini/client');
      const gemini = createGeminiClient();
      
      // Enhance the image using the base64 data directly
      const enhancedBase64 = await gemini.enhanceStreetViewImage(base64Image, mimeType);
      
      // Upload enhanced image to storage
      const enhancedBlob = Buffer.from(enhancedBase64, 'base64');
      const storageId = await ctx.storage.store(
        new Blob([enhancedBlob], { type: mimeType }) as any
      );
      
      console.log('✅ Enhanced image uploaded:', storageId);
      
      return {
        success: true,
        storageId,
      };
      
    } catch (error: any) {
      console.error('❌ Error enhancing Street View:', error);
      
      // Fallback: Upload original image without enhancement
      try {
        console.log('⚠️ Attempting to upload original image as fallback...');
        const imageResponse = await fetch(args.imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const storageId = await ctx.storage.store(
          new Blob([imageBuffer], { type: 'image/jpeg' }) as any
        );
        console.log('✅ Original image uploaded as fallback:', storageId);
        return {
          success: true,
          storageId,
        };
      } catch (fallbackError: any) {
        console.error('❌ Fallback also failed:', fallbackError);
        return {
          success: false,
          error: error.message,
        };
      }
    }
  },
});

// Enhance a satellite image with multi-zoom support
export const enhanceSatelliteImage = action({
  args: {
    imageUrl: v.optional(v.string()), // Single image (legacy)
    imageUrls: v.optional(v.array(v.object({
      url: v.string(),
      zoom: v.number(),
      description: v.string(),
    }))), // Multiple zoom levels (new)
    propertyDescription: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    storageId?: string;
    error?: string;
  }> => {
    try {
      // Initialize Gemini client
      const { createGeminiClient } = await import('../lib/gemini/client');
      const gemini = createGeminiClient();
      
      // Enhancement mode: 'aerial-enhance' keeps aerial view, 'ground-level' transforms perspective
      const mode = process.env.SATELLITE_ENHANCEMENT_MODE === 'ground-level' ? 'ground-level' : 'aerial-enhance';
      
      let enhancedBase64: string;
      
      if (args.imageUrls && args.imageUrls.length > 0) {
        // NEW: Multi-zoom satellite enhancement
        console.log(`🛰️ Fetching ${args.imageUrls.length} satellite zoom levels for better accuracy...`);
        
        const imageData: Array<{ data: string; mimeType: string; zoom: number }> = [];
        
        for (const img of args.imageUrls) {
          try {
            const response = await fetch(img.url);
            if (!response.ok) continue;
            
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = response.headers.get('content-type') || 'image/jpeg';
            
            imageData.push({
              data: base64,
              mimeType,
              zoom: img.zoom,
            });
            
            console.log(`  ✓ Fetched zoom level ${img.zoom}`);
          } catch (error) {
            console.warn(`  ⚠️ Failed to fetch zoom ${img.zoom}, skipping...`);
          }
        }
        
        if (imageData.length === 0) {
          return { success: false, error: 'No satellite images could be fetched' };
        }
        
        console.log(`🎨 Enhancing aerial view with ${imageData.length} zoom levels (mode: ${mode})...`);
        enhancedBase64 = await gemini.satelliteToGroundLevel(
          imageData,
          args.propertyDescription,
          'image/jpeg',
          mode as 'aerial-enhance' | 'ground-level'
        );
        
      } else if (args.imageUrl) {
        // OLD: Single image enhancement (backward compatibility)
        console.log('🛰️ Fetching single satellite image...');
        
        const imageResponse = await fetch(args.imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
        
        console.log(`🎨 Enhancing satellite image (mode: ${mode})...`);
        enhancedBase64 = await gemini.satelliteToGroundLevel(
          base64Image,
          args.propertyDescription,
          mimeType,
          mode as 'aerial-enhance' | 'ground-level'
        );
        
      } else {
        return { success: false, error: 'No image URL(s) provided' };
      }
      
      // Upload enhanced image to storage
      const enhancedBlob = Buffer.from(enhancedBase64, 'base64');
      const storageId = await ctx.storage.store(
        new Blob([enhancedBlob], { type: 'image/jpeg' }) as any
      );
      
      console.log('✅ Enhanced satellite image uploaded:', storageId);
      
      return {
        success: true,
        storageId,
      };
      
    } catch (error: any) {
      console.error('❌ Error enhancing satellite image:', error);
      
      // Fallback: Upload original satellite image if available
      if (args.imageUrl) {
        try {
          console.log('⚠️ Attempting to upload original satellite image as fallback...');
          const imageResponse = await fetch(args.imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const storageId = await ctx.storage.store(
          new Blob([imageBuffer], { type: 'image/jpeg' }) as any
        );
          console.log('✅ Original satellite image uploaded as fallback:', storageId);
          return {
            success: true,
            storageId,
          };
        } catch (fallbackError: any) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

// Synthesize one professional photo from multiple Street View angles
export const synthesizePropertyPhoto = action({
  args: {
    imageUrls: v.array(v.object({
      url: v.string(),
      angle: v.string(),
    })),
    propertyDescription: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    storageId?: string;
    error?: string;
  }> => {
    try {
      console.log(`📸 Synthesizing professional photo from ${args.imageUrls.length} Street View angles...`);
      
      // Fetch all images and convert to base64
      const imageData: Array<{ data: string; mimeType: string; angle: string }> = [];
      
      for (const img of args.imageUrls) {
        try {
          const response = await fetch(img.url);
          if (!response.ok) continue;
          
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = response.headers.get('content-type') || 'image/jpeg';
          
          imageData.push({
            data: base64,
            mimeType,
            angle: img.angle,
          });
          
          console.log(`  ✓ Fetched ${img.angle}`);
        } catch (error) {
          console.warn(`  ⚠️ Failed to fetch ${img.angle}, skipping...`);
        }
      }
      
      if (imageData.length === 0) {
        return { success: false, error: 'No images could be fetched' };
      }
      
      console.log(`🎨 Creating professional real estate photo from ${imageData.length} angles...`);
      
      // Initialize Gemini client
      const { createGeminiClient } = await import('../lib/gemini/client');
      const gemini = createGeminiClient();
      
      // Synthesize professional photo
      const synthesizedBase64 = await gemini.synthesizePropertyPhoto(
        imageData,
        args.propertyDescription
      );
      
      // Upload to storage
      const blob = Buffer.from(synthesizedBase64, 'base64');
      const storageId = await ctx.storage.store(
        new Blob([blob], { type: 'image/jpeg' }) as any
      );
      
      console.log('✅ Professional photo synthesized and uploaded:', storageId);
      
      return {
        success: true,
        storageId,
      };
      
    } catch (error: any) {
      console.error('❌ Error synthesizing property photo:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
