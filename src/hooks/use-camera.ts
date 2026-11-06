"use client";

import { useEffect, useRef, useState } from "react";
import type { CameraState } from "@/types";
import { isBrowser } from "@/utils/environment";
import {
  getCameraConstraints,
  getCameraError,
  stopMediaStream,
  type CameraErrorCode,
  type CameraFacingMode,
} from "@/lib/camera/camera-utils";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef(0);
  const [camera, setCamera] = useState<CameraState>({ status: "idle" });
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [hasStream, setHasStream] = useState(false);
  const [errorCode, setErrorCode] = useState<CameraErrorCode | null>(null);

  function releaseCurrentStream() {
    const stream = streamRef.current;
    streamRef.current = null;
    stopMediaStream(stream);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }

  async function startCamera(mode: CameraFacingMode = facingMode): Promise<void> {
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
      const stream = await navigator.mediaDevices.getUserMedia(getCameraConstraints(mode));
      if (requestId !== requestIdRef.current) {
        stopMediaStream(stream);
        return;
      }

      streamRef.current = stream;
      const videoTrack = stream.getVideoTracks()[0];
      const activeFacingMode = videoTrack?.getSettings().facingMode;
      setFacingMode(
        activeFacingMode === "user" || activeFacingMode === "environment"
          ? activeFacingMode
          : mode,
      );
      setHasStream(true);
      setCamera({
        status: "requesting",
        deviceId: videoTrack?.getSettings().deviceId,
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
    if (!streamRef.current) return;
    const nextMode = facingMode === "environment" ? "user" : "environment";
    await startCamera(nextMode);
  }

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
    camera,
    errorCode,
    facingMode,
    hasStream,
    markVideoReady,
    startCamera,
    stopCamera,
    switchCamera,
    videoRef,
  };
}