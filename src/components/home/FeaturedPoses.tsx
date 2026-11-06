import Link from "next/link";
import type { Pose } from "@/types";
import { SectionHeader } from "@/components/common/section-header";
import { PoseGrid } from "@/components/poses/PoseGrid";

type FeaturedPosesProps = {
  poses: Pose[];
  title?: string;
  description?: string;
};

export function FeaturedPoses({
  poses,
  title = "A few good places to start",
  description = "Clear, comfortable ideas for your next photograph.",
}: FeaturedPosesProps) {
  return (
    <section aria-labelledby="featured-poses-heading" className="content-section" id="featured-poses">
      <SectionHeader
        action={<Link className="text-link" href="/explore">See all poses <span aria-hidden="true">↗</span></Link>}
        description={description}
        headingId="featured-poses-heading"
        title={title}
      />
      <PoseGrid poses={poses} />
    </section>
  );
}