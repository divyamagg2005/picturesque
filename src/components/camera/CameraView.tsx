"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/button";
import type { Pose } from "@/types";
import { useCamera } from "@/hooks/use-camera";
import { captureVideoFrame, downloadPhoto, sharePhoto } from "@/lib/camera/capture-utils";
import { CameraControls } from "./CameraControls";
import { CameraError } from "./CameraError";
import { CameraGrid } from "./CameraGrid";
import { CameraLoading } from "./CameraLoading";
import { CameraPreview } from "./CameraPreview";

type CameraViewProps = {
  pose?: Pose;
  invalidPoseId: boolean;
};

type CapturedPhoto = {
  blob: Blob;
  height: number;
  src: string;
  width: number;
};

export function CameraView({ pose, invalidPoseId }: CameraViewProps) {
  const {
    camera,
    errorCode,
    facingMode,
    hasStream,
    markVideoReady,
    startCamera,
    switchCamera,
    videoRef,
  } = useCamera();
  const [gridVisible, setGridVisible] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!capturedPhoto) return;
    return () => URL.revokeObjectURL(capturedPhoto.src);
  }, [capturedPhoto]);

  async function handleCapture() {
    const video = videoRef.current;
    if (!video || camera.status !== "ready") return;

    setIsCapturing(true);
    setActionMessage("");
    try {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const blob = await captureVideoFrame(video, facingMode === "user");
      setCapturedPhoto({ blob, height, src: URL.createObjectURL(blob), width });
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "The photo could not be captured. Try again.");
    } finally {
      setIsCapturing(false);
    }
  }

  function handleRetake() {
    setCapturedPhoto(null);
    setActionMessage("");
    if (!hasStream) void startCamera(facingMode);
  }

  function handleDownload() {
    if (!capturedPhoto) return;
    try {
      downloadPhoto(capturedPhoto.blob);
      setActionMessage("A download was requested. Save options depend on your browser.");
    } catch {
      setActionMessage("The photo could not be downloaded in this browser.");
    }
  }

  async function handleShare() {
    if (!capturedPhoto) return;

    try {
      const shared = await sharePhoto(capturedPhoto.blob);
      if (shared) {
        setActionMessage("The browser share sheet was opened.");
      } else {
        downloadPhoto(capturedPhoto.blob);
        setActionMessage("File sharing is not available here. A download was requested instead.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try {
        downloadPhoto(capturedPhoto.blob);
        setActionMessage("Sharing failed. A download was requested instead.");
      } catch {
        setActionMessage("This browser could not share or download the photo.");
      }
    }
  }

  const backHref = pose ? `/poses/${pose.id}` : "/explore";

  return (
    <main className="camera-app">
      <header className="camera-topbar">
        <Link aria-label={pose ? `Back to ${pose.name}` : "Back to poses"} className="camera-back-link" href={backHref}>
          <span aria-hidden="true">←</span> Back
        </Link>
        <div className="camera-pose-heading">
          <span>{pose ? "Selected pose" : "Pose not selected"}</span>
          <strong>{pose?.name ?? "Choose a pose"}</strong>
        </div>
        <Link aria-label="Picturesque home" className="camera-wordmark" href="/">
          picturesque<span>.</span>
        </Link>
      </header>

      {invalidPoseId && (
        <p className="camera-notice" role="alert">
          That pose is not in the library. You can choose another pose or continue without one.
        </p>
      )}

      <section aria-label="Camera experience" className="camera-workspace">
        <div className="camera-stage-wrap">
          <div aria-label={capturedPhoto ? "Captured photo preview" : "Live camera preview"} className={`camera-stage${capturedPhoto ? " is-reviewing" : ""}`}>
            <video
              aria-hidden={capturedPhoto !== null}
              autoPlay
              className={`camera-video${facingMode === "user" ? " is-mirrored" : ""}${capturedPhoto ? " is-obscured" : ""}`}
              muted
              onCanPlay={markVideoReady}
              playsInline
              ref={videoRef}
              tabIndex={-1}
            />

            {capturedPhoto ? (
              <CameraPreview src={capturedPhoto.src} />
            ) : hasStream ? (
              <>
                {gridVisible && <CameraGrid />}
                {camera.status !== "ready" && (
                  <p className="camera-stage-status" role="status">Preparing live preview...</p>
                )}
              </>
            ) : camera.status === "error" ? (
              <CameraError
                errorCode={errorCode}
                message={camera.errorMessage ?? "Check your camera and try again."}
                onRetry={() => void startCamera(facingMode)}
              />
            ) : (
              <CameraLoading
                onStart={() => void startCamera()}
                requesting={camera.status === "requesting"}
              />
            )}
          </div>
          {capturedPhoto && (
            <p className="photo-dimensions">
              Captured at {capturedPhoto.width} × {capturedPhoto.height} pixels. This photo remains on your device.
            </p>
          )}
        </div>

        {capturedPhoto ? (
          <div aria-label="Photo actions" className="photo-actions">
            <Button onClick={handleRetake} type="button" variant="secondary">Retake</Button>
            <Button onClick={handleDownload} type="button">Download</Button>
            <Button onClick={() => void handleShare()} type="button" variant="secondary">Share</Button>
          </div>
        ) : camera.status === "ready" ? (
          <CameraControls
            disabled={isCapturing}
            facingMode={facingMode}
            gridVisible={gridVisible}
            onCapture={() => void handleCapture()}
            onSwitchCamera={() => void switchCamera()}
            onToggleGrid={() => setGridVisible((visible) => !visible)}
          />
        ) : null}

        <p aria-live="polite" className="camera-action-message">{actionMessage}</p>
        <p className="camera-privacy-note">Camera stays on this device. Nothing is uploaded.</p>
      </section>
    </main>
  );
}