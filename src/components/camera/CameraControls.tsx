import type {
  CameraCapabilities,
  CameraDeviceOption,
  CameraFacingMode,
} from "@/lib/camera/camera-utils";
import { CaptureButton } from "./CaptureButton";

type CameraControlsProps = {
  availableCameras: CameraDeviceOption[];
  cameraCapabilities: CameraCapabilities;
  facingMode: CameraFacingMode;
  gridVisible: boolean;
  disabled: boolean;
  onDeviceChange: (deviceId: string) => void;
  onToggleGrid: () => void;
  onSwitchCamera: () => void;
  onCapture: () => void;
  onZoomChange: (value: number) => void;
  selectedDeviceId: string | null;
  zoom: number;
};

export function CameraControls({
  availableCameras,
  cameraCapabilities,
  facingMode,
  gridVisible,
  disabled,
  onDeviceChange,
  onToggleGrid,
  onSwitchCamera,
  onCapture,
  onZoomChange,
  selectedDeviceId,
  zoom,
}: CameraControlsProps) {
  const supportsZoom = cameraCapabilities.supportsZoom;

  return (
    <div aria-label="Camera controls" className="camera-controls-panel">
      <div className="camera-toolbar-row">
        {availableCameras.length > 1 && (
          <label className="camera-device-picker" htmlFor="camera-device-picker">
            <span>Lens</span>
            <select
              id="camera-device-picker"
              onChange={(event) => onDeviceChange(event.target.value)}
              value={selectedDeviceId ?? availableCameras[0]?.deviceId ?? ""}
            >
              {availableCameras.map((cameraOption) => (
                <option key={cameraOption.deviceId} value={cameraOption.deviceId}>
                  {cameraOption.label || "Camera"}
                </option>
              ))}
            </select>
          </label>
        )}

        {supportsZoom && (
          <label className="camera-zoom-control" htmlFor="camera-zoom">
            <span>Zoom</span>
            <input
              id="camera-zoom"
              max={cameraCapabilities.maxZoom}
              min={cameraCapabilities.minZoom}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              step={cameraCapabilities.stepZoom || 0.1}
              type="range"
              value={zoom}
            />
            <output>{zoom.toFixed(1)}x</output>
          </label>
        )}
      </div>

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
    </div>
  );
}