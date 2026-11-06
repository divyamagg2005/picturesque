import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { REFERENCE_LANDMARK_NAMES, type PoseLandmark, type PoseLandmarks } from "@/types";

const VISIBILITY_THRESHOLD = 0.35;
const CORE_LANDMARKS = [
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
] as const;

export interface ProcessedPoseCandidate {
  landmarks: PoseLandmarks;
  confidence: number;
  visibleCoreLandmarks: number;
  hasTorsoAnchors: boolean;
  centerDistance: number;
}

export interface SelectedPoseDetection extends ProcessedPoseCandidate {
  personCount: number;
  status: "detected" | "low-confidence" | "no-person";
  sourceWidth: number;
  sourceHeight: number;
}

function confidenceOf(landmark: PoseLandmark | undefined, minVisibility: number): number {
  if (!landmark || !Number.isFinite(landmark.x) || !Number.isFinite(landmark.y)) return 0;
  const visibility = landmark.visibility ?? 1;
  const presence = landmark.presence ?? 1;
  if (visibility < minVisibility || presence < minVisibility) return 0;
  return Math.min(1, visibility * presence);
}

export function normalizeMediaPipeLandmarks(rawLandmarks: NormalizedLandmark[]): PoseLandmarks {
  return rawLandmarks.flatMap((landmark, index): PoseLandmark[] => {
    const name = REFERENCE_LANDMARK_NAMES[index];
    if (!name || !Number.isFinite(landmark.x) || !Number.isFinite(landmark.y)) return [];

    return [{
      name,
      x: landmark.x,
      y: landmark.y,
      z: Number.isFinite(landmark.z) ? landmark.z : undefined,
      visibility: Number.isFinite(landmark.visibility) ? landmark.visibility : undefined,
      presence: Number.isFinite(landmark.presence) ? landmark.presence : undefined,
    }];
  });
}

function scoreCandidate(landmarks: PoseLandmarks): ProcessedPoseCandidate {
  const points = new Map(landmarks.map((landmark) => [landmark.name, landmark]));
  const visibleCore = CORE_LANDMARKS.filter((name) => {
    const landmark = points.get(name);
    return landmark && (landmark.visibility ?? 1) >= VISIBILITY_THRESHOLD && (landmark.presence ?? 1) >= VISIBILITY_THRESHOLD;
  });
  const confidences = visibleCore.map((name) => {
    const landmark = points.get(name);
    return (landmark?.visibility ?? 1) * (landmark?.presence ?? 1);
  });
  const hasTorsoAnchors = ["left_shoulder", "right_shoulder", "left_hip", "right_hip"]
    .every((name) => {
      const landmark = points.get(name as (typeof CORE_LANDMARKS)[number]);
      return landmark && (landmark.visibility ?? 1) >= VISIBILITY_THRESHOLD;
    });
  const torsoAnchorX = ["left_shoulder", "right_shoulder", "left_hip", "right_hip"]
    .map((name) => points.get(name as (typeof CORE_LANDMARKS)[number]))
    .filter((landmark) => landmark && confidenceOf(landmark, VISIBILITY_THRESHOLD) > 0)
    .map((landmark) => landmark!.x);
  const centerX = torsoAnchorX.length > 0
    ? torsoAnchorX.reduce((sum, x) => sum + x, 0) / torsoAnchorX.length
    : 0.5;
  const averageConfidence = confidences.length > 0
    ? confidences.reduce((sum, confidence) => sum + confidence, 0) / confidences.length
    : 0;

  return {
    landmarks,
    confidence: (visibleCore.length / CORE_LANDMARKS.length) * averageConfidence,
    visibleCoreLandmarks: visibleCore.length,
    hasTorsoAnchors,
    centerDistance: Math.abs(centerX - 0.5),
  };
}

export function selectPrimaryPose(
  poses: NormalizedLandmark[][],
  sourceWidth: number,
  sourceHeight: number,
): SelectedPoseDetection {
  if (poses.length === 0) {
    return {
      landmarks: [],
      confidence: 0,
      visibleCoreLandmarks: 0,
      hasTorsoAnchors: false,
      centerDistance: 1,
      personCount: 0,
      status: "no-person",
      sourceWidth,
      sourceHeight,
    };
  }

  const candidates = poses.map((pose) => scoreCandidate(normalizeMediaPipeLandmarks(pose)));
  candidates.sort((first, second) => {
    const anchorDifference = Number(second.hasTorsoAnchors) - Number(first.hasTorsoAnchors);
    if (anchorDifference !== 0) return anchorDifference;
    const visibilityDifference = second.visibleCoreLandmarks - first.visibleCoreLandmarks;
    return visibilityDifference || second.confidence - first.confidence || first.centerDistance - second.centerDistance;
  });

  const [primary] = candidates;
  const status = primary.visibleCoreLandmarks < 7 || !primary.hasTorsoAnchors
    ? "low-confidence"
    : "detected";

  return { ...primary, personCount: poses.length, status, sourceWidth, sourceHeight };
}