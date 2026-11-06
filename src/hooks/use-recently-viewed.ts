"use client";

import { useSyncExternalStore } from "react";
import {
  getRecentlyViewedSnapshot,
  parseRecentlyViewedSnapshot,
  subscribeToRecentlyViewed,
} from "@/lib/pose/recently-viewed";

export function useRecentlyViewedPoseIds(): string[] {
  const snapshot = useSyncExternalStore(
    subscribeToRecentlyViewed,
    getRecentlyViewedSnapshot,
    () => "[]",
  );
  return parseRecentlyViewedSnapshot(snapshot);
}