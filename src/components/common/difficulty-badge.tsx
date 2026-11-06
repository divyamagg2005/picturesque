import type { PoseDifficulty } from "@/types";

export function DifficultyBadge({ difficulty }: { difficulty: PoseDifficulty }) {
  const label = difficulty[0].toUpperCase() + difficulty.slice(1);

  return <span className={`difficulty-badge difficulty-${difficulty}`}>{label}</span>;
}