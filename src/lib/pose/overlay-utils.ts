export type OverlayMode = "off" | "skeleton" | "image";

export const DEFAULT_OVERLAY_OPACITY = 0.5;
export const MIN_OVERLAY_SCALE = 0.6;
export const MAX_OVERLAY_SCALE = 1.6;
export const OVERLAY_SCALE_STEP = 0.1;
export const OVERLAY_POSITION_STEP = 0.04;
export const MAX_OVERLAY_OFFSET = 0.32;

export function clampOverlayOpacity(opacity: number): number {
  return Math.min(1, Math.max(0, opacity));
}

export function clampOverlayScale(scale: number): number {
  return Math.min(MAX_OVERLAY_SCALE, Math.max(MIN_OVERLAY_SCALE, scale));
}

export function clampOverlayOffset(offset: number): number {
  return Math.min(MAX_OVERLAY_OFFSET, Math.max(-MAX_OVERLAY_OFFSET, offset));
}