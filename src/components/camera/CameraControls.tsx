import { useRef } from "react";
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
          <ZoomWheel
            disabled={disabled}
            max={cameraCapabilities.maxZoom}
            min={cameraCapabilities.minZoom}
            onChange={onZoomChange}
            step={cameraCapabilities.stepZoom || 0.1}
            value={zoom}
          />
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

type ZoomWheelProps = {
  disabled: boolean;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
};

function ZoomWheel({ disabled, max, min, onChange, step, value }: ZoomWheelProps) {
  const dragRef = useRef<{ lastX: number; pointerId: number; value: number } | null>(null);
  const safeStep = step > 0 ? step : 0.1;
  const range = Math.max(max - min, safeStep);
  const zoomStops = [...new Set([min, 1, 2, 3, max]
    .filter((stop) => stop >= min && stop <= max)
    .map((stop) => Number(stop.toFixed(2))))]
    .sort((left, right) => left - right);

  function setSteppedZoom(nextValue: number) {
    const steps = Math.round((nextValue - min) / safeStep);
    const steppedValue = Math.min(max, Math.max(min, min + steps * safeStep));
    onChange(Number(steppedValue.toFixed(3)));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const multiplier = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setSteppedZoom(value + safeStep * multiplier);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setSteppedZoom(value - safeStep * multiplier);
    } else if (event.key === "PageUp") {
      event.preventDefault();
      setSteppedZoom(value + safeStep * 10);
    } else if (event.key === "PageDown") {
      event.preventDefault();
      setSteppedZoom(value - safeStep * 10);
    } else if (event.key === "Home") {
      event.preventDefault();
      setSteppedZoom(min);
    } else if (event.key === "End") {
      event.preventDefault();
      setSteppedZoom(max);
    }
  }

  return (
    <div className="camera-zoom-control">
      <div className="zoom-wheel-heading">
        <span>Zoom</span>
        <output aria-live="off">{value.toFixed(1)}x</output>
      </div>
      <div
        aria-label="Zoom level"
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        aria-valuetext={`${value.toFixed(1)} times zoom`}
        aria-disabled={disabled}
        className={`zoom-wheel${disabled ? " is-disabled" : ""}`}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          if (disabled) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = { lastX: event.clientX, pointerId: event.pointerId, value };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const deltaX = event.clientX - drag.lastX;
          const nextValue = drag.value + (deltaX * range) / 220;
          const steps = Math.round((nextValue - min) / safeStep);
          const steppedValue = Math.min(max, Math.max(min, min + steps * safeStep));
          dragRef.current = { lastX: event.clientX, pointerId: event.pointerId, value: steppedValue };
          onChange(Number(steppedValue.toFixed(3)));
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        onWheel={(event) => {
          if (disabled) return;
          event.preventDefault();
          setSteppedZoom(value + (event.deltaY < 0 ? safeStep : -safeStep));
        }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
      >
        <div aria-hidden="true" className="zoom-wheel-ticks">
          {Array.from({ length: 17 }, (_, index) => (
            <span className={index === 8 ? "is-center" : index % 4 === 0 ? "is-major" : ""} key={index} />
          ))}
        </div>
        <span aria-hidden="true" className="zoom-wheel-indicator" />
      </div>
      <div aria-label="Zoom presets" className="zoom-presets">
        {zoomStops.map((stop) => (
          <button
            aria-pressed={Math.abs(value - stop) < safeStep / 2}
            className="zoom-preset"
            disabled={disabled}
            key={stop}
            onClick={() => onChange(stop)}
            type="button"
          >
            {Number.isInteger(stop) ? `${stop}x` : `${stop.toFixed(1)}x`}
          </button>
        ))}
      </div>
    </div>
  );
}