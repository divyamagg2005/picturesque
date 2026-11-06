import type { Pose, ReferencePose } from "@/types";

export function getReferencePose(pose: Pose | undefined): ReferencePose | undefined {
  const referencePose = pose?.referencePose;
  if (!referencePose || referencePose.poseId !== pose?.id) return undefined;
  if (!Number.isFinite(referencePose.aspectRatio) || referencePose.aspectRatio <= 0) return undefined;

  const landmarks = referencePose.landmarks.filter(
    (landmark) =>
      Number.isFinite(landmark.x) && landmark.x >= 0 && landmark.x <= 1 &&
      Number.isFinite(landmark.y) && landmark.y >= 0 && landmark.y <= 1,
  );

  return landmarks.length > 0 ? { ...referencePose, landmarks } : undefined;
}