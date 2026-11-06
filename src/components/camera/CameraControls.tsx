import type { CameraFacingMode } from "@/lib/camera/camera-utils";
import { CaptureButton } from "./CaptureButton";

type CameraControlsProps = {
  facingMode: CameraFacingMode;
  gridVisible: boolean;
  disabled: boolean;
  onToggleGrid: () => void;
  onSwitchCamera: () => void;
  onCapture: () => void;
};

export function CameraControls({
  facingMode,
  gridVisible,
  disabled,
  onToggleGrid,
  onSwitchCamera,
  onCapture,
}: CameraControlsProps) {
  return (
    <div aria-label="Camera controls" className="camera-controls">
      <button
        aria-label={gridVisible ? "Hide rule of thirds grid" : "Show rule of thirds grid"}
        aria-pressed={gridVisible}
        className="camera-control-button"
        onClick={onToggleGrid}
        type="button"
      >
        {gridVisible ? "Grid on" : "Grid off"}
      </button>
      <div className="shutter-control">
        <CaptureButton disabled={disabled} onCapture={onCapture} />
        <span>Take photo</span>
      </div>
      <button
        aria-label={`Switch to ${facingMode === "environment" ? "front" : "rear"} camera`}
        className="camera-control-button"
        disabled={disabled}
        onClick={onSwitchCamera}
        type="button"
      >
        Switch camera
      </button>
    </div>
  );
}