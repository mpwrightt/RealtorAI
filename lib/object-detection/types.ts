/**
 * Object detection types for YOLO-based building detection
 */

export interface BoundingBox {
  x: number;      // Center X coordinate (0-1 normalized)
  y: number;      // Center Y coordinate (0-1 normalized)
  width: number;  // Box width (0-1 normalized)
  height: number; // Box height (0-1 normalized)
}

export interface Detection {
  className: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface BuildingDetectionResult {
  hasBuilding: boolean;
  confidence: number;
  boundingBox?: BoundingBox;
  allDetections: Detection[];
}

export interface ScoredStreetView {
  url: string;
  description: string;
  heading: number;
  score: number;
  detection: BuildingDetectionResult;
}

// COCO dataset class names (YOLOv8 default)
export const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
  'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
  'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
  'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
  'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant',
  'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
  'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors',
  'teddy bear', 'hair drier', 'toothbrush'
];

// Real estate relevant classes (for future fine-tuning)
export const BUILDING_CLASSES = [
  // Note: COCO doesn't have "building" or "house" classes
  // We'll need to use a custom model or Roboflow for better accuracy
  // For now, we can use proxy classes or train our own model
];
