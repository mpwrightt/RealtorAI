# Imagen 3.0: AI Property Photo Enhancement

## Overview

This feature uses **Google's Imagen 3.0** to automatically enhance property photos by:

1. **Enhancing Street View images** - Transform basic Google Street View photos into professional-quality listing images
2. **Satellite-to-Ground transformation** - Convert Google Earth aerial/satellite views into realistic ground-level backyard shots

## ⚠️ Current Status: READY FOR IMPLEMENTATION

The code framework is in place, but requires **Imagen 3.0 API** integration which is separate from Gemini.

### What Works Now:
- ✅ Google Street View image fetching
- ✅ Google Earth/satellite image fetching  
- ✅ Gemini photo analysis
- ✅ Framework for image enhancement
- ⏳ **Needs:** Actual Imagen API calls for image generation

### What Needs Implementation:
The current Gemini API (`@google/generative-ai`) is for **analysis only**. We need to integrate the **Vertex AI Imagen API** for image generation.

## How It Works (Planned)

### 1. Street View Enhancement

**Input:** Basic Google Street View photo (often blurry, poor lighting)
```
┌─────────────────────┐
│  Street View Photo  │
│  - Basic quality    │
│  - Flat lighting    │
│  - Compression      │
└─────────────────────┘
         ↓
    Imagen 3.0 Enhancement
         ↓
┌─────────────────────┐
│  Enhanced Photo     │
│  - Professional     │
│  - Better lighting  │
│  - Sharp & clear    │
└─────────────────────┘
```

**Enhancements:**
- Improved lighting and color balance
- Enhanced clarity and sharpness
- Professional real estate photography style
- Warm, inviting atmosphere
- **Maintains** original composition (ethical)

### 2. Satellite-to-Ground Transformation

**Input:** Google Earth satellite view of property
```
┌─────────────────────┐
│  Satellite View     │
│  (Bird's eye)       │
│  Shows: Pool, deck, │
│  yard layout        │
└─────────────────────┘
         ↓
    Imagen 3.0 Transformation
         ↓
┌─────────────────────┐
│  Ground-Level Shot  │
│  (Standing in yard) │
│  Shows: Backyard    │
│  from ground view   │
└─────────────────────┘
```

**Transformation:**
- Converts aerial perspective to ground level
- Generates realistic backyard view
- Shows pools, decks, landscaping from standing height
- Professional photography quality
- Natural lighting and shadows

## Implementation Steps

### Step 1: Enable Vertex AI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Vertex AI API**
3. Enable **Imagen API** (part of Vertex AI)
4. Set up authentication (Service Account or ADC)

### Step 2: Install Vertex AI SDK

```bash
npm install @google-cloud/aiplatform
```

### Step 3: Update Gemini Client

Replace the placeholder image generation code with actual Vertex AI Imagen calls:

```typescript
import { ImageGenerationClient } from '@google-cloud/aiplatform';

// In GeminiClient class
private imagenClient: ImageGenerationClient;

constructor() {
  // Existing code...
  
  // Add Imagen client
  this.imagenClient = new ImageGenerationClient({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: 'us-central1',
  });
}

async enhanceStreetViewImage(imageData: string): Promise<string> {
  const request = {
    instances: [{
      prompt: `Enhance this real estate property photo: improve lighting, clarity, 
               and make it professional quality while keeping it realistic`,
      image: {
        bytesBase64Encoded: imageData
      },
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        negativePrompt: 'fake, cartoon, unrealistic, distorted',
      }
    }]
  };

  const [response] = await this.imagenClient.predict(request);
  return response.predictions[0].bytesBase64Encoded;
}
```

### Step 4: Environment Variables

Add to `.env.local`:
```bash
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_IMAGE_MODEL=imagen-3.0-generate-001
```

## API Costs

### Imagen 3.0 Pricing (as of 2024)
- **Image generation:** ~$0.02-0.04 per image
- **Image editing:** ~$0.04 per edit

### Cost Per Listing
Assuming we enhance:
- 1 Street View front photo: $0.04
- 1 Satellite-to-ground backyard: $0.04
- **Total:** ~$0.08 per listing

Combined with photo analysis:
- Gemini analysis (10 photos): $0.01
- Imagen enhancement (2 photos): $0.08
- **Grand total:** ~$0.09 per listing

## Ethical Considerations

✅ **Acceptable:**
- Enhancing existing real photos (lighting, clarity)
- Transforming satellite views to ground perspective
- Improving photo quality professionally

❌ **Not Acceptable:**
- Adding features that don't exist (fake pools, additions)
- Completely fabricating property images
- Misrepresenting property condition

## Implementation Priority

**Current Status:**
- The code structure is ready
- Needs Vertex AI Imagen SDK integration
- Estimated implementation: 2-3 hours

**Recommendation:**
1. Test with basic Google Street View/Earth images first
2. Get agent feedback on enhancement quality
3. Monitor costs per listing
4. Consider making it optional (agents can opt-in)

## Alternative: Quick Win Implementation

If Vertex AI setup is too complex initially, we can:

1. **Just use Google Street View photos as-is**
   - Still provides value (free exterior photos)
   - No enhancement, but saves agents time
   - Zero extra cost

2. **Add enhancement later as premium feature**
   - "Enhance with AI" button
   - Agents can choose to pay $0.08 for enhanced photos
   - A/B test if it improves listing performance

## Testing

Once implemented, test with:

```typescript
const gemini = new GeminiClient();

// Test 1: Enhance street view
const streetViewUrl = 'https://maps.googleapis.com/maps/api/streetview?...';
const enhanced = await gemini.generateEnhancedPropertyPhoto(
  streetViewUrl,
  'street-view'
);

// Test 2: Transform satellite to ground
const satelliteUrl = 'https://maps.googleapis.com/maps/api/staticmap?...';
const backyard = await gemini.generateEnhancedPropertyPhoto(
  satelliteUrl,
  'satellite-to-ground',
  '3 bedroom home with pool and deck'
);
```

## Future Enhancements

- **Virtual staging:** Add furniture to empty rooms
- **Time of day adjustment:** Convert day photos to golden hour
- **Weather enhancement:** Make cloudy days look sunny
- **Seasonal transformation:** Show property in different seasons
- **Virtual renovations:** Show potential improvements

## Questions?

- **Is this ethical?** Yes, as long as enhancements are realistic and don't misrepresent the property
- **Will buyers know?** You can disclose "AI-enhanced photos" in listing
- **How accurate is it?** Imagen 3.0 is highly accurate for photorealistic enhancements
- **Can I control the style?** Yes, prompts can be customized per listing

## Next Steps

1. Enable Vertex AI in Google Cloud
2. Install `@google-cloud/aiplatform`
3. Implement actual Imagen API calls
4. Test with real properties
5. Get agent feedback
6. Monitor costs and quality
7. Consider making it a premium add-on

---

**Status:** Framework complete, awaiting Vertex AI Imagen integration
**Estimated ROI:** High - transforms free/cheap Google images into professional photos
**Risk:** Low - falls back to original images if enhancement fails
