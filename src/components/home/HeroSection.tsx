import Link from "next/link";
import type { Pose } from "@/types";
import { PoseImage } from "@/components/common/pose-image";
import { GalleryReferenceAction } from "@/components/camera/GalleryReferenceAction";

export function HeroSection({ pose }: { pose: Pose }) {
  return (
    <section aria-labelledby="home-title" className="home-hero">
      <div className="home-hero-copy">
        <p className="hero-kicker">A little direction goes a long way</p>
        <h1 id="home-title">A pose that feels like <em>you.</em></h1>
        <p className="hero-description">
          Explore professional pose references and clear instructions, then make each photograph your own.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/explore">Start shooting</Link>
          <GalleryReferenceAction />
          <Link className="hero-secondary" href="#featured-poses">Browse featured poses <span aria-hidden="true">↓</span></Link>
        </div>
      </div>
      <figure className="home-hero-figure">
        <div className="home-hero-image">
          <PoseImage alt={pose.imageAlt} eager sizes="(max-width: 760px) 100vw, 54vw" src={pose.referenceImage} />
        </div>
        <figcaption>{pose.name} <span>Photograph by {pose.photographer}</span></figcaption>
      </figure>
    </section>
  );
}