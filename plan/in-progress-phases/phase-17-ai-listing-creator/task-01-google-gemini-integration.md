# Task 01: Google AI Studio (Gemini) Integration

## Objective
Set up Google AI Studio's Gemini API for intelligent property photo analysis, detecting room types, features, and quality metrics.

## Prerequisites
- Google AI Studio API key
- Convex action setup knowledge
- Understanding of image analysis prompts

## Environment Setup

Add to `.env.local`:
```bash
GOOGLE_AI_STUDIO_API_KEY=your_api_key_here
GOOGLE_AI_MODEL=gemini-1.5-pro-latest
```

Add to `.env.example`:
```bash
# Google AI Studio (Gemini) - For property photo analysis
GOOGLE_AI_STUDIO_API_KEY=
GOOGLE_AI_MODEL=gemini-1.5-pro-latest
```

## Implementation Steps

### Step 1: Create Gemini Client

**File:** `lib/gemini/client.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiImageAnalysisResult {
  roomType: 
    | "bedroom" 
    | "kitchen" 
    | "bathroom" 
    | "living-room" 
    | "dining-room" 
    | "exterior" 
    | "garage"
    | "basement"
    | "laundry"
    | "office"
    | "other";
  
  features: string[]; // e.g., ["granite-countertops", "hardwood-floors"]
  
  qualityScore: number; // 1-10
  
  suggestedUse: "cover-photo" | "gallery" | "skip";
  
  condition: "excellent" | "good" | "fair" | "poor";
  
  confidence: number; // 0-1
  
  description: string; // Brief description of what's in the photo
}

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_AI_STUDIO_API_KEY environment variable is required');
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GOOGLE_AI_MODEL || 'gemini-1.5-pro-latest';
  }

  async analyzePropertyPhoto(
    imageData: string, // base64 encoded image
    mimeType: string = 'image/jpeg'
  ): Promise<GeminiImageAnalysisResult> {
    const model = this.client.getGenerativeModel({ model: this.model });

    const prompt = `You are a real estate property analyst. Analyze this property photo and provide detailed information.

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{
  "roomType": "bedroom|kitchen|bathroom|living-room|dining-room|exterior|garage|basement|laundry|office|other",
  "features": ["feature-1", "feature-2", ...],
  "qualityScore": 8,
  "suggestedUse": "cover-photo|gallery|skip",
  "condition": "excellent|good|fair|poor",
  "confidence": 0.95,
  "description": "Brief description of the photo"
}

Possible features to detect:
- granite-countertops, marble-countertops, quartz-countertops
- hardwood-floors, tile-floors, carpet, laminate-floors
- stainless-appliances, updated-appliances
- fireplace, gas-fireplace, wood-burning-fireplace
- crown-molding, wainscoting, coffered-ceiling
- high-ceilings, vaulted-ceilings, cathedral-ceilings
- recessed-lighting, pendant-lighting, chandelier
- updated-kitchen, modern-kitchen, chef-kitchen
- updated-bathroom, spa-bathroom, double-vanity
- walk-in-closet, custom-closet
- french-doors, sliding-doors, bay-windows
- built-in-shelving, custom-cabinetry
- pool, spa, hot-tub
- deck, patio, covered-patio
- landscaping, mature-trees, mountain-view, water-view
- finished-basement, wine-cellar
- smart-home, security-system

Quality scoring guidelines:
- 9-10: Professional photography, excellent lighting, well-staged
- 7-8: Good quality, clear, well-lit
- 5-6: Acceptable but could be better
- 3-4: Poor lighting or composition
- 1-2: Very poor quality, blurry, dark

Suggested use guidelines:
- cover-photo: Exterior shots or most impressive interior spaces
- gallery: Good quality photos worth showing
- skip: Poor quality, blurry, or not useful for listing`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageData,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    try {
      const json = JSON.parse(text);
      return json;
    } catch (error) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error('Invalid response from Gemini API');
    }
  }

  async analyzeBatch(
    images: Array<{ data: string; mimeType: string }>
  ): Promise<GeminiImageAnalysisResult[]> {
    // Analyze images sequentially to avoid rate limits
    const results: GeminiImageAnalysisResult[] = [];
    
    for (const image of images) {
      try {
        const result = await this.analyzePropertyPhoto(image.data, image.mimeType);
        results.push(result);
        
        // Small delay to respect rate limits (60 req/min = 1 req/sec)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error analyzing image:', error);
        // Add placeholder result for failed analysis
        results.push({
          roomType: 'other',
          features: [],
          qualityScore: 5,
          suggestedUse: 'gallery',
          condition: 'good',
          confidence: 0,
          description: 'Analysis failed',
        });
      }
    }
    
    return results;
  }
}

export function createGeminiClient(): GeminiClient {
  return new GeminiClient();
}
```

### Step 2: Create Convex Action for Photo Analysis

**File:** `convex/gemini.ts`

```typescript
'use node';

import { v } from "convex/values";
import { action } from "./_generated/server";

// Analyze a single property photo
export const analyzePropertyPhoto = action({
  args: {
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
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
    
    const result = await gemini.analyzePropertyPhoto(base64, response.headers.get('content-type') || 'image/jpeg');
    
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
  handler: async (ctx, args) => {
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
    
    console.log(`✅ Analysis complete. Detected ${allFeatures.size} features across ${validImages.length} photos`);
    
    return {
      photos: analysisResults,
      summary: {
        totalPhotos: validImages.length,
        detectedFeatures: Array.from(allFeatures),
        roomCounts,
        suggestedCoverPhoto: coverPhoto?.storageId,
        averageQuality: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length,
      },
    };
  },
});

// Generate property insights from photo analysis
export const generatePropertyInsights = action({
  args: {
    photoAnalysis: v.any(), // Results from analyzePropertyPhotos
  },
  handler: async (ctx, args) => {
    const { summary } = args.photoAnalysis;
    
    // Estimate bedrooms and bathrooms from photo analysis
    const estimatedBedrooms = summary.roomCounts['bedroom'] || 3; // default to 3 if can't detect
    const estimatedBathrooms = summary.roomCounts['bathroom'] || 2;
    
    // Determine property style based on features
    let style = 'traditional';
    if (summary.detectedFeatures.some((f: string) => f.includes('modern') || f.includes('contemporary'))) {
      style = 'modern';
    } else if (summary.detectedFeatures.some((f: string) => f.includes('updated') || f.includes('renovated'))) {
      style = 'updated';
    }
    
    return {
      estimatedBedrooms,
      estimatedBathrooms,
      style,
      highlights: summary.detectedFeatures.slice(0, 8), // Top 8 features
      photoQuality: summary.averageQuality > 7 ? 'excellent' : summary.averageQuality > 5 ? 'good' : 'fair',
    };
  },
});
```

### Step 3: Install Dependencies

```bash
npm install @google/generative-ai
```

### Step 4: Test the Integration

**File:** `scripts/test-gemini.ts`

```typescript
import { createGeminiClient } from '../lib/gemini/client';
import fs from 'fs';
import path from 'path';

async function testGeminiAnalysis() {
  const gemini = createGeminiClient();
  
  // Read a test image
  const testImagePath = path.join(__dirname, '../public/test-property.jpg');
  const imageBuffer = fs.readFileSync(testImagePath);
  const base64Image = imageBuffer.toString('base64');
  
  console.log('🔍 Analyzing test property photo...');
  
  const result = await gemini.analyzePropertyPhoto(base64Image, 'image/jpeg');
  
  console.log('📊 Analysis Result:');
  console.log(JSON.stringify(result, null, 2));
}

testGeminiAnalysis().catch(console.error);
```

Run with:
```bash
npx ts-node scripts/test-gemini.ts
```

## Acceptance Criteria

- [ ] Gemini client successfully authenticates with API key
- [ ] Single photo analysis returns structured JSON
- [ ] Batch analysis handles multiple photos with rate limiting
- [ ] Room types are correctly identified (>80% accuracy on test set)
- [ ] Features are detected from photos
- [ ] Quality scores are reasonable
- [ ] Cover photo suggestions prioritize exterior/best quality
- [ ] Error handling for API failures
- [ ] Rate limiting prevents hitting API limits
- [ ] Test script successfully analyzes sample photos

## Testing Checklist

Test with various property photos:
- [ ] Exterior shots (should suggest cover-photo)
- [ ] Kitchen photos (should detect kitchen features)
- [ ] Bedroom photos (should count bedrooms)
- [ ] Bathroom photos (should detect bathroom features)
- [ ] Poor quality photos (should score low and suggest skip)
- [ ] Non-property photos (should handle gracefully)

## Notes

- Gemini 1.5 Pro supports image analysis with excellent accuracy
- Rate limit: 60 requests/minute (handle in batch processing)
- Cost: ~$0.001 per image (very affordable)
- Response time: ~2-4 seconds per image
- Max image size: 4MB (resize larger images client-side)

## Next Steps

After completing this task:
1. Move to Task 02: Google Places API integration
2. Test photo analysis with real property photos
3. Fine-tune prompt for better feature detection
4. Consider caching analysis results to avoid re-processing
