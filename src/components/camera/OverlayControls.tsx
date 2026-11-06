import type { OverlayMode } from "@/lib/pose/overlay-utils";
import {
  MAX_OVERLAY_SCALE,
  MIN_OVERLAY_SCALE,
  OVERLAY_POSITION_STEP,
  OVERLAY_SCALE_STEP,
} from "@/lib/pose/overlay-utils";

type OverlayControlsProps = {
  mode: OverlayMode;
  opacity: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  imageAvailable: boolean;
  galleryImageName?: string;
  onModeChange: (mode: OverlayMode) => void;
  onRemoveGalleryImage: () => void;
  onOpacityChange: (opacity: number) => void;
  onScaleChange: (scale: number) => void;
  onMove: (horizontal: number, vertical: number) => void;
  onReset: () => void;
};

export function OverlayControls({
  mode,
  opacity,
  scale,
  offsetX,
  offsetY,
  imageAvailable,
  galleryImageName,
  onModeChange,
  onRemoveGalleryImage,
  onOpacityChange,
  onScaleChange,
  onMove,
  onReset,
}: OverlayControlsProps) {
  return (
    <div className="overlay-controls-shell">
      {galleryImageName && (
        <div className="gallery-reference-controls">
          <div className="gallery-reference-selected">
            <span className="gallery-reference-name" title={galleryImageName}>{galleryImageName}</span>
            <button className="gallery-reference-remove" onClick={onRemoveGalleryImage} type="button">
              Remove
            </button>
          </div>
        </div>
      )}

      <details aria-label="Reference pose overlay settings" className="overlay-controls">
        <summary className="overlay-settings-summary">
          <span className="overlay-summary-title">Pose guide</span>
          <span className="overlay-summary-value">
            {mode === "image" ? "Photo" : "Off"} · {Math.round(opacity * 100)}%
          </span>
          <span aria-hidden="true" className="overlay-summary-chevron">⌄</span>
        </summary>

        <div className="overlay-settings-body">
          <div className="overlay-control-header">
            <span>Reference style</span>
            <button className="overlay-reset-button" onClick={onReset} type="button">
              Reset
            </button>
          </div>

          <div aria-label="Pose guide mode" className="overlay-mode-options" role="group">
            <button aria-pressed={mode === "off"} onClick={() => onModeChange("off")} type="button">
              Off
            </button>
            <button
              aria-pressed={mode === "image"}
              disabled={!imageAvailable}
              onClick={() => onModeChange("image")}
              type="button"
            >
              Photo
            </button>
          </div>

          <label className="overlay-opacity-control">
            <span>Opacity</span>
            <input
              aria-label="Pose guide opacity"
              disabled={mode === "off"}
              max={100}
              min={0}
              onChange={(event) => onOpacityChange(Number(event.target.value) / 100)}
              step={5}
              type="range"
              value={Math.round(opacity * 100)}
            />
            <output>{Math.round(opacity * 100)}%</output>
          </label>

          <div className="overlay-position-controls">
            <div className="overlay-scale-controls" role="group" aria-label="Pose guide size">
              <button aria-label="Decrease pose guide size" disabled={mode === "off" || scale <= MIN_OVERLAY_SCALE} onClick={() => onScaleChange(scale - OVERLAY_SCALE_STEP)} type="button">−</button>
              <span>Size</span>
              <button aria-label="Increase pose guide size" disabled={mode === "off" || scale >= MAX_OVERLAY_SCALE} onClick={() => onScaleChange(scale + OVERLAY_SCALE_STEP)} type="button">+</button>
            </div>
            <div className="overlay-nudge-controls" role="group" aria-label="Move pose guide">
              <button aria-label="Move guide up" disabled={mode === "off"} onClick={() => onMove(0, -OVERLAY_POSITION_STEP)} type="button">↑</button>
              <button aria-label="Move guide left" disabled={mode === "off"} onClick={() => onMove(-OVERLAY_POSITION_STEP, 0)} type="button">←</button>
              <button aria-label="Move guide down" disabled={mode === "off"} onClick={() => onMove(0, OVERLAY_POSITION_STEP)} type="button">↓</button>
              <button aria-label="Move guide right" disabled={mode === "off"} onClick={() => onMove(OVERLAY_POSITION_STEP, 0)} type="button">→</button>
            </div>
            <output className="overlay-position-value">
              {Math.round(offsetX * 100)}%, {Math.round(offsetY * 100)}%
            </output>
          </div>
        </div>
      </details>
    </div>
  );
}