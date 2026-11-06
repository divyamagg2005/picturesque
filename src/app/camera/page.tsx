import { Suspense } from "react";
import Link from "next/link";
import { getPoseById } from "@/data/poses";

type CameraPageProps = {
  searchParams: Promise<{ poseId?: string | string[] }>;
};

export default function CameraPage({ searchParams }: CameraPageProps) {
  return (
    <Suspense
      fallback={
        <main className="camera-placeholder">
          <Link aria-label="Picturesque home" className="wordmark" href="/">
            picturesque<span>.</span>
          </Link>
          <p className="route-loading" role="status">Loading selected pose...</p>
        </main>
      }
    >
      <CameraPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CameraPageContent({ searchParams }: CameraPageProps) {
  const params = await searchParams;
  const requestedId = Array.isArray(params.poseId) ? params.poseId[0] : params.poseId;
  const selectedPose = getPoseById(requestedId);

  return (
    <main className="camera-placeholder">
      <Link aria-label="Picturesque home" className="wordmark" href="/">
        picturesque<span>.</span>
      </Link>
      <section aria-labelledby="camera-title" className="camera-message">
        <p className="hero-kicker">Your next frame</p>
        <h1 id="camera-title">The studio is getting ready.</h1>
        {selectedPose ? (
          <p>Your selected pose: <strong>{selectedPose.name}</strong></p>
        ) : requestedId ? (
          <p>That pose is not in the library. Choose another pose to continue.</p>
        ) : (
          <p>Choose a pose first. Guided shooting arrives in the next development phase.</p>
        )}
        <Link className="button button-primary" href="/explore">
          {selectedPose ? "Choose another pose" : "Explore poses"}
        </Link>
      </section>
    </main>
  );
}