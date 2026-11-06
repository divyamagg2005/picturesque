import type { PoseFeedback, PoseMismatch } from "@/types";

function sideName(landmarkName: string | undefined): string {
  if (landmarkName?.startsWith("left_")) return "left";
  if (landmarkName?.startsWith("right_")) return "right";
  return "";
}

function feedbackMessage(mismatch: PoseMismatch): string {
  const side = sideName(mismatch.landmarkName);
  const sidePrefix = side ? `your ${side} ` : "your ";

  if (mismatch.bodyPart === "arms") {
    if (mismatch.direction === "raise") return `Raise ${sidePrefix}arm slightly.`;
    if (mismatch.direction === "lower") return `Lower ${sidePrefix}arm slightly.`;
    if (mismatch.direction === "bend") return `Bend ${sidePrefix}arm a little more.`;
    if (mismatch.direction === "straighten") return `Straighten ${sidePrefix}arm a little.`;
    return `Adjust ${sidePrefix}arm toward the reference.`;
  }

  if (mismatch.bodyPart === "legs") {
    if (mismatch.direction === "outward") return `Move ${sidePrefix}foot outward.`;
    if (mismatch.direction === "inward") return `Move ${sidePrefix}foot inward.`;
    if (mismatch.direction === "bend") return `Bend ${sidePrefix}knee slightly.`;
    if (mismatch.direction === "straighten") return `Straighten ${sidePrefix}leg slightly.`;
    return `Adjust ${sidePrefix}leg toward the reference.`;
  }

  if (mismatch.bodyPart === "shoulders") {
    if (mismatch.direction === "raise") return `Lift ${sidePrefix}shoulder slightly.`;
    if (mismatch.direction === "lower") return `Relax ${sidePrefix}shoulder slightly.`;
    return "Relax your shoulders toward the reference.";
  }

  if (mismatch.bodyPart === "head") {
    if (mismatch.direction === "raise") return "Lift your head slightly.";
    if (mismatch.direction === "lower") return "Lower your chin slightly.";
    return "Adjust your head position slightly.";
  }

  return "Adjust your torso position slightly.";
}

export function generatePoseFeedback(mismatches: PoseMismatch[], maxMessages = 3): PoseFeedback[] {
  const directionPriority = (mismatch: PoseMismatch) =>
    mismatch.direction === "raise" || mismatch.direction === "lower" ||
    mismatch.direction === "inward" || mismatch.direction === "outward"
      ? 1
      : 0;
  const sorted = [...mismatches].sort((first, second) =>
    directionPriority(second) - directionPriority(first) || second.error - first.error,
  );
  const seenParts = new Set<string>();
  const feedback: PoseFeedback[] = [];

  for (const mismatch of sorted) {
    if (seenParts.has(mismatch.bodyPart)) continue;
    seenParts.add(mismatch.bodyPart);
    feedback.push({
      kind: "correction",
      bodyPart: mismatch.bodyPart,
      message: feedbackMessage(mismatch),
    });
    if (feedback.length >= maxMessages) break;
  }

  return feedback;
}