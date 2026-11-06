"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/common/button";
import type { Pose, ReadinessResult } from "@/types";
import { useCamera } from "@/hooks/use-camera";
import {
  captureVideoFrame,
  downloadPhoto,
  getAspectRatioValue,
  getFilterPreviewStyle,
  sharePhoto,
  type AspectRatioPresetId,
  type CameraFilterPresetId,
} from "@/lib/camera/capture-utils";
import { getReferencePose } from "@/lib/pose/reference-pose-utils";
import {
  deleteGalleryReference,
  readGalleryReference,
  saveGalleryReference,
} from "@/lib/camera/gallery-reference-storage";
import { evaluateReadiness } from "@/lib/vision/readiness";
import {
  clampOverlayOffset,
  clampOverlayOpacity,
  clampOverlayScale,
  DEFAULT_OVERLAY_OPACITY,
  type OverlayMode,
} from "@/lib/pose/overlay-utils";
import { CameraControls } from "./CameraControls";
import { CameraError } from "./CameraError";
import { CameraGrid } from "./CameraGrid";
import { CameraLoading } from "./CameraLoading";
import { CameraPreview } from "./CameraPreview";
import { CreativeControls } from "./CreativeControls";
import { OverlayControls } from "./OverlayControls";
import { PoseOverlay } from "./PoseOverlay";
import { PoseVisionLayer } from "./PoseVisionLayer";

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

type GalleryReferenceImage = {
  name: string;
  src: string;
};

export function CameraView({ pose, invalidPoseId }: CameraViewProps) {
  const {
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
    switchCamera,
    updateZoom,
    videoRef,
    zoom,
  } = useCamera();
  const [gridVisible, setGridVisible] = useState(true);
  const [galleryReference, setGalleryReference] = useState<GalleryReferenceImage | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [readiness, setReadiness] = useState<ReadinessResult>(() => evaluateReadiness(null, { status: "idle" }, null, 0));
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(() =>
    pose?.referenceImage ? "image" : "off",
  );
  const [overlayOpacity, setOverlayOpacity] = useState(DEFAULT_OVERLAY_OPACITY);
  const [overlayScale, setOverlayScale] = useState(1);
  const [overlayOffsetX, setOverlayOffsetX] = useState(0);
  const [overlayOffsetY, setOverlayOffsetY] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPresetId>("standard");
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1350);
  const [filterPreset, setFilterPreset] = useState<CameraFilterPresetId>("none");
  const [filterIntensity, setFilterIntensity] = useState(55);
  const [referenceAspectRatio, setReferenceAspectRatio] = useState<number | undefined>(undefined);
  const aspectRatioRef = useRef<AspectRatioPresetId>("standard");
  const [stageBounds, setStageBounds] = useState({ height: 0, width: 0 });
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const referencePose = useMemo(() => getReferencePose(pose), [pose]);
  const activeReferenceImage = galleryReference?.src ?? pose?.referenceImage;
  const liveFilterStyle = getFilterPreviewStyle(filterPreset, filterIntensity);
  const currentAspectRatio = getAspectRatioValue(aspectRatio, customWidth, customHeight);
  const shortLandscape = stageBounds.width > stageBounds.height && stageBounds.height <= 700;
  const stageHeightBudget = Math.max(
    180,
    stageBounds.height - (shortLandscape ? (pose ? 350 : 320) : (pose ? 345 : stageBounds.width <= 500 ? 205 : 190)),
  );
  const stageWidth = stageBounds.width > 0
    ? Math.min(pose ? 400 : 560, stageBounds.width, stageHeightBudget * currentAspectRatio)
    : undefined;
  const stageHeight = stageWidth ? stageWidth / currentAspectRatio : undefined;

  useEffect(() => {
    const stageWrap = stageWrapRef.current;
    if (!stageWrap) return;

    const updateBounds = () => {
      setStageBounds({ height: window.innerHeight, width: stageWrap.clientWidth });
    };
    const observer = new ResizeObserver(updateBounds);
    observer.observe(stageWrap);
    window.addEventListener("resize", updateBounds);
    updateBounds();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!activeReferenceImage) {
      return () => {
        active = false;
      };
    }

    const referenceImage = new Image();
    referenceImage.onload = () => {
      if (!active) return;
      const ratio = referenceImage.naturalWidth / referenceImage.naturalHeight;
      setReferenceAspectRatio(ratio);
      if (aspectRatioRef.current === "custom") {
        setCustomWidth(Math.max(Math.round(ratio * 1000), 1));
        setCustomHeight(1000);
      }
    };
    referenceImage.onerror = () => {
      if (active) setReferenceAspectRatio(undefined);
    };
    referenceImage.src = activeReferenceImage;

    return () => {
      active = false;
      referenceImage.onload = null;
      referenceImage.onerror = null;
    };
  }, [activeReferenceImage]);

  useEffect(() => {
    let active = true;
    void readGalleryReference().then((storedReference) => {
      if (!active || !storedReference) return;
      setGalleryReference({
        name: storedReference.name || "Gallery image",
        src: URL.createObjectURL(storedReference.blob),
      });
      aspectRatioRef.current = "custom";
      setAspectRatio("custom");
      setOverlayMode("image");
    }).catch(() => {
      if (active) setActionMessage("The saved gallery reference could not be loaded from this device.");
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const src = galleryReference?.src;
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [galleryReference]);

  const handleReadinessChange = useCallback((next: ReadinessResult) => {
    setReadiness((current) =>
      current.state === next.state && current.score === next.score && current.stabilizedForMs === next.stabilizedForMs
        ? current
        : next,
    );
  }, []);

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
      const blob = await captureVideoFrame(video, facingMode === "user", {
        aspectRatio: currentAspectRatio,
        filterIntensity,
        filterPreset,
      });
      const generatedUrl = URL.createObjectURL(blob);
      const cropWidth = Math.max(Math.round(video.videoWidth), 1);
      const cropHeight = Math.max(Math.round(cropWidth / currentAspectRatio), 1);
      setCapturedPhoto({ blob, height: cropHeight, src: generatedUrl, width: cropWidth });
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

  function resetOverlay() {
    setOverlayMode(activeReferenceImage ? "image" : "off");
    setOverlayOpacity(DEFAULT_OVERLAY_OPACITY);
    setOverlayScale(1);
    setOverlayOffsetX(0);
    setOverlayOffsetY(0);
  }

  function moveOverlay(horizontal: number, vertical: number) {
    setOverlayOffsetX((current) => clampOverlayOffset(current + horizontal));
    setOverlayOffsetY((current) => clampOverlayOffset(current + vertical));
  }

  function handleAspectRatioChange(value: AspectRatioPresetId) {
    aspectRatioRef.current = value;
    setAspectRatio(value);
    if (value === "custom" && referenceAspectRatio) {
      setCustomWidth(Math.max(Math.round(referenceAspectRatio * 1000), 1));
      setCustomHeight(1000);
    }
  }

  function matchReferenceAspectRatio() {
    if (!referenceAspectRatio) return;
    aspectRatioRef.current = "custom";
    setAspectRatio("custom");
    setCustomWidth(Math.max(Math.round(referenceAspectRatio * 1000), 1));
    setCustomHeight(1000);
  }

  async function handleGalleryImageSelect(file: File) {
    if (file.type && !file.type.startsWith("image/")) {
      setActionMessage("Choose an image file to use as your reference.");
      return;
    }

    let src: string | null = null;
    try {
      src = URL.createObjectURL(file);
      await saveGalleryReference(file);
      setGalleryReference({ name: file.name || "Gallery image", src });
      src = null;
      aspectRatioRef.current = "custom";
      setAspectRatio("custom");
      setOverlayMode("image");
      setOverlayScale(1);
      setOverlayOffsetX(0);
      setOverlayOffsetY(0);
      setActionMessage("Gallery reference saved on this device.");
    } catch (error) {
      if (src) URL.revokeObjectURL(src);
      setActionMessage(error instanceof Error ? error.message : "The gallery image could not be saved on this device.");
    }
  }

  async function handleRemoveGalleryImage() {
    try {
      await deleteGalleryReference();
      setGalleryReference(null);
      setReferenceAspectRatio(undefined);
      if (pose?.referenceImage) {
        aspectRatioRef.current = "custom";
        setAspectRatio("custom");
        setOverlayMode("image");
      } else {
        aspectRatioRef.current = "standard";
        setAspectRatio("standard");
        setOverlayMode("off");
      }
      setActionMessage("Gallery reference removed from this device.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "The gallery image could not be removed.");
    }
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
    <main className={`camera-app${pose ? " has-pose" : ""}`}>
      <header className="camera-topbar">
        <Link aria-label={pose ? `Back to ${pose.name}` : "Back to poses"} className="camera-back-link" href={backHref}>
          <span aria-hidden="true">←</span> Back
        </Link>
        <div className="camera-pose-heading">
          <span>{pose ? "Selected pose" : galleryReference ? "Gallery reference" : "Pose not selected"}</span>
          <strong>{pose?.name ?? galleryReference?.name ?? "Choose a pose"}</strong>
        </div>
        <Link aria-label="Picturesque home" className="camera-wordmark" href="/">
          picturesque<span>.</span>
        </Link>
      </header>

      <div className="camera-aspect-indicator" aria-live="polite">
        {currentAspectRatio > 1 ? `${currentAspectRatio.toFixed(2)} : 1` : `1 : ${(1 / currentAspectRatio).toFixed(2)}`} · {filterPreset === "none" ? "Original" : filterPreset.toUpperCase()}
      </div>

      <OverlayControls
        galleryImageName={galleryReference?.name}
        imageAvailable={Boolean(activeReferenceImage)}
        mode={overlayMode}
        offsetX={overlayOffsetX}
        offsetY={overlayOffsetY}
        onGalleryImageSelect={(file) => void handleGalleryImageSelect(file)}
        onModeChange={setOverlayMode}
        onMove={moveOverlay}
        onOpacityChange={(opacity) => setOverlayOpacity(clampOverlayOpacity(opacity))}
        onRemoveGalleryImage={() => void handleRemoveGalleryImage()}
        onReset={resetOverlay}
        onScaleChange={(scale) => setOverlayScale(clampOverlayScale(scale))}
        opacity={overlayOpacity}
        scale={overlayScale}
      />

      {invalidPoseId && (
        <p className="camera-notice" role="alert">
          That pose is not in the library. You can choose another pose or continue without one.
        </p>
      )}

      <section aria-label="Camera experience" className="camera-workspace">
        <div className="camera-stage-wrap" ref={stageWrapRef}>
          <div
            aria-label={capturedPhoto ? "Captured photo preview" : "Live camera preview"}
            className={`camera-stage${capturedPhoto ? " is-reviewing" : ""}`}
            style={{
              aspectRatio: currentAspectRatio,
              height: stageHeight ? `${stageHeight}px` : undefined,
              width: stageWidth ? `${stageWidth}px` : undefined,
            }}
          >
            <video
              aria-hidden={capturedPhoto !== null}
              autoPlay
              className={`camera-video${facingMode === "user" ? " is-mirrored" : ""}${capturedPhoto ? " is-obscured" : ""}`}
              muted
              onCanPlay={markVideoReady}
              playsInline
              ref={videoRef}
              style={{ filter: liveFilterStyle }}
              tabIndex={-1}
            />

            {capturedPhoto ? (
              <CameraPreview src={capturedPhoto.src} />
            ) : hasStream ? (
              <>
                {gridVisible && <CameraGrid />}
                {camera.status === "ready" && activeReferenceImage && (
                  <PoseOverlay
                    imageAlt={galleryReference?.name ?? pose?.imageAlt ?? "Gallery reference image"}
                    mirrored={facingMode === "user"}
                    mode={overlayMode}
                    offsetX={overlayOffsetX}
                    offsetY={overlayOffsetY}
                    opacity={overlayOpacity}
                    referenceImage={activeReferenceImage}
                    referencePose={referencePose}
                    scale={overlayScale}
                  />
                )}
                {camera.status !== "ready" && (
                  <p className="camera-stage-status" role="status">Preparing live preview...</p>
                )}
                {pose && (
                  <div
                    aria-live="polite"
                    className={`readiness-badge ${readiness.isReady ? "is-ready" : ""} ${readiness.state === "stabilizing" ? "is-stabilizing" : ""}`}
                    role="status"
                  >
                    <span aria-hidden="true" className="readiness-dot" />
                    {readiness.isReady
                      ? "READY TO CAPTURE"
                      : readiness.state === "stabilizing"
                        ? "Hold that pose…"
                        : readiness.state === "adjusting"
                          ? "Almost there"
                          : readiness.state === "low-confidence"
                            ? "Move into the frame"
                            : readiness.state === "no-person"
                              ? "No person detected"
                              : "Preparing pose detection"}
                  </div>
                )}
                {pose && (
                  <p className="camera-readiness-message">{readiness.message}</p>
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
            {pose && (
              <PoseVisionLayer
                enabled={hasStream && camera.status === "ready" && !capturedPhoto}
                mirrored={facingMode === "user"}
                onReadinessChange={handleReadinessChange}
                pose={pose}
                videoRef={videoRef}
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
        ) : null}
        {!capturedPhoto && camera.status === "ready" && (
          <>
            <CameraControls
              availableCameras={availableCameras}
              cameraCapabilities={cameraCapabilities}
              disabled={isCapturing}
              facingMode={facingMode}
              gridVisible={gridVisible}
              onCapture={() => void handleCapture()}
              onDeviceChange={(deviceId) => {
                setSelectedDeviceId(deviceId);
                void startCamera(facingMode, deviceId, zoom);
              }}
              onSwitchCamera={() => void switchCamera()}
              onToggleGrid={() => setGridVisible((visible) => !visible)}
              onZoomChange={(value) => {
                void updateZoom(value);
              }}
              selectedDeviceId={selectedDeviceId}
              zoom={zoom}
            />
            <CreativeControls
              aspectRatio={aspectRatio}
              customHeight={customHeight}
              customWidth={customWidth}
              filterIntensity={filterIntensity}
              filterPreset={filterPreset}
              onAspectRatioChange={handleAspectRatioChange}
              onCustomHeightChange={setCustomHeight}
              onCustomWidthChange={setCustomWidth}
              onFilterIntensityChange={setFilterIntensity}
              onFilterPresetChange={setFilterPreset}
              onMatchReference={matchReferenceAspectRatio}
              referenceAspectRatio={referenceAspectRatio}
            />
          </>
        )}
        <p aria-live="polite" className="camera-action-message">{actionMessage}</p>
        <p className="camera-privacy-note">Camera stays on this device. Nothing is uploaded.</p>
      </section>
    </main>
  );
}