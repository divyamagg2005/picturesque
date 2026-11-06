export type CameraStatus = "idle" | "requesting" | "ready" | "error";

export interface CameraState {
  status: CameraStatus;
  deviceId?: string;
  errorMessage?: string;
}