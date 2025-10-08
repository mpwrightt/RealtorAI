/**
 * Building detection service - automatically selects best detector
 */

import { createRoboflowDetector } from './roboflow-client';
import { createSimpleDetector } from './simple-detector';
import type { BuildingDetectionResult, ScoredStreetView } from './types';

/**
 * Detect buildings in a Street View image
 */
export async function detectBuilding(
  imageUrl: string,
  heading?: number
): Promise<BuildingDetectionResult> {
  // Try Roboflow first if API key is available
  if (process.env.ROBOFLOW_API_KEY) {
    const roboflow = createRoboflowDetector();
    return await roboflow.detectBuildings(imageUrl);
  }
  
  // Fallback to simple heuristic detector
  console.log('ℹ️ Using simple heuristic detector (no Roboflow API key)');
  const simple = createSimpleDetector();
  return await simple.detectBuildings(imageUrl, heading);
}

/**
 * Score a Street View angle based on building detection
 * @returns Score from 0-100 (higher is better)
 */
export function scoreStreetViewAngle(detection: BuildingDetectionResult): number {
  let score = 0;
  
  if (!detection.hasBuilding) {
    return 0; // No building detected
  }
  
  // Base score for having a building
  score += 40;
  
  // Confidence score (0-40 points)
  score += detection.confidence * 40;
  
  // Bounding box size score (0-20 points)
  if (detection.boundingBox) {
    const { width, height } = detection.boundingBox;
    const boxArea = width * height;
    
    // Prefer buildings that take up 20-70% of image
    // Too small = far away, too large = too close/cropped
    if (boxArea >= 0.2 && boxArea <= 0.7) {
      score += 20;
    } else if (boxArea > 0.1 && boxArea < 0.8) {
      score += 10;
    }
  }
  
  return Math.min(Math.round(score), 100);
}

/**
 * Select best Street View angles based on building detection
 * @param views - Array of Street View images with metadata
 * @param maxAngles - Maximum number of angles to return (default: 2)
 * @returns Sorted array of best angles
 */
export async function selectBestAngles(
  views: Array<{ url: string; description: string; heading: number }>,
  maxAngles: number = 2
): Promise<ScoredStreetView[]> {
  console.log(`🔍 Analyzing ${views.length} Street View angles...`);
  
  // Detect buildings in all angles
  const scoredViews: ScoredStreetView[] = await Promise.all(
    views.map(async (view) => {
      const detection = await detectBuilding(view.url, view.heading);
      const score = scoreStreetViewAngle(detection);
      
      console.log(`  ${view.description}: score=${score}, confidence=${detection.confidence.toFixed(2)}, hasBuilding=${detection.hasBuilding}`);
      
      return {
        ...view,
        score,
        detection,
      };
    })
  );
  
  // Sort by score (highest first) and return top N
  const best = scoredViews
    .sort((a, b) => b.score - a.score)
    .slice(0, maxAngles);
  
  console.log(`✅ Selected ${best.length} best angles:`, best.map(v => `${v.description} (score: ${v.score})`));
  
  return best;
}

// Re-export types
export type { BuildingDetectionResult, ScoredStreetView, Detection, BoundingBox } from './types';
