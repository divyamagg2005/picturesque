import type { Pose } from "@/types";
import { PoseCard } from "./PoseCard";

export function PoseGrid({ poses }: { poses: Pose[] }) {
  return (
    <div className="pose-grid">
      {poses.map((pose) => <PoseCard key={pose.id} pose={pose} />)}
    </div>
  );
}