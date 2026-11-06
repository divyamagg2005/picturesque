import type {
  AlignmentResult,
  CameraState,
  PoseDetectionStatus,
  ReadinessResult,
} from "@/types";

export const READINESS_DEFAULTS = {
  minAlignment: 85,
  minConfidence: 0.6,
  stabilizationMs: 1500,
} as const;

export function evaluateReadiness(
  alignment: AlignmentResult | null,
  cameraState: CameraState,
  detectionStatus: PoseDetectionStatus | null = null,
  stableForMs = 0,
): ReadinessResult {
  const { minAlignment, minConfidence, stabilizationMs } = READINESS_DEFAULTS;

  if (cameraState.status !== "ready") {
    return {
      state: "initializing",
      score: alignment?.score ?? 0,
      confidence: alignment?.confidence ?? 0,
      stabilizedForMs: 0,
      isReady: false,
      message: "Preparing camera and pose detection…",
    };
  }

  if (detectionStatus === "no-person") {
    return {
      state: "no-person",
      score: alignment?.score ?? 0,
      confidence: alignment?.confidence ?? 0,
      stabilizedForMs: 0,
      isReady: false,
      message: "No person detected. Step into the frame.",
    };
  }

  if (detectionStatus === "low-confidence") {
    return {
      state: "low-confidence",
      score: alignment?.score ?? 0,
      confidence: alignment?.confidence ?? 0,
      stabilizedForMs: 0,
      isReady: false,
      message: "Move into view and keep your shoulders and hips visible.",
    };
  }

  if (!alignment) {
    return {
      state: "adjusting",
      score: 0,
      confidence: 0,
      stabilizedForMs: 0,
      isReady: false,
      message: "Position yourself to match the reference pose.",
    };
  }

  if (alignment.confidence < minConfidence) {
    return {
      state: "low-confidence",
      score: alignment.score,
      confidence: alignment.confidence,
      stabilizedForMs: 0,
      isReady: false,
      message: "The pose is too uncertain for a reliable match.",
    };
  }

  if (alignment.score < minAlignment) {
    return {
      state: "adjusting",
      score: alignment.score,
      confidence: alignment.confidence,
      stabilizedForMs: stableForMs,
      isReady: false,
      message: "Almost there. Adjust your pose to match the reference.",
    };
  }

  if (stableForMs < stabilizationMs) {
    return {
      state: "stabilizing",
      score: alignment.score,
      confidence: alignment.confidence,
      stabilizedForMs: stableForMs,
      isReady: false,
      message: "Hold that pose…",
    };
  }

  return {
    state: "ready",
    score: alignment.score,
    confidence: alignment.confidence,
    stabilizedForMs: stableForMs,
    isReady: true,
    message: "Perfect! You're ready to capture.",
  };
}
