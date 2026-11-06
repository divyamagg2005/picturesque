"use client";

import { useState } from "react";
import type { Pose, PoseCategory } from "@/types";
import { CategoryFilter } from "./CategoryFilter";
import { PoseGrid } from "./PoseGrid";

type PoseExplorerProps = {
  poses: Pose[];
  initialCategory?: PoseCategory;
};

export function PoseExplorer({ poses, initialCategory }: PoseExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PoseCategory | "All poses">(initialCategory ?? "All poses");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = poses.filter((pose) => {
    const matchesCategory = category === "All poses" || pose.category === category;
    const searchableText = `${pose.name} ${pose.category} ${pose.description}`.toLocaleLowerCase();
    return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });

  function resetFilters() {
    setQuery("");
    setCategory("All poses");
  }

  return (
    <section aria-label="Pose library" className="explorer">
      <div className="explore-controls">
        <label className="search-control">
          <span>Search poses</span>
          <input
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try ‘walking’ or ‘soft gaze’"
            type="search"
            value={query}
          />
        </label>
        {query && (
          <button className="clear-search" onClick={() => setQuery("")} type="button">
            Clear
          </button>
        )}
      </div>
      <CategoryFilter onSelect={setCategory} selected={category} />
      <p aria-live="polite" className="result-count">
        {results.length} {results.length === 1 ? "pose" : "poses"}
      </p>
      {results.length > 0 ? (
        <PoseGrid poses={results} />
      ) : (
        <div className="empty-state">
          <h2>No poses found</h2>
          <p>Try a different search or clear the selected category.</p>
          <button className="text-link" onClick={resetFilters} type="button">
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}