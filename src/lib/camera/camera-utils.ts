export type CameraFacingMode = "environment" | "user";

export type CameraErrorCode =
  | "permission-denied"
  | "unavailable"
  | "in-use"
  | "unsupported"
  | "insecure-context"
  | "constraints"
  | "failed";

export interface CameraError {
  code: CameraErrorCode;
  message: string;
}

export interface CameraDeviceOption {
  deviceId: string;
  label: string;
  facingMode?: string;
}

export interface CameraCapabilities {
  supportsZoom: boolean;
  minZoom: number;
  maxZoom: number;
  stepZoom: number;
  supportsFocus: boolean;
  supportsExposureCompensation: boolean;
  supportsWhiteBalance: boolean;
}

export function getCameraConstraints(options: {
  facingMode: CameraFacingMode;
  deviceId?: string | null;
  zoom?: number;
}): MediaStreamConstraints {
  const videoConstraints: MediaTrackConstraints = {
    facingMode: { ideal: options.facingMode },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  if (options.deviceId) {
    videoConstraints.deviceId = { exact: options.deviceId };
  }

  if (typeof options.zoom === "number") {
    (videoConstraints as Record<string, unknown>).advanced = [{ zoom: options.zoom }];
  }

  return {
    audio: false,
    video: videoConstraints,
  };
}

export function getCameraCapabilities(track?: MediaStreamTrack | null): CameraCapabilities {
  const capabilities = (track?.getCapabilities?.() ?? {}) as Record<string, any>;
  const zoomCapabilities = capabilities.zoom as { min?: number; max?: number; step?: number } | undefined;

  return {
    supportsZoom: typeof zoomCapabilities?.min === "number" && typeof zoomCapabilities?.max === "number",
    minZoom: zoomCapabilities?.min ?? 1,
    maxZoom: zoomCapabilities?.max ?? 1,
    stepZoom: zoomCapabilities?.step ?? 0.1,
    supportsFocus: typeof capabilities.focusDistance !== "undefined",
    supportsExposureCompensation: typeof capabilities.exposureCompensation !== "undefined",
    supportsWhiteBalance: typeof capabilities.whiteBalanceMode !== "undefined",
  };
}

export function clampZoom(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getCameraError(error: unknown): CameraError {
  const errorName = error instanceof Error ? error.name : "";

  if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
    return {
      code: "permission-denied",
      message: "Camera access was denied. Allow camera access in your browser settings, then try again.",
    };
  }

  if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
    return {
      code: "unavailable",
      message: "No camera was found on this device.",
    };
  }

  if (errorName === "NotReadableError" || errorName === "TrackStartError") {
    return {
      code: "in-use",
      message: "The camera could not start. It may be in use by another app.",
    };
  }

  if (errorName === "OverconstrainedError" || errorName === "ConstraintNotSatisfiedError") {
    return {
      code: "constraints",
      message: "This camera could not use the requested settings. Try again to use another supported mode.",
    };
  }

  if (errorName === "SecurityError") {
    return {
      code: "insecure-context",
      message: "Camera access requires a secure connection. Open Picturesque over HTTPS or localhost.",
    };
  }

  return {
    code: "failed",
    message: "The camera could not start. Check your device and try again.",
  };
}

export function stopMediaStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}