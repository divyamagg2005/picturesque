import Link from "next/link";
import type { Pose } from "@/types";
import { DifficultyBadge } from "@/components/common/difficulty-badge";
import { PoseImage } from "@/components/common/pose-image";

export function PoseDetails({ pose }: { pose: Pose }) {
  return (
    <>
      <div className="pose-detail-hero">
        <figure className="pose-detail-figure">
          <div className="pose-detail-image">
            <PoseImage
              alt={pose.imageAlt}
              eager
              sizes="(max-width: 760px) 100vw, 58vw"
              src={pose.referenceImage}
            />
          </div>
          <figcaption>
            Reference photograph by <Link href={pose.sourceUrl} rel="noreferrer" target="_blank">{pose.photographer}</Link>
          </figcaption>
        </figure>
        <div className="pose-detail-copy">
          <Link className="back-link" href="/explore">← All poses</Link>
          <p className="detail-category">{pose.category}</p>
          <h1>{pose.name}</h1>
          <DifficultyBadge difficulty={pose.difficulty} />
          <p className="detail-description">{pose.description}</p>
          <Link className="button button-primary" href={`/camera?poseId=${encodeURIComponent(pose.id)}`}>
            Start shooting
          </Link>
        </div>
      </div>
      <div className="pose-instructions">
        <section aria-labelledby="instructions-title">
          <h2 id="instructions-title">How to try it</h2>
          <ol className="instruction-list">
            {pose.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}
          </ol>
        </section>
        <section aria-labelledby="tips-title">
          <h2 id="tips-title">A few helpful tips</h2>
          <ul className="tips-list">
            {pose.tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </section>
      </div>
    </>
  );
}