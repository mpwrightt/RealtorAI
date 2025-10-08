/**
 * Simple heuristic-based building detector (fallback when no API available)
 * Uses image analysis heuristics to estimate if a building is present
 */

import type { BuildingDetectionResult } from './types';

export class SimpleDetector {
  /**
   * Simple heuristic detection - assumes building present and scores based on heading
   * @param imageUrl - Street View image URL
   * @param heading - Camera heading (0-360)
   * @returns Detection result with estimated confidence
   */
  async detectBuildings(imageUrl: string, heading?: number): Promise<BuildingDetectionResult> {
    // Simple heuristic: prefer front/angled views over side views
    let confidence = 0.7; // Base confidence

    if (heading !== undefined) {
      // Prefer angles that are more likely to show building fronts
      // Front views (0°, 180°) and diagonal views typically better than side views
      const normalizedHeading = ((heading % 360) + 360) % 360;
      
      // Score based on heading (prefer cardinal and diagonal directions)
      if (this.isCardinalDirection(normalizedHeading) || this.isDiagonalDirection(normalizedHeading)) {
        confidence = 0.8;
      } else {
        confidence = 0.6;
      }
    }

    return {
      hasBuilding: true, // Assume true for all Street View images
      confidence,
      boundingBox: {
        x: 0.5,
        y: 0.5,
        width: 0.6, // Assume building takes up ~60% of image
        height: 0.6,
      },
      allDetections: [],
    };
  }

  private isCardinalDirection(heading: number): boolean {
    // Cardinal directions: 0° (N), 90° (E), 180° (S), 270° (W)
    // Allow ±15° tolerance
    const cardinals = [0, 90, 180, 270, 360];
    return cardinals.some((cardinal) => Math.abs(heading - cardinal) <= 15);
  }

  private isDiagonalDirection(heading: number): boolean {
    // Diagonal directions: 45°, 135°, 225°, 315°
    // Allow ±15° tolerance
    const diagonals = [45, 135, 225, 315];
    return diagonals.some((diagonal) => Math.abs(heading - diagonal) <= 15);
  }
}

export function createSimpleDetector(): SimpleDetector {
  return new SimpleDetector();
}
