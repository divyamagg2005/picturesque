import { isBrowser } from "@/utils/environment";

const STORAGE_KEY = "picturesque.recently-viewed.v1";
const MAX_RECENT_POSES = 6;
const RECENT_POSES_EVENT = "picturesque:recently-viewed";
const EMPTY_SNAPSHOT = "[]";

export function getRecentlyViewedSnapshot(): string {
  if (!isBrowser()) return EMPTY_SNAPSHOT;

  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

export function subscribeToRecentlyViewed(onChange: () => void): () => void {
  if (!isBrowser()) return () => {};

  window.addEventListener("storage", onChange);
  window.addEventListener(RECENT_POSES_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(RECENT_POSES_EVENT, onChange);
  };
}

export function parseRecentlyViewedSnapshot(snapshot: string): string[] {
  try {
    const saved: unknown = JSON.parse(snapshot);
    return Array.isArray(saved)
      ? saved.filter((value): value is string => typeof value === "string").slice(0, MAX_RECENT_POSES)
      : [];
  } catch {
    return [];
  }
}

export function readRecentlyViewedPoseIds(): string[] {
  return parseRecentlyViewedSnapshot(getRecentlyViewedSnapshot());
}

export function recordRecentlyViewedPose(poseId: string): void {
  if (!isBrowser()) return;

  try {
    const next = [poseId, ...readRecentlyViewedPoseIds().filter((savedId) => savedId !== poseId)]
      .slice(0, MAX_RECENT_POSES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECENT_POSES_EVENT));
  } catch {
    // Recent history is optional when browser storage is unavailable.
  }
}