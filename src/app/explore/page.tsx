import { Suspense } from "react";
import { Footer } from "@/components/common/footer";
import { Navbar } from "@/components/common/navbar";
import { FeaturedPoses } from "@/components/home/FeaturedPoses";
import { GalleryReferenceAction } from "@/components/camera/GalleryReferenceAction";
import { PoseExplorer } from "@/components/poses/PoseExplorer";
import { poses } from "@/data/poses";
import { POSE_CATEGORIES, type PoseCategory } from "@/types";

type ExplorePageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

function isPoseCategory(value: string | undefined): value is PoseCategory {
  return POSE_CATEGORIES.some((category) => category === value);
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  return (
    <Suspense
      fallback={
        <main className="app-main">
          <Navbar active="explore" />
          <p className="route-loading" role="status">Opening the pose library...</p>
        </main>
      }
    >
      <ExplorePageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ExplorePageContent({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const requestedCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const initialCategory = isPoseCategory(requestedCategory) ? requestedCategory : undefined;
  const featuredPoses = poses.filter((pose) => pose.featured).slice(0, 2);

  return (
    <main className="app-main">
      <Navbar active="explore" />
      <section className="page-intro">
        <p className="hero-kicker">The pose library</p>
        <h1>Find a pose that feels like you.</h1>
        <p>Browse thoughtful prompts for portraits, people, and the places you remember.</p>
      </section>
      <div className="explore-gallery-action">
        <GalleryReferenceAction />
      </div>
      <FeaturedPoses
        description="A few expressive starting points from the collection."
        poses={featuredPoses}
        title="Featured poses"
      />
      <section className="content-section explore-section">
        <div className="explore-heading">
          <h2>All poses</h2>
          <p>Search by name, category, or the kind of photograph you have in mind.</p>
        </div>
        <PoseExplorer initialCategory={initialCategory} poses={poses} />
      </section>
      <Footer />
    </main>
  );
}