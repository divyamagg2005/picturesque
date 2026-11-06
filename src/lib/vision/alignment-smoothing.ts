import type { AlignmentResult, PoseBodyPartScore } from "@/types";

export function smoothAlignment(
  previous: AlignmentResult | null,
  current: AlignmentResult,
  alpha = 0.25,
): AlignmentResult {
  if (!previous || previous.confidence < 0.25) return current;

  const blend = (previousValue: number, currentValue: number) =>
    previousValue + (currentValue - previousValue) * alpha;
  const previousParts = new Map(previous.bodyPartScores.map((part) => [part.bodyPart, part]));
  const bodyPartScores: PoseBodyPartScore[] = current.bodyPartScores.map((part) => {
    const oldPart = previousParts.get(part.bodyPart);
    return oldPart
      ? { ...part, score: Math.round(blend(oldPart.score, part.score)) }
      : part;
  });
  const score = Math.round(blend(previous.score, current.score));

  return {
    ...current,
    score,
    isAligned: score >= 85 && current.confidence >= 0.6,
    bodyPartScores,
  };
}