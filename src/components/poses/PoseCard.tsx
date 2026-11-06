import Link from "next/link";
import type { Pose } from "@/types";
import { DifficultyBadge } from "@/components/common/difficulty-badge";
import { PoseImage } from "@/components/common/pose-image";

export function PoseCard({ pose }: { pose: Pose }) {
  return (
    <article className="pose-card">
      <Link aria-label={`View ${pose.name}`} className="pose-card-link" href={`/poses/${pose.id}`}>
        <div className="pose-card-image">
          <PoseImage
            alt={pose.imageAlt}
            sizes="(max-width: 640px) 84vw, (max-width: 1024px) 44vw, 30vw"
            src={pose.thumbnail}
          />
        </div>
        <div className="pose-card-copy">
          <div className="pose-card-meta">
            <span>{pose.category}</span>
            <DifficultyBadge difficulty={pose.difficulty} />
          </div>
          <h3>{pose.name}</h3>
          <p>{pose.description}</p>
          <span className="text-link">View pose <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
    </article>
  );
}