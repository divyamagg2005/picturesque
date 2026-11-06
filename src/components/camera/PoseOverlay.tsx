"use client";

import { useEffect, useRef, useState } from "react";
import type { ReferencePose } from "@/types";
import { mapReferenceLandmark } from "@/lib/pose/coordinate-transform";
import type { OverlayMode } from "@/lib/pose/overlay-utils";
import { ReferenceImageOverlay } from "./ReferenceImageOverlay";
import { SkeletonRenderer } from "./SkeletonRenderer";

type PoseOverlayProps = {
  mode: OverlayMode;
  referencePose?: ReferencePose;
  referenceImage?: string;
  imageAlt: string;
  opacity: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  mirrored: boolean;
};

export function PoseOverlay({
  mode,
  referencePose,
  referenceImage,
  imageAlt,
  opacity,
  scale,
  offsetX,
  offsetY,
  mirrored,
}: PoseOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (mode !== "skeleton" || !referencePose || !containerRef.current) return;

    const element = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const bounds = entries[0]?.contentRect;
      if (!bounds) return;

      const width = Math.round(bounds.width);
      const height = Math.round(bounds.height);
      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [mode, referencePose]);

  if (mode === "off") return null;

  if (mode === "image") {
    if (!referenceImage) return null;
    return (
      <div className="pose-overlay" data-overlay-mode="image">
        <ReferenceImageOverlay
          alt={imageAlt}
          mirrored={mirrored}
          offsetX={offsetX}
          offsetY={offsetY}
          opacity={opacity}
          scale={scale}
          src={referenceImage}
        />
      </div>
    );
  }

  if (!referencePose) return null;

  const landmarks = referencePose.landmarks.flatMap((landmark) => {
    if (landmark.visibility !== undefined && landmark.visibility < 0.1) return [];
    const mapped = mapReferenceLandmark(
      landmark,
      referencePose.aspectRatio,
      size,
      { scale, offsetX, offsetY, mirrored },
    );
    return mapped ? [mapped] : [];
  });

  return (
    <div className="pose-overlay" data-overlay-mode="skeleton" ref={containerRef}>
      {size.width > 0 && size.height > 0 && landmarks.length > 0 && (
        <SkeletonRenderer
          height={size.height}
          landmarks={landmarks}
          opacity={opacity}
          width={size.width}
        />
      )}
    </div>
  );
}