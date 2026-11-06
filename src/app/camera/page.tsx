import { Suspense } from "react";
import Link from "next/link";
import { CameraView } from "@/components/camera/CameraView";
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
    <CameraView
      invalidPoseId={Boolean(requestedId && !selectedPose)}
      key={selectedPose?.id ?? "no-pose"}
      pose={selectedPose}
    />
  );
}