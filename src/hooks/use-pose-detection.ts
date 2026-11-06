"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import type { PoseDetectionSnapshot, PoseModelStatus } from "@/types";
import { loadPoseLandmarkerModel } from "@/lib/vision/model-cache";
import { POSE_LANDMARKER_MODEL } from "@/lib/vision/model-config";
import { selectPrimaryPose } from "@/lib/vision/landmark-processing";

export type PoseDetectionListener = (snapshot: PoseDetectionSnapshot) => void;

type UsePoseDetectionOptions = {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  onDetection: PoseDetectionListener;
};

type VideoFrameRequestVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: (now: number) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

export function usePoseDetection({ videoRef, enabled, onDetection }: UsePoseDetectionOptions) {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const listenerRef = useRef(onDetection);
  const failedRef = useRef(false);
  const [landmarker, setLandmarker] = useState<PoseLandmarker | null>(null);
  const [modelStatus, setModelStatus] = useState<PoseModelStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    listenerRef.current = onDetection;
  }, [onDetection]);

  useEffect(() => {
    return () => {
      landmarker?.close();
    };
  }, [landmarker]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!enabled || !videoElement || failedRef.current) return;
    const video = videoElement as VideoFrameRequestVideo;

    let cancelled = false;
    let scheduledFrameId: number | null = null;
    let scheduledWithVideoFrameCallback = false;
    let lastInferenceTime = 0;
    let lastPublishedTime = 0;
    let lastPublishedStatus: string | null = null;
    let lastVideoTime = -1;
    let lastTimestamp = 0;
    const abortController = new AbortController();
    const minimumFrameIntervalMs = 1000 / POSE_LANDMARKER_MODEL.maxInferenceFps;

    function cancelScheduledFrame() {
      if (scheduledFrameId === null) return;
      if (scheduledWithVideoFrameCallback) video.cancelVideoFrameCallback?.(scheduledFrameId);
      else cancelAnimationFrame(scheduledFrameId);
      scheduledFrameId = null;
    }

    function scheduleNextFrame() {
      if (cancelled || document.visibilityState === "hidden" || scheduledFrameId !== null) return;

      if (video.requestVideoFrameCallback) {
        scheduledWithVideoFrameCallback = true;
        scheduledFrameId = video.requestVideoFrameCallback((now) => {
          scheduledFrameId = null;
          processFrame(now);
          scheduleNextFrame();
        });
      } else {
        scheduledWithVideoFrameCallback = false;
        scheduledFrameId = requestAnimationFrame((now) => {
          scheduledFrameId = null;
          processFrame(now);
          scheduleNextFrame();
        });
      }
    }

    function processFrame(now: number) {
      const currentLandmarker = landmarkerRef.current;
      if (
        cancelled ||
        !currentLandmarker ||
        document.visibilityState === "hidden" ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0 ||
        video.currentTime === lastVideoTime ||
        now - lastInferenceTime < minimumFrameIntervalMs
      ) return;

      lastVideoTime = video.currentTime;
      lastInferenceTime = now;
      lastTimestamp = Math.max(Math.floor(now), lastTimestamp + 1);

      try {
        const result = currentLandmarker.detectForVideo(video, lastTimestamp);
        const snapshot = selectPrimaryPose(result.landmarks, video.videoWidth, video.videoHeight);
        if (
          now - lastPublishedTime >= POSE_LANDMARKER_MODEL.uiPublishIntervalMs ||
          snapshot.status !== lastPublishedStatus
        ) {
          lastPublishedTime = now;
          lastPublishedStatus = snapshot.status;
          listenerRef.current(snapshot);
        }
      } catch (error) {
        if (cancelled) return;
        failedRef.current = true;
        landmarkerRef.current = null;
        setLandmarker(null);
        setModelStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Pose detection stopped unexpectedly.",
        );
        cancelScheduledFrame();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") cancelScheduledFrame();
      else scheduleNextFrame();
    }

    async function initializeAndRun() {
      try {
        let currentLandmarker = landmarkerRef.current;

        if (!currentLandmarker) {
          const visionTasks = await import("@mediapipe/tasks-vision");
          if (cancelled) return;
          setModelStatus("loading");

          const [wasmFileset, modelBytes] = await Promise.all([
            visionTasks.FilesetResolver.forVisionTasks(POSE_LANDMARKER_MODEL.wasmBaseUrl),
            loadPoseLandmarkerModel(abortController.signal),
          ]);
          if (cancelled) return;

          const options = {
            runningMode: "VIDEO" as const,
            numPoses: POSE_LANDMARKER_MODEL.numPoses,
            minPoseDetectionConfidence: 0.55,
            minPosePresenceConfidence: 0.55,
            minTrackingConfidence: 0.55,
            outputSegmentationMasks: false,
          };

          try {
            currentLandmarker = await visionTasks.PoseLandmarker.createFromOptions(wasmFileset, {
              ...options,
              baseOptions: { modelAssetBuffer: modelBytes.slice(), delegate: "GPU" },
            });
          } catch {
            if (cancelled) return;
            currentLandmarker = await visionTasks.PoseLandmarker.createFromOptions(wasmFileset, {
              ...options,
              baseOptions: { modelAssetBuffer: modelBytes.slice(), delegate: "CPU" },
            });
          }

          if (cancelled) {
            currentLandmarker.close();
            return;
          }

          landmarkerRef.current = currentLandmarker;
          setLandmarker(currentLandmarker);
        }

        if (cancelled) return;
        setModelStatus("ready");
        setErrorMessage("");
        scheduleNextFrame();
      } catch (error) {
        if (cancelled) return;
        failedRef.current = true;
        setModelStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Pose detection could not be initialized.",
        );
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    void initializeAndRun();

    return () => {
      cancelled = true;
      abortController.abort();
      cancelScheduledFrame();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, retryToken, videoRef]);

  function retry() {
    failedRef.current = false;
    setErrorMessage("");
    setModelStatus("idle");
    setRetryToken((current) => current + 1);
  }

  return {
    modelStatus,
    errorMessage,
    retry,
    isLoading: enabled && (modelStatus === "idle" || modelStatus === "loading"),
  };
}