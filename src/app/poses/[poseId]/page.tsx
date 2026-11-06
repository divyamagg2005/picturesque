import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/common/footer";
import { Navbar } from "@/components/common/navbar";
import { SectionHeader } from "@/components/common/section-header";
import { PoseDetails } from "@/components/poses/PoseDetails";
import { PoseGrid } from "@/components/poses/PoseGrid";
import { PoseVisitTracker } from "@/components/poses/PoseVisitTracker";
import { getPoseById, poses } from "@/data/poses";

type PosePageProps = {
  params: Promise<{ poseId: string }>;
};

export default function PosePage({ params }: PosePageProps) {
  return (
    <Suspense
      fallback={
        <main className="app-main">
          <Navbar active="explore" />
          <p className="route-loading" role="status">Opening pose...</p>
        </main>
      }
    >
      <PosePageContent params={params} />
    </Suspense>
  );
}

async function PosePageContent({ params }: PosePageProps) {
  const { poseId } = await params;
  const pose = getPoseById(poseId);

  if (!pose) notFound();

  const relatedPoses = poses
    .filter((candidate) => candidate.category === pose.category && candidate.id !== pose.id)
    .slice(0, 3);

  return (
    <main className="app-main">
      <Navbar active="explore" />
      <PoseVisitTracker poseId={pose.id} />
      <article className="content-section detail-section">
        <PoseDetails pose={pose} />
      </article>
      {relatedPoses.length > 0 && (
        <section className="content-section related-section">
          <SectionHeader description={`More ideas from ${pose.category.toLocaleLowerCase()}.`} title="Try another angle" />
          <PoseGrid poses={relatedPoses} />
        </section>
      )}
      <Footer />
    </main>
  );
}