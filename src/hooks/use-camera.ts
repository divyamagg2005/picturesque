"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraState } from "@/types";
import { isBrowser } from "@/utils/environment";
import {
  clampZoom,
  getCameraCapabilities,
  getCameraConstraints,
  getCameraError,
  stopMediaStream,
  type CameraCapabilities,
  type CameraDeviceOption,
  type CameraErrorCode,
  type CameraFacingMode,
} from "@/lib/camera/camera-utils";

const DEFAULT_CAPABILITIES: CameraCapabilities = {
  supportsZoom: false,
  minZoom: 1,
  maxZoom: 1,
  stepZoom: 0.1,
  supportsFocus: false,
  supportsExposureCompensation: false,
  supportsWhiteBalance: false,
};

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef(0);
  const [camera, setCamera] = useState<CameraState>({ status: "idle" });
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [hasStream, setHasStream] = useState(false);
  const [errorCode, setErrorCode] = useState<CameraErrorCode | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDeviceOption[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [cameraCapabilities, setCameraCapabilities] = useState<CameraCapabilities>(DEFAULT_CAPABILITIES);
  const [zoom, setZoom] = useState(1);

  const refreshAvailableCameras = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices
      .filter((device) => device.kind === "videoinput")
      .map((device) => ({
        deviceId: device.deviceId,
        facingMode: device.label.toLowerCase().includes("front") ? "user" : device.label.toLowerCase().includes("rear") ? "environment" : undefined,
        label: device.label || (device.deviceId ? "Camera" : "Built-in camera"),
      }));

    setAvailableCameras(videoInputs);
    setSelectedDeviceId((current) => {
      if (current && videoInputs.some((cameraOption) => cameraOption.deviceId === current)) {
        return current;
      }
      return videoInputs[0]?.deviceId ?? null;
    });
  }, []);

  function releaseCurrentStream() {
    const stream = streamRef.current;
    streamRef.current = null;
    stopMediaStream(stream);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }

  async function applyActiveZoom(nextZoom: number, track?: MediaStreamTrack | null) {
    if (!track || typeof track.applyConstraints !== "function") return;

    const capabilities = getCameraCapabilities(track);
    const safeZoom = capabilities.supportsZoom
      ? clampZoom(nextZoom, capabilities.minZoom, capabilities.maxZoom)
      : 1;

    if (capabilities.supportsZoom) {
      setZoom(safeZoom);
      await track.applyConstraints({
        advanced: [{ zoom: safeZoom }],
      } as unknown as MediaTrackConstraints);
    }
  }

  async function startCamera(
    mode: CameraFacingMode = facingMode,
    useDeviceId: string | null = selectedDeviceId,
    nextZoom: number = zoom,
  ): Promise<void> {
    const requestId = ++requestIdRef.current;
    releaseCurrentStream();
    setHasStream(false);
    setErrorCode(null);
    setCamera({ status: "requesting" });

    if (!isBrowser()) {
      setCamera({ status: "error", errorMessage: "Camera access is only available in a browser." });
      setErrorCode("unsupported");
      return;
    }

    if (!window.isSecureContext) {
      setCamera({
        status: "error",
        errorMessage: "Camera access requires a secure connection. Open Picturesque over HTTPS or localhost.",
      });
      setErrorCode("insecure-context");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera({
        status: "error",
        errorMessage: "This browser does not support camera access. Try a current version of Safari or Chrome.",
      });
      setErrorCode("unsupported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        getCameraConstraints({
          deviceId: useDeviceId ?? undefined,
          facingMode: mode,
          zoom: nextZoom,
        } as Parameters<typeof getCameraConstraints>[0]),
      );
      if (requestId !== requestIdRef.current) {
        stopMediaStream(stream);
        return;
      }

      streamRef.current = stream;
      const videoTrack = stream.getVideoTracks()[0];
      const activeFacingMode = videoTrack?.getSettings().facingMode;
      const resolvedMode = activeFacingMode === "user" || activeFacingMode === "environment"
        ? activeFacingMode
        : mode;
      setFacingMode(resolvedMode);
      setHasStream(true);
      const nextCapabilities = getCameraCapabilities(videoTrack);
      setCameraCapabilities(nextCapabilities);
      setZoom((current) => {
        if (!nextCapabilities.supportsZoom) return current;
        return clampZoom(current, nextCapabilities.minZoom, nextCapabilities.maxZoom);
      });

      if (videoTrack && nextCapabilities.supportsZoom) {
        const safeZoom = clampZoom(nextZoom, nextCapabilities.minZoom, nextCapabilities.maxZoom);
        setZoom(safeZoom);
        await videoTrack.applyConstraints({
          advanced: [{ zoom: safeZoom }],
        } as unknown as MediaTrackConstraints);
      }

      const settings = videoTrack?.getSettings();
      setSelectedDeviceId((current) => settings?.deviceId ?? current ?? useDeviceId ?? null);
      setCamera({
        status: "requesting",
        deviceId: settings?.deviceId,
      });

      videoTrack?.addEventListener("ended", () => {
        if (requestId !== requestIdRef.current) return;
        streamRef.current = null;
        setHasStream(false);
        setCamera({ status: "error", errorMessage: "The camera stopped unexpectedly. Retry to reconnect." });
        setErrorCode("unavailable");
      }, { once: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          if (requestId === requestIdRef.current) {
            releaseCurrentStream();
            setHasStream(false);
            setCamera({ status: "error", errorMessage: "The camera started, but the live preview could not play. Try again." });
            setErrorCode("failed");
          }
        }
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const cameraError = getCameraError(error);
      setCamera({ status: "error", errorMessage: cameraError.message });
      setErrorCode(cameraError.code);
    }
  }

  function markVideoReady() {
    if (!streamRef.current) return;
    setCamera((current) => ({ ...current, status: "ready" }));
  }

  function stopCamera() {
    requestIdRef.current += 1;
    releaseCurrentStream();
    setHasStream(false);
    setCamera({ status: "idle" });
    setErrorCode(null);
  }

  async function switchCamera(): Promise<void> {
    if (!streamRef.current && availableCameras.length === 0) return;
    const nextMode = facingMode === "environment" ? "user" : "environment";
    const preferredDevice = availableCameras.find((candidate) => candidate.facingMode === nextMode)
      ?? availableCameras.find((candidate) => candidate.deviceId !== selectedDeviceId)
      ?? null;
    await startCamera(nextMode, preferredDevice?.deviceId ?? null, zoom);
  }

  async function updateZoom(nextZoom: number) {
    const track = streamRef.current?.getVideoTracks()[0];
    const capabilities = getCameraCapabilities(track);
    const safeZoom = capabilities.supportsZoom
      ? clampZoom(nextZoom, capabilities.minZoom, capabilities.maxZoom)
      : 1;

    setZoom(safeZoom);
    await applyActiveZoom(safeZoom, track);
  }

  useEffect(() => {
    void refreshAvailableCameras();
  }, [refreshAvailableCameras]);

  useEffect(() => {
    const videoElement = videoRef.current;

    function stopWhenHidden() {
      if (document.visibilityState !== "hidden") return;

      requestIdRef.current += 1;
      const stream = streamRef.current;
      streamRef.current = null;
      stopMediaStream(stream);
      if (videoElement) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
      setHasStream(false);
      setCamera({ status: "idle" });
      setErrorCode(null);
    }

    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", stopWhenHidden);
      requestIdRef.current += 1;
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      if (videoElement) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
    };
  }, []);

  return {
    availableCameras,
    camera,
    cameraCapabilities,
    errorCode,
    facingMode,
    hasStream,
    markVideoReady,
    selectedDeviceId,
    setSelectedDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
    updateZoom,
    videoRef,
    zoom,
  };
}