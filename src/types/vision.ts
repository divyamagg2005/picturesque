import type { PoseLandmarks } from "./pose";

export type PoseDetectionStatus = "no-person" | "low-confidence" | "detected";
export type PoseModelStatus = "idle" | "loading" | "ready" | "error";

export interface PoseDetectionSnapshot {
  status: PoseDetectionStatus;
  landmarks: PoseLandmarks;
  confidence: number;
  visibleCoreLandmarks: number;
  personCount: number;
  sourceWidth: number;
  sourceHeight: number;
}