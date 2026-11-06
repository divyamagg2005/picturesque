"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { AlignmentResult, Pose } from "@/types";
import { getReferencePose } from "@/lib/pose/reference-pose-utils";
import { comparePoses } from "@/lib/vision/pose-comparison";
import { smoothAlignment } from "@/lib/vision/alignment-smoothing";
import { usePoseDetection } from "@/hooks/use-pose-detection";
import type { PoseDetectionSnapshot } from "@/types";
import { DetectedPoseOverlay } from "./DetectedPoseOverlay";

type PoseVisionLayerProps = {
  pose: Pose;
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  mirrored: boolean;
};

const MIN_ALIGNMENT_CONFIDENCE = 0.55;

export function PoseVisionLayer({ pose, videoRef, enabled, mirrored }: PoseVisionLayerProps) {
  const referencePose = useMemo(() => getReferencePose(pose), [pose]);
  const [snapshot, setSnapshot] = useState<PoseDetectionSnapshot | null>(null);
  const [alignment, setAlignment] = useState<AlignmentResult | null>(null);
  const [showLiveSkeleton, setShowLiveSkeleton] = useState(true);
  const previousAlignmentRef = useRef<AlignmentResult | null>(null);

  const onDetection = useCallback((nextSnapshot: PoseDetectionSnapshot) => {
    setSnapshot(nextSnapshot);
    if (nextSnapshot.status !== "detected" || !referencePose) {
      previousAlignmentRef.current = null;
      setAlignment(null);
      return;
    }

    const result = comparePoses(referencePose, nextSnapshot.landmarks, {
      detectedAspectRatio: nextSnapshot.sourceWidth / nextSnapshot.sourceHeight,
    });
    if (!result) {
      previousAlignmentRef.current = null;
      setAlignment(null);
      return;
    }

    const smoothed = smoothAlignment(previousAlignmentRef.current, result);
    previousAlignmentRef.current = smoothed;
    setAlignment(smoothed);
  }, [referencePose]);

  const { modelStatus, errorMessage, isLoading, retry } = usePoseDetection({
    enabled,
    onDetection,
    videoRef,
  });

  if (!enabled) return null;

  const visibleScore = alignment && alignment.confidence >= MIN_ALIGNMENT_CONFIDENCE;
  const statusText = modelStatus === "error"
    ? "Pose detection is unavailable. The camera still works."
    : isLoading
      ? "Loading on-device pose detection…"
      : snapshot?.status === "no-person"
        ? "No person detected. Step into the frame."
        : snapshot?.status === "low-confidence"
          ? "Move into view and keep your shoulders and hips visible."
          : snapshot?.personCount && snapshot.personCount > 1
            ? "More than one person detected. Frame one subject for clearer guidance."
            : snapshot?.status === "detected"
              ? referencePose
                ? alignment && alignment.confidence >= MIN_ALIGNMENT_CONFIDENCE
                  ? "Live pose found. Adjust toward the reference."
                  : "Keep your shoulders and hips visible for a reliable match."
                : "Live pose found. Automated matching is unavailable for this pose."
              : "Preparing pose detection…";
  const statusHeading = modelStatus === "error"
    ? "Pose detection unavailable"
    : isLoading
      ? "Preparing pose detection"
      : snapshot?.status === "no-person"
        ? "No person in frame"
        : snapshot?.status === "low-confidence"
          ? "Move into the frame"
          : referencePose
            ? visibleScore ? "Pose match" : "Pose detected"
            : "Live pose";
  const bodyPartScores = visibleScore
    ? alignment.bodyPartScores.filter((part) => part.score < 90).slice(0, 3)
    : [];

  return (
    <>
      {snapshot && snapshot.landmarks.length > 0 && showLiveSkeleton && snapshot.status !== "no-person" && (
        <DetectedPoseOverlay
          landmarks={snapshot.landmarks}
          mirrored={mirrored}
          sourceAspectRatio={snapshot.sourceWidth / snapshot.sourceHeight}
        />
      )}
      <div aria-live="polite" className="pose-vision-panel" role="status">
        <div className="pose-vision-copy">
          <strong>
            {visibleScore ? `Pose match ${alignment.score}%` : statusHeading}
          </strong>
          <span>{statusText}</span>
          {errorMessage && <span className="pose-vision-error">{errorMessage}</span>}
          {bodyPartScores.length > 0 && (
            <span className="pose-body-part-scores" aria-label="Body part alignment">
              {bodyPartScores.map((part) => (
                <span key={part.bodyPart}>{part.bodyPart} {part.score}%</span>
              ))}
            </span>
          )}
          {visibleScore && alignment.feedback.slice(0, 2).map((feedback) => (
            <span className="pose-vision-feedback" key={`${feedback.bodyPart}-${feedback.message}`}>
              {feedback.message}
            </span>
          ))}
        </div>
        <div className="pose-vision-actions">
          {snapshot?.status === "detected" && (
            <button
              aria-pressed={showLiveSkeleton}
              className="pose-vision-toggle"
              onClick={() => setShowLiveSkeleton((visible) => !visible)}
              type="button"
            >
              {showLiveSkeleton ? "Hide live skeleton" : "Show live skeleton"}
            </button>
          )}
          {modelStatus === "error" && (
            <button className="pose-vision-toggle" onClick={retry} type="button">
              Retry
            </button>
          )}
        </div>
      </div>
    </>
  );
}