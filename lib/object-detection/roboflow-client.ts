/**
 * Roboflow Inference API client for building detection
 * Uses pre-trained models to detect buildings/houses in Street View images
 */

import type { BuildingDetectionResult, Detection, BoundingBox } from './types';

interface RoboflowPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
}

interface RoboflowResponse {
  predictions: RoboflowPrediction[];
  image: {
    width: number;
    height: number;
  };
}

export class RoboflowDetector {
  private apiKey: string;
  private modelId: string;
  private modelVersion: string;

  constructor() {
    // Use environment variables or default to a public building detection model
    this.apiKey = process.env.ROBOFLOW_API_KEY || '';
    this.modelId = process.env.ROBOFLOW_MODEL_ID || 'building-detection';
    this.modelVersion = process.env.ROBOFLOW_MODEL_VERSION || '1';
  }

  /**
   * Detect buildings in an image
   * @param imageUrl - URL of the Street View image
   * @returns Building detection result with confidence and bounding boxes
   */
  async detectBuildings(imageUrl: string): Promise<BuildingDetectionResult> {
    if (!this.apiKey) {
      console.warn('⚠️ ROBOFLOW_API_KEY not set, skipping detection');
      return {
        hasBuilding: true, // Assume true if no API key
        confidence: 0.5,
        allDetections: [],
      };
    }

    try {
      const response = await fetch(
        `https://detect.roboflow.com/${this.modelId}/${this.modelVersion}?api_key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageUrl,
            confidence: 0.3, // Min confidence threshold
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Roboflow API error: ${response.statusText}`);
      }

      const data: RoboflowResponse = await response.json();
      
      return this.parseDetections(data);
    } catch (error) {
      console.error('❌ Roboflow detection failed:', error);
      // Fallback: assume building present
      return {
        hasBuilding: true,
        confidence: 0.5,
        allDetections: [],
      };
    }
  }

  /**
   * Parse Roboflow API response into our format
   */
  private parseDetections(data: RoboflowResponse): BuildingDetectionResult {
    const { predictions, image } = data;

    // Convert to normalized coordinates (0-1)
    const detections: Detection[] = predictions.map((pred) => ({
      className: pred.class,
      confidence: pred.confidence,
      boundingBox: {
        x: pred.x / image.width,
        y: pred.y / image.height,
        width: pred.width / image.width,
        height: pred.height / image.height,
      },
    }));

    // Find the best building detection
    const buildingDetection = detections
      .filter((d) => this.isBuildingClass(d.className))
      .sort((a, b) => b.confidence - a.confidence)[0];

    return {
      hasBuilding: !!buildingDetection,
      confidence: buildingDetection?.confidence || 0,
      boundingBox: buildingDetection?.boundingBox,
      allDetections: detections,
    };
  }

  /**
   * Check if a class name indicates a building
   */
  private isBuildingClass(className: string): boolean {
    const buildingKeywords = ['building', 'house', 'home', 'structure', 'property', 'residence'];
    const lowerClass = className.toLowerCase();
    return buildingKeywords.some((keyword) => lowerClass.includes(keyword));
  }
}

export function createRoboflowDetector(): RoboflowDetector {
  return new RoboflowDetector();
}
