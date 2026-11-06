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

export function getCameraConstraints(facingMode: CameraFacingMode): MediaStreamConstraints {
  return {
    audio: false,
    video: {
      facingMode: { ideal: facingMode },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  };
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