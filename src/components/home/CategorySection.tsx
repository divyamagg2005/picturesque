import Link from "next/link";
import { POSE_CATEGORIES, type Pose } from "@/types";
import { PoseImage } from "@/components/common/pose-image";
import { SectionHeader } from "@/components/common/section-header";

export function CategorySection({ poses }: { poses: Pose[] }) {
  return (
    <section aria-labelledby="categories-title" className="content-section category-section">
      <SectionHeader description="Choose a kind of photograph and find a pose that fits." headingId="categories-title" title="Explore by mood or moment" />
      <div className="category-grid">
        {POSE_CATEGORIES.map((category) => {
          const firstPose = poses.find((pose) => pose.category === category);
          const count = poses.filter((pose) => pose.category === category).length;

          if (!firstPose) return null;

          return (
            <Link
              className="category-tile"
              href={`/explore?category=${encodeURIComponent(category)}`}
              key={category}
            >
              <div className="category-image">
                <PoseImage alt={firstPose.imageAlt} sizes="(max-width: 640px) 44vw, 24vw" src={firstPose.thumbnail} />
              </div>
              <span className="category-title">{category}</span>
              <span className="category-count">{count} {count === 1 ? "pose" : "poses"}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}