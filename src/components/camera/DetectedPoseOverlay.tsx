"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PoseLandmarks } from "@/types";
import { mapReferenceLandmark } from "@/lib/pose/coordinate-transform";
import { SkeletonRenderer } from "./SkeletonRenderer";

type DetectedPoseOverlayProps = {
  landmarks: PoseLandmarks;
  sourceAspectRatio: number;
  mirrored: boolean;
};

export function DetectedPoseOverlay({ landmarks, sourceAspectRatio, mirrored }: DetectedPoseOverlayProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = layerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const bounds = entries[0]?.contentRect;
      if (!bounds) return;
      const width = Math.round(bounds.width);
      const height = Math.round(bounds.height);
      setSize((current) => current.width === width && current.height === height
        ? current
        : { width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const mappedLandmarks = useMemo(() => landmarks.flatMap((landmark) => {
    if ((landmark.visibility ?? 1) < 0.2 || (landmark.presence ?? 1) < 0.2) return [];
    const mapped = mapReferenceLandmark(
      landmark,
      sourceAspectRatio,
      size,
      { scale: 1, offsetX: 0, offsetY: 0, mirrored },
    );
    return mapped ? [mapped] : [];
  }), [landmarks, mirrored, size, sourceAspectRatio]);

  return (
    <div aria-hidden="true" className="live-pose-overlay" ref={layerRef}>
      {size.width > 0 && size.height > 0 && mappedLandmarks.length > 0 && (
        <SkeletonRenderer
          height={size.height}
          landmarks={mappedLandmarks}
          opacity={0.92}
          variant="detected"
          width={size.width}
        />
      )}
    </div>
  );
}