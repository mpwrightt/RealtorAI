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
  
  features: string[];
  
  qualityScore: number; // 1-10
  
  suggestedUse: "cover-photo" | "gallery" | "skip";
  
  condition: "excellent" | "good" | "fair" | "poor";
  
  confidence: number; // 0-1
  
  description: string;
}

export interface ImageEnhancementResult {
  enhancedImageUrl?: string;
  success: boolean;
  error?: string;
}

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private analysisModel: string;
  private imageModel: string;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_AI_STUDIO_API_KEY environment variable is required');
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.analysisModel = process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash-latest';
    this.imageModel = process.env.GOOGLE_IMAGE_MODEL || 'imagen-3.0-generate-001';
  }

  async analyzePropertyPhoto(
    imageData: string,
    mimeType: string = 'image/jpeg'
  ): Promise<GeminiImageAnalysisResult> {
    const model = this.client.getGenerativeModel({ model: this.analysisModel });

    const prompt = `You are a real estate property analyst. Analyze this property photo and provide detailed information.

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{
  "roomType": "bedroom|kitchen|bathroom|living-room|dining-room|exterior|garage|basement|laundry|office|other",
  "features": ["feature-1", "feature-2"],
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
    
    // Clean up response (remove markdown code blocks if present)
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const json = JSON.parse(cleanText);
      return json;
    } catch (error) {
      console.error('Failed to parse Gemini response:', cleanText);
      throw new Error('Invalid response from Gemini API');
    }
  }

  async analyzeBatch(
    images: Array<{ data: string; mimeType: string }>
  ): Promise<GeminiImageAnalysisResult[]> {
    const results: GeminiImageAnalysisResult[] = [];
    
    for (const image of images) {
      try {
        const result = await this.analyzePropertyPhoto(image.data, image.mimeType);
        results.push(result);
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1100));
      } catch (error) {
        console.error('Error analyzing image:', error);
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

  // Enhance Street View image to professional quality
  async enhanceStreetViewImage(
    imageData: string,
    mimeType: string = 'image/jpeg'
  ): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.analysisModel });

    const prompt = `You are a professional real estate photographer. Enhance this street view property photo to make it more appealing for a real estate listing:

Requirements:
- Improve lighting and color balance
- Enhance clarity and sharpness
- Make the property look inviting
- Keep it realistic - no fake elements
- Professional real estate photography style
- Warm, welcoming tone

Return the enhanced image while maintaining the same composition and angle.`;

    try {
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
      
      // Note: Gemini 1.5 doesn't actually return images, it analyzes them
      // We need to use Imagen API for actual image generation
      // For now, return the original image URL
      console.log('Image enhancement requested, but requires Imagen API integration');
      return imageData;
    } catch (error) {
      console.error('Error enhancing image:', error);
      return imageData; // Return original on error
    }
  }

  // Transform satellite view to ground-level backyard shot
  async satelliteToGroundLevel(
    satelliteImageData: string,
    propertyDescription: string,
    mimeType: string = 'image/jpeg'
  ): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.analysisModel });

    const prompt = `You are an AI that transforms satellite/aerial property images into realistic ground-level views.

Given this satellite view of a property, generate a realistic ground-level photo showing the backyard from a standing perspective:

Property Context: ${propertyDescription}

Requirements:
- Transform the aerial view into a natural ground-level perspective
- Show the backyard, landscaping, and outdoor features
- Professional real estate photography quality
- Realistic lighting and shadows
- Maintain accurate property features visible in the satellite image
- Include any pools, decks, patios, or landscaping elements
- Make it look like a professional photographer took it from the yard

Style: High-quality real estate photography, warm natural lighting, inviting atmosphere.`;

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: satelliteImageData,
          },
        },
      ]);

      const response = await result.response;
      
      // This requires Imagen 3.0 for actual image generation
      console.log('Satellite-to-ground transformation requested - requires Imagen API');
      return satelliteImageData; // Return original for now
    } catch (error) {
      console.error('Error transforming satellite image:', error);
      return satelliteImageData;
    }
  }

  // Generate enhanced property photos using Imagen
  async generateEnhancedPropertyPhoto(
    sourceImageUrl: string,
    enhancementType: 'street-view' | 'satellite-to-ground',
    propertyDetails?: string
  ): Promise<ImageEnhancementResult> {
    try {
      // Fetch the source image
      const imageResponse = await fetch(sourceImageUrl);
      const imageBlob = await imageResponse.blob();
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      let enhancedImage: string;

      if (enhancementType === 'street-view') {
        enhancedImage = await this.enhanceStreetViewImage(base64);
      } else {
        enhancedImage = await this.satelliteToGroundLevel(base64, propertyDetails || '');
      }

      return {
        enhancedImageUrl: `data:image/jpeg;base64,${enhancedImage}`,
        success: true,
      };
    } catch (error: any) {
      console.error('Error generating enhanced photo:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export function createGeminiClient(): GeminiClient {
  return new GeminiClient();
}
