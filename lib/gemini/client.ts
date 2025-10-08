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

  /**
   * Get prompt for aerial/satellite view enhancement (keeps aerial perspective)
   */
  private getAerialEnhancementPrompt(propertyDescription: string, multiImage: boolean = false): string {
    const multiImageNote = multiImage 
      ? '\n\nNOTE: You have been given the same property from multiple zoom levels. Use all images to understand the property details, then create ONE enhanced aerial photograph showing the property clearly.'
      : '';
    
    return `You are a professional photo editor cleaning up a satellite/aerial property image.

CRITICAL: This is a MINOR ENHANCEMENT ONLY. Do NOT redesign, rebuild, or change the property.

Property: ${propertyDescription}${multiImageNote}

Your ONLY job is to improve image quality:
- KEEP the exact same aerial/bird's-eye perspective
- KEEP the exact same zoom level and framing
- KEEP all buildings, structures, and features EXACTLY as they appear
- KEEP the same roof style, color, and material
- KEEP the same landscaping, trees, and yard layout
- KEEP the same driveway, paths, and hardscaping
- KEEP any pools, decks, or outdoor structures exactly as shown

What you MAY do (SUBTLE improvements only):
- Slightly improve image clarity and sharpness
- Slightly enhance color vibrancy (don't oversaturate)
- Slightly improve lighting and contrast
- Make it look like a higher-resolution aerial photo

What you MUST NOT do:
✗ Do NOT change the property layout or structure
✗ Do NOT add or remove buildings or features
✗ Do NOT change roof colors or styles
✗ Do NOT add landscaping that isn't there
✗ Do NOT change the perspective or zoom level
✗ Do NOT make it look fake or AI-generated
✗ Do NOT rebuild the house - just clean up the image

Think of this as: "Make the satellite image slightly clearer and more vibrant, but keep everything exactly as it is."

Style: Clean, sharp aerial photography with accurate property representation. Subtle enhancement only.`;
  }

  /**
   * Get prompt for ground-level transformation (experimental)
   */
  private getGroundLevelTransformPrompt(propertyDescription: string): string {
    return `You are an AI that creates realistic ground-level property photography from aerial views.

IMPORTANT: Transform this satellite/aerial view into a realistic ground-level photograph of the backyard.

Property: ${propertyDescription}

Transformation Requirements:
- Convert the bird's-eye aerial view to a standing ground-level perspective (5-6 feet height)
- Show the backyard from someone standing in the yard looking toward the house
- Maintain accurate layout: if the aerial shows a pool, deck, or patio, show them from ground level
- Use the aerial image to understand the property layout, then imagine what it looks like from the ground
- Professional real estate photography quality with proper depth and perspective
- Natural outdoor lighting (sunny day, soft shadows, golden hour feel)
- Show the house in the background if visible in the aerial view
- Include all visible features: landscaping, trees, fencing, outdoor furniture
- Photorealistic rendering - must look like a real photograph, not AI-generated

Style: Professional real estate photography, warm natural light, inviting backyard atmosphere, sharp details.`;
  }

  /**
   * Create a professional real estate photo by synthesizing multiple Street View angles
   * @param imageDataArray - Array of base64 image data from different angles
   * @param propertyDescription - Description of the property
   * @returns Base64 string of synthesized professional photo
   */
  async synthesizePropertyPhoto(
    imageDataArray: Array<{ data: string; mimeType: string; angle: string }>,
    propertyDescription: string
  ): Promise<string> {
    const model = this.client.getGenerativeModel({ 
      model: this.imageModel,
      generationConfig: {
        temperature: 0.4, // Balanced creativity and accuracy
        topP: 0.95,
        topK: 40,
        responseModalities: ['IMAGE'], // Only return images
        imageConfig: {
          aspectRatio: '16:9', // Professional exterior photo aspect ratio
        },
      } as any, // Type cast for new Gemini 2.5 features not in TS types yet
    });

    const prompt = `You are a professional real estate photographer creating ONE single hero shot for a property listing.

IMPORTANT: You have ${imageDataArray.length} reference photos of the SAME PROPERTY from different angles. Study them to understand the architecture, then create ONE cohesive professional photograph.

Property: ${propertyDescription}

CRITICAL INSTRUCTIONS:
1. This is ONE HOUSE - do NOT show multiple houses or duplicate the house
2. Create a single, unified front exterior photograph
3. Choose the most flattering angle (typically 45-degree front-angled view)
4. Study all reference images to understand: architecture, colors, materials, windows, doors, roof style, siding

What to DO:
✓ Create ONE professional front exterior shot of this single property
✓ Golden hour lighting (warm, soft, inviting)
✓ Professional real estate photography composition
✓ Remove: parked cars, power lines, utility boxes, street clutter
✓ Clean, sharp, well-maintained appearance
✓ Professional depth of field (slight background blur)
✓ Make it look like a magazine-quality listing photo

What NOT to do:
✗ Do NOT show the house twice or duplicate it
✗ Do NOT create a collage or side-by-side comparison
✗ Do NOT add fake features (pools, decks, additions that aren't there)
✗ Do NOT change the architectural style, colors, or materials
✗ Do NOT merge multiple angles into one unrealistic image

Keep 100% ACCURATE:
- Number and placement of windows
- Door styles and locations
- Roof type and color
- Siding material and color
- Landscaping and trees
- Property size and scale

Style: Single professional real estate listing photo, golden hour lighting, magazine quality, inviting, clean, aspirational.

Remember: You are creating ONE photograph of ONE house, not a composite of multiple houses.`;

    try {
      // Build the content array with prompt + all images
      const contentParts: any[] = [prompt];
      
      imageDataArray.forEach((img, idx) => {
        contentParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data,
          },
        });
      });

      const result = await model.generateContent(contentParts);
      const response = await result.response;
      
      // Check if response contains generated image
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            console.log('✅ Professional property photo synthesized from multiple angles');
            return part.inlineData.data;
          }
        }
      }
      
      console.warn('⚠️ No synthesized image in response, returning first source image');
      return imageDataArray[0].data; // Fallback to first image
    } catch (error) {
      console.error('Error synthesizing property photo:', error);
      return imageDataArray[0].data; // Fallback on error
    }
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
        responseModalities: ['IMAGE'], // Only return images, faster generation
        imageConfig: {
          aspectRatio: '16:9', // Professional exterior photo aspect ratio
        },
      } as any, // Type cast for new Gemini 2.5 features not in TS types yet
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

  // Transform satellite view to ground-level backyard shot OR enhance aerial view
  async satelliteToGroundLevel(
    satelliteImageData: string | Array<{ data: string; mimeType: string; zoom?: number }>,
    propertyDescription: string,
    mimeType: string = 'image/jpeg',
    enhancementMode: 'ground-level' | 'aerial-enhance' = 'aerial-enhance'
  ): Promise<string> {
    const model = this.client.getGenerativeModel({ 
      model: this.imageModel,
      generationConfig: {
        temperature: enhancementMode === 'aerial-enhance' ? 0.15 : 0.6, // Very low temp for minimal changes
        topP: 0.9, // Lower for more conservative outputs
        topK: 20, // Reduced for more predictable results
        responseModalities: ['IMAGE'], // Only return images
        imageConfig: {
          aspectRatio: '16:9', // Aerial photos look best in 16:9
        },
      } as any, // Type cast for new Gemini 2.5 features not in TS types yet
    });

    const isMultiImage = Array.isArray(satelliteImageData);
    const prompt = enhancementMode === 'aerial-enhance'
      ? this.getAerialEnhancementPrompt(propertyDescription, isMultiImage)
      : this.getGroundLevelTransformPrompt(propertyDescription);

    try {
      // Build content array
      const contentParts: any[] = [prompt];
      
      if (isMultiImage) {
        // Add all zoom levels
        satelliteImageData.forEach(img => {
          contentParts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data,
            },
          });
        });
      } else {
        // Single image (backward compatibility)
        contentParts.push({
          inlineData: {
            mimeType,
            data: satelliteImageData,
          },
        });
      }
      
      const result = await model.generateContent(contentParts);

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
      // Return first image if array, otherwise return string
      return Array.isArray(satelliteImageData) ? satelliteImageData[0].data : satelliteImageData;
    } catch (error) {
      console.error('Error transforming satellite image:', error);
      // Return first image if array, otherwise return string
      return Array.isArray(satelliteImageData) ? satelliteImageData[0].data : satelliteImageData;
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
