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
    // Gemini 2.5 Flash Image - image generation and editing
    this.imageModel = process.env.GOOGLE_IMAGE_MODEL || 'gemini-2.5-flash-image';
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
    const model = this.client.getGenerativeModel({ 
      model: this.imageModel,
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
      },
    });

    const prompt = `You are a professional real estate photographer. Transform this street view property photo into a professional, high-quality real estate listing image.

IMPORTANT: Generate a new enhanced version of this property photo.

Enhancement requirements:
- Improve lighting to be warm and inviting
- Enhance color saturation and vibrancy
- Increase clarity and sharpness
- Remove any blur or compression artifacts
- Professional real estate photography quality
- Make the property look attractive and well-maintained
- Keep it photorealistic - no cartoonish or fake elements
- Maintain the same angle, composition, and all actual property features

Style: Professional real estate photography, golden hour lighting, clear blue sky, vibrant colors, sharp details.`;

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
      
      // Check if response contains generated image
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            console.log('✅ Street View image enhanced successfully');
            return part.inlineData.data;
          }
        }
      }
      
      console.warn('⚠️ No enhanced image in response, using original');
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
    const model = this.client.getGenerativeModel({ 
      model: this.imageModel,
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        topK: 40,
      },
    });

    const prompt = `You are an AI that creates realistic ground-level property photography from aerial/satellite views.

IMPORTANT: Generate a NEW ground-level photograph of this property's backyard.

Based on this satellite/aerial view, create a realistic ground-level photo showing:

Property Context: ${propertyDescription}

Transformation requirements:
- Convert the bird's-eye aerial perspective to a standing ground-level view
- Show the backyard from a natural human eye height (about 5-6 feet)
- Include all visible features: pools, decks, patios, landscaping, trees, fencing
- Maintain accurate property layout and features from the satellite image
- Professional real estate photography quality
- Natural outdoor lighting (sunny day, soft shadows)
- Realistic depth and perspective
- Show the house/building in the background if visible
- Make it look like a professional photographer standing in the yard
- Photorealistic rendering - no fake or cartoonish elements

Style: High-end real estate photography, warm natural light, inviting backyard atmosphere, clear and sharp details, professionally composed.`;

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
      
      // Check if response contains generated image
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            console.log('✅ Satellite view transformed to ground-level successfully');
            return part.inlineData.data;
          }
        }
      }
      
      console.warn('⚠️ No transformed image in response, using original');
      return satelliteImageData;
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
