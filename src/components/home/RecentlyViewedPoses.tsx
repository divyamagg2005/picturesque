"use client";

import Link from "next/link";
import { useRecentlyViewedPoseIds } from "@/hooks/use-recently-viewed";
import type { Pose } from "@/types";
import { PoseGrid } from "@/components/poses/PoseGrid";
import { SectionHeader } from "@/components/common/section-header";

export function RecentlyViewedPoses({ poses }: { poses: Pose[] }) {
  const poseIds = useRecentlyViewedPoseIds();
  const recentPoses = poseIds
    .map((poseId) => poses.find((pose) => pose.id === poseId))
    .filter((pose): pose is Pose => pose !== undefined);

  return (
    <section aria-labelledby="recent-title" className="content-section recent-section">
      <SectionHeader description="Pick up where your inspiration left off." headingId="recent-title" title="Recently viewed" />
      {recentPoses.length > 0 ? (
        <PoseGrid poses={recentPoses.slice(0, 3)} />
      ) : (
        <div className="recent-empty">
          <p>Poses you open will be kept here on this device.</p>
          <Link className="text-link" href="/explore">Find your first pose <span aria-hidden="true">↗</span></Link>
        </div>
      )}
    </section>
  );
}