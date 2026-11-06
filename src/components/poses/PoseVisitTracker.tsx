"use client";

import { useEffect } from "react";
import { recordRecentlyViewedPose } from "@/lib/pose/recently-viewed";

export function PoseVisitTracker({ poseId }: { poseId: string }) {
  useEffect(() => {
    recordRecentlyViewedPose(poseId);
  }, [poseId]);

  return null;
}