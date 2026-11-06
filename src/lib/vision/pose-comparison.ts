import type {
  AlignmentResult,
  PoseBodyPart,
  PoseBodyPartScore,
  PoseLandmark,
  PoseLandmarks,
  PoseMismatch,
  ReferenceLandmarkName,
  ReferencePose,
} from "@/types";
import { generatePoseFeedback } from "./pose-feedback";

export interface ComparePosesOptions {
  detectedAspectRatio: number;
  minVisibility?: number;
}

interface Point {
  x: number;
  y: number;
  confidence: number;
}

interface JointAngle {
  name: ReferenceLandmarkName;
  bodyPart: PoseBodyPart;
  start: ReferenceLandmarkName;
  center: ReferenceLandmarkName;
  end: ReferenceLandmarkName;
  weight: number;
}

const LANDMARK_WEIGHTS: Partial<Record<ReferenceLandmarkName, { bodyPart: PoseBodyPart; weight: number }>> = {
  nose: { bodyPart: "head", weight: 0.35 },
  left_shoulder: { bodyPart: "shoulders", weight: 1.4 },
  right_shoulder: { bodyPart: "shoulders", weight: 1.4 },
  left_elbow: { bodyPart: "arms", weight: 1.2 },
  right_elbow: { bodyPart: "arms", weight: 1.2 },
  left_wrist: { bodyPart: "arms", weight: 1.2 },
  right_wrist: { bodyPart: "arms", weight: 1.2 },
  left_hip: { bodyPart: "torso", weight: 1.3 },
  right_hip: { bodyPart: "torso", weight: 1.3 },
  left_knee: { bodyPart: "legs", weight: 0.9 },
  right_knee: { bodyPart: "legs", weight: 0.9 },
  left_ankle: { bodyPart: "legs", weight: 0.75 },
  right_ankle: { bodyPart: "legs", weight: 0.75 },
  left_foot_index: { bodyPart: "legs", weight: 0.5 },
  right_foot_index: { bodyPart: "legs", weight: 0.5 },
};

const JOINT_ANGLES: readonly JointAngle[] = [
  { name: "left_elbow", bodyPart: "arms", start: "left_shoulder", center: "left_elbow", end: "left_wrist", weight: 1.3 },
  { name: "right_elbow", bodyPart: "arms", start: "right_shoulder", center: "right_elbow", end: "right_wrist", weight: 1.3 },
  { name: "left_shoulder", bodyPart: "arms", start: "left_elbow", center: "left_shoulder", end: "left_hip", weight: 0.9 },
  { name: "right_shoulder", bodyPart: "arms", start: "right_elbow", center: "right_shoulder", end: "right_hip", weight: 0.9 },
  { name: "left_hip", bodyPart: "legs", start: "left_shoulder", center: "left_hip", end: "left_knee", weight: 1.1 },
  { name: "right_hip", bodyPart: "legs", start: "right_shoulder", center: "right_hip", end: "right_knee", weight: 1.1 },
  { name: "left_knee", bodyPart: "legs", start: "left_hip", center: "left_knee", end: "left_ankle", weight: 1.1 },
  { name: "right_knee", bodyPart: "legs", start: "right_hip", center: "right_knee", end: "right_ankle", weight: 1.1 },
];

const CORE_NAMES: readonly ReferenceLandmarkName[] = [
  "left_shoulder", "right_shoulder", "left_hip", "right_hip",
  "left_elbow", "right_elbow", "left_wrist", "right_wrist",
  "left_knee", "right_knee", "left_ankle", "right_ankle",
];

function confidenceOf(landmark: PoseLandmark | undefined, minVisibility: number): number {
  if (!landmark || !Number.isFinite(landmark.x) || !Number.isFinite(landmark.y)) return 0;
  const visibility = landmark.visibility ?? 1;
  const presence = landmark.presence ?? 1;
  if (visibility < minVisibility || presence < minVisibility) return 0;
  return Math.min(1, visibility * presence);
}

function createRelativePoints(
  landmarks: PoseLandmarks,
  aspectRatio: number,
  minVisibility: number,
): Map<ReferenceLandmarkName, Point> | null {
  const source = new Map(landmarks.map((landmark) => [landmark.name, landmark]));
  const anchors = ["left_shoulder", "right_shoulder", "left_hip", "right_hip"] as const;
  const anchorPoints = anchors.map((name) => {
    const landmark = source.get(name);
    const confidence = confidenceOf(landmark, minVisibility);
    if (!landmark || !confidence) return null;
    return { x: landmark.x * aspectRatio, y: landmark.y };
  });
  if (anchorPoints.some((point) => point === null)) return null;

  const [leftShoulder, rightShoulder, leftHip, rightHip] = anchorPoints as [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ];
  const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
  const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
  const center = { x: (shoulderCenter.x + hipCenter.x) / 2, y: (shoulderCenter.y + hipCenter.y) / 2 };
  const torsoHeight = Math.hypot(shoulderCenter.x - hipCenter.x, shoulderCenter.y - hipCenter.y);
  const shoulderWidth = Math.hypot(leftShoulder.x - rightShoulder.x, leftShoulder.y - rightShoulder.y);
  const scale = Math.max(torsoHeight, shoulderWidth, 0.01);
  const normalized = new Map<ReferenceLandmarkName, Point>();

  for (const [name, landmark] of source) {
    const confidence = confidenceOf(landmark, minVisibility);
    if (!confidence) continue;
    const x = landmark.x * aspectRatio;
    normalized.set(name, {
      x: (x - center.x) / scale,
      y: (landmark.y - center.y) / scale,
      confidence,
    });
  }

  return normalized;
}

function getAngle(start: Point, center: Point, end: Point): number {
  const first = { x: start.x - center.x, y: start.y - center.y };
  const second = { x: end.x - center.x, y: end.y - center.y };
  const firstLength = Math.hypot(first.x, first.y);
  const secondLength = Math.hypot(second.x, second.y);
  if (firstLength < 1e-6 || secondLength < 1e-6) return 0;
  const cosine = Math.max(-1, Math.min(1, (first.x * second.x + first.y * second.y) / (firstLength * secondLength)));
  return Math.acos(cosine) * (180 / Math.PI);
}

function getAngleDirection(name: ReferenceLandmarkName, difference: number): PoseMismatch["direction"] {
  if (name.includes("elbow")) return difference > 0 ? "straighten" : "bend";
  if (name.includes("knee")) return difference > 0 ? "straighten" : "bend";
  return undefined;
}

function getPositionDirection(
  name: ReferenceLandmarkName,
  expected: Point,
  actual: Point,
  points: Map<ReferenceLandmarkName, Point>,
): PoseMismatch["direction"] {
  if (name.includes("wrist") && Math.abs(expected.y - actual.y) > 0.12) {
    return expected.y < actual.y ? "raise" : "lower";
  }
  if (name.includes("ankle")) {
    const hipCenter = ((points.get("left_hip")?.x ?? 0) + (points.get("right_hip")?.x ?? 0)) / 2;
    const referenceSideDistance = Math.abs(expected.x - hipCenter);
    const detectedSideDistance = Math.abs(actual.x - hipCenter);
    if (Math.abs(referenceSideDistance - detectedSideDistance) > 0.12) {
      return referenceSideDistance > detectedSideDistance ? "outward" : "inward";
    }
  }
  if (name === "nose" && Math.abs(expected.y - actual.y) > 0.1) {
    return expected.y < actual.y ? "raise" : "lower";
  }
  if (name.includes("shoulder") && Math.abs(expected.y - actual.y) > 0.1) {
    return expected.y < actual.y ? "raise" : "lower";
  }
  return undefined;
}

export function comparePoses(
  reference: ReferencePose,
  detected: PoseLandmarks,
  options: ComparePosesOptions,
): AlignmentResult | null {
  if (
    !Number.isFinite(reference.aspectRatio) || reference.aspectRatio <= 0 ||
    !Number.isFinite(options.detectedAspectRatio) || options.detectedAspectRatio <= 0
  ) return null;

  const minVisibility = options.minVisibility ?? 0.4;
  const referencePoints = createRelativePoints(reference.landmarks, reference.aspectRatio, minVisibility);
  const detectedPoints = createRelativePoints(detected, options.detectedAspectRatio, minVisibility);
  if (!referencePoints || !detectedPoints) return null;

  const missingLandmarks: ReferenceLandmarkName[] = [];
  const partErrorSums = new Map<PoseBodyPart, { error: number; weight: number; possibleWeight: number; confidence: number }>();
  const mismatches: PoseMismatch[] = [];
  let totalError = 0;
  let totalWeight = 0;
  let totalPossibleWeight = 0;
  let confidenceSum = 0;

  for (const [name, config] of Object.entries(LANDMARK_WEIGHTS) as Array<[
    ReferenceLandmarkName,
    { bodyPart: PoseBodyPart; weight: number },
  ]>) {
    totalPossibleWeight += config.weight;
    const part = partErrorSums.get(config.bodyPart) ?? { error: 0, weight: 0, possibleWeight: 0, confidence: 0 };
    part.possibleWeight += config.weight;
    const expected = referencePoints.get(name);
    const actual = detectedPoints.get(name);
    if (!expected || !actual) {
      missingLandmarks.push(name);
      partErrorSums.set(config.bodyPart, part);
      continue;
    }
    const confidence = Math.min(expected.confidence, actual.confidence);
    const error = Math.min(1, Math.hypot(expected.x - actual.x, expected.y - actual.y) / 1.4);
    const weight = config.weight * confidence;
    totalError += error * weight;
    totalWeight += weight;
    confidenceSum += confidence * config.weight;
    part.error += error * weight;
    part.weight += weight;
    part.confidence += confidence * config.weight;
    partErrorSums.set(config.bodyPart, part);
    if (error > 0.1) {
      mismatches.push({
        bodyPart: config.bodyPart,
        landmarkName: name,
        error,
        direction: getPositionDirection(name, expected, actual, detectedPoints),
      });
    }
  }

  for (const joint of JOINT_ANGLES) {
    totalPossibleWeight += joint.weight;
    const part = partErrorSums.get(joint.bodyPart) ?? { error: 0, weight: 0, possibleWeight: 0, confidence: 0 };
    part.possibleWeight += joint.weight;
    const expectedStart = referencePoints.get(joint.start);
    const expectedCenter = referencePoints.get(joint.center);
    const expectedEnd = referencePoints.get(joint.end);
    const actualStart = detectedPoints.get(joint.start);
    const actualCenter = detectedPoints.get(joint.center);
    const actualEnd = detectedPoints.get(joint.end);
    if (!expectedStart || !expectedCenter || !expectedEnd || !actualStart || !actualCenter || !actualEnd) {
      partErrorSums.set(joint.bodyPart, part);
      continue;
    }

    const referenceAngle = getAngle(expectedStart, expectedCenter, expectedEnd);
    const detectedAngle = getAngle(actualStart, actualCenter, actualEnd);
    const signedDifference = referenceAngle - detectedAngle;
    const error = Math.min(1, Math.abs(signedDifference) / 90);
    const confidence = Math.min(expectedStart.confidence, expectedCenter.confidence, expectedEnd.confidence, actualStart.confidence, actualCenter.confidence, actualEnd.confidence);
    const weight = joint.weight * confidence;
    totalError += error * weight;
    totalWeight += weight;
    confidenceSum += confidence * joint.weight;
    part.error += error * weight;
    part.weight += weight;
    part.confidence += confidence * joint.weight;
    partErrorSums.set(joint.bodyPart, part);
    if (error > 0.15) {
      mismatches.push({
        bodyPart: joint.bodyPart,
        landmarkName: joint.center,
        error,
        direction: getAngleDirection(joint.name, signedDifference),
      });
    }
  }

  const visibleCore = CORE_NAMES.filter((name) => referencePoints.has(name) && detectedPoints.has(name)).length;
  if (totalWeight <= 0 || visibleCore < 6) return null;

  const normalizedError = totalError / totalWeight;
  const score = Math.round(Math.max(0, Math.min(100, (1 - normalizedError) * 100)));
  const bodyPartScores: PoseBodyPartScore[] = Array.from(partErrorSums)
    .filter(([, part]) => part.weight > 0)
    .map(([bodyPart, part]) => ({
      bodyPart,
      score: Math.round(Math.max(0, 100 * (1 - part.error / part.weight))),
      confidence: Math.min(1, part.confidence / part.possibleWeight),
    }));
  const confidence = Math.min(1, confidenceSum / totalPossibleWeight);
  const majorMismatches = mismatches
    .sort((first, second) => second.error - first.error)
    .slice(0, 8);

  return {
    score,
    isAligned: score >= 85 && confidence >= 0.6,
    confidence,
    bodyPartScores,
    missingLandmarks: Array.from(new Set(missingLandmarks)),
    majorMismatches,
    feedback: generatePoseFeedback(majorMismatches),
  };
}