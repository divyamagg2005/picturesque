import { POSE_CATEGORIES, type PoseCategory } from "@/types";

type CategoryFilterProps = {
  selected: PoseCategory | "All poses";
  onSelect: (category: PoseCategory | "All poses") => void;
};

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const categories: Array<PoseCategory | "All poses"> = ["All poses", ...POSE_CATEGORIES];

  return (
    <div aria-label="Filter poses by category" className="category-filter" role="group">
      {categories.map((category) => (
        <button
          aria-pressed={selected === category}
          className={`filter-button${selected === category ? " is-selected" : ""}`}
          key={category}
          onClick={() => onSelect(category)}
          type="button"
        >
          {category}
        </button>
      ))}
    </div>
  );
}