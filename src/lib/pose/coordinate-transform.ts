import type { PoseLandmark } from "@/types";

export interface ViewportSize {
  width: number;
  height: number;
}

export interface OverlayTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  mirrored: boolean;
}

export interface MappedLandmark extends PoseLandmark {
  x: number;
  y: number;
}

export function mapReferenceLandmark(
  landmark: PoseLandmark,
  sourceAspectRatio: number,
  viewport: ViewportSize,
  transform: OverlayTransform,
): MappedLandmark | null {
  if (
    !Number.isFinite(landmark.x) ||
    !Number.isFinite(landmark.y) ||
    landmark.x < 0 || landmark.x > 1 ||
    landmark.y < 0 || landmark.y > 1 ||
    !Number.isFinite(sourceAspectRatio) || sourceAspectRatio <= 0 ||
    !Number.isFinite(viewport.width) || viewport.width <= 0 ||
    !Number.isFinite(viewport.height) || viewport.height <= 0
  ) {
    return null;
  }

  const viewportAspectRatio = viewport.width / viewport.height;
  const coverScale = Math.max(viewportAspectRatio / sourceAspectRatio, 1);
  const renderedWidth = sourceAspectRatio * coverScale;
  const renderedHeight = coverScale;
  const cropOffsetX = (viewportAspectRatio - renderedWidth) / 2;
  const cropOffsetY = (1 - renderedHeight) / 2;

  let x = (landmark.x * renderedWidth + cropOffsetX) / viewportAspectRatio;
  let y = landmark.y * renderedHeight + cropOffsetY;

  if (transform.mirrored) x = 1 - x;

  const safeScale = Number.isFinite(transform.scale) ? transform.scale : 1;
  x = 0.5 + (x - 0.5) * safeScale + transform.offsetX;
  y = 0.5 + (y - 0.5) * safeScale + transform.offsetY;

  return {
    ...landmark,
    x: x * viewport.width,
    y: y * viewport.height,
  };
}