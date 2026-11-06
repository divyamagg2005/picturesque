import type { MappedLandmark } from "@/lib/pose/coordinate-transform";
import { POSE_CONNECTIONS } from "@/lib/pose/skeleton-connections";

type SkeletonRendererProps = {
  landmarks: MappedLandmark[];
  width: number;
  height: number;
  opacity: number;
};

export function SkeletonRenderer({ landmarks, width, height, opacity }: SkeletonRendererProps) {
  const points = new Map(landmarks.map((landmark) => [landmark.name, landmark]));
  const radius = Math.max(3, Math.min(width, height) * 0.007);
  const lineWidth = Math.max(2, radius * 0.72);

  return (
    <svg
      aria-hidden="true"
      className="pose-skeleton"
      preserveAspectRatio="none"
      style={{ opacity }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <g fill="none" stroke="#d8e4d1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={lineWidth}>
        {POSE_CONNECTIONS.map(([startName, endName]) => {
          const start = points.get(startName);
          const end = points.get(endName);
          if (!start || !end) return null;

          return (
            <line
              key={`${startName}-${endName}`}
              vectorEffect="non-scaling-stroke"
              x1={start.x}
              x2={end.x}
              y1={start.y}
              y2={end.y}
            />
          );
        })}
      </g>
      <g fill="#f0eee7" stroke="#8fa487" strokeWidth={Math.max(1.5, lineWidth * 0.7)}>
        {landmarks.map((landmark) => (
          <circle
            key={landmark.name}
            cx={landmark.x}
            cy={landmark.y}
            r={radius}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}