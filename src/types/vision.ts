import type { PoseLandmarks } from "./pose";

export type PoseDetectionStatus = "no-person" | "low-confidence" | "detected";
export type PoseModelStatus = "idle" | "loading" | "ready" | "error";
export type ReadinessState =
  | "initializing"
  | "no-person"
  | "low-confidence"
  | "adjusting"
  | "stabilizing"
  | "ready";

export interface ReadinessResult {
  state: ReadinessState;
  score: number;
  confidence: number;
  stabilizedForMs: number;
  isReady: boolean;
  message: string;
}

export interface PoseDetectionSnapshot {
  status: PoseDetectionStatus;
  landmarks: PoseLandmarks;
  confidence: number;
  visibleCoreLandmarks: number;
  personCount: number;
  sourceWidth: number;
  sourceHeight: number;
}