import type { AspectRatioPresetId, CameraFilterPresetId } from "@/lib/camera/capture-utils";
import {
  ASPECT_RATIO_PRESETS,
  FILTER_PRESETS,
  getAspectRatioValue,
} from "@/lib/camera/capture-utils";

type CreativeControlsProps = {
  aspectRatio: AspectRatioPresetId;
  customHeight: number;
  customWidth: number;
  filterIntensity: number;
  filterPreset: CameraFilterPresetId;
  onAspectRatioChange: (value: AspectRatioPresetId) => void;
  onCustomHeightChange: (value: number) => void;
  onCustomWidthChange: (value: number) => void;
  onFilterIntensityChange: (value: number) => void;
  onFilterPresetChange: (value: CameraFilterPresetId) => void;
  onMatchReference: () => void;
  referenceAspectRatio?: number;
};

export function CreativeControls({
  aspectRatio,
  customHeight,
  customWidth,
  filterIntensity,
  filterPreset,
  onAspectRatioChange,
  onCustomHeightChange,
  onCustomWidthChange,
  onFilterIntensityChange,
  onFilterPresetChange,
  onMatchReference,
  referenceAspectRatio,
}: CreativeControlsProps) {
  const aspectRatioValue = getAspectRatioValue(aspectRatio, customWidth, customHeight);
  const hasReferenceMatch = typeof referenceAspectRatio === "number" && Number.isFinite(referenceAspectRatio);

  return (
    <div className="creative-controls" aria-label="Creative controls">
      <div className="creative-section">
        <div className="creative-header">
          <span>Aspect ratio</span>
          {hasReferenceMatch && (
            <button className="inline-action" onClick={onMatchReference} type="button">
              Match reference
            </button>
          )}
        </div>

        <div className="aspect-ratio-strip" role="tablist" aria-label="Aspect ratio presets">
          {ASPECT_RATIO_PRESETS.map((preset) => (
            <button
              aria-pressed={aspectRatio === preset.id}
              className={`aspect-pill${aspectRatio === preset.id ? " is-selected" : ""}`}
              key={preset.id}
              onClick={() => onAspectRatioChange(preset.id)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {aspectRatio === "custom" && (
          <div className="custom-ratio-fields" aria-label="Custom aspect ratio fields">
            <label>
              <span>Width</span>
              <input
                min={1}
                onChange={(event) => onCustomWidthChange(Number(event.target.value) || 1)}
                type="number"
                value={customWidth}
              />
            </label>
            <label>
              <span>Height</span>
              <input
                min={1}
                onChange={(event) => onCustomHeightChange(Number(event.target.value) || 1)}
                type="number"
                value={customHeight}
              />
            </label>
          </div>
        )}

        <div className="ratio-meta">
          <span>Preset</span>
          <strong>{aspectRatioValue.toFixed(2)} : 1</strong>
        </div>
      </div>

      <div className="creative-section">
        <div className="creative-header">
          <span>Film filters</span>
          <button className="inline-action" onClick={() => onFilterPresetChange("none")} type="button">
            Original
          </button>
        </div>

        <div className="filter-strip" role="listbox" aria-label="Film filter presets">
          {FILTER_PRESETS.map((preset) => (
            <button
              aria-pressed={filterPreset === preset.id}
              className={`filter-pill${filterPreset === preset.id ? " is-selected" : ""}`}
              key={preset.id}
              onClick={() => onFilterPresetChange(preset.id)}
              style={{
                background: preset.preview,
              }}
              type="button"
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        <label className="intensity-control" htmlFor="filter-intensity">
          <span>Intensity</span>
          <input
            id="filter-intensity"
            max={100}
            min={0}
            onChange={(event) => onFilterIntensityChange(Number(event.target.value))}
            step={1}
            type="range"
            value={filterIntensity}
          />
          <output>{filterIntensity}%</output>
        </label>
      </div>
    </div>
  );
}
