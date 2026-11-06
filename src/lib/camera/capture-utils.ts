import { isBrowser } from "@/utils/environment";

export const ASPECT_RATIO_PRESETS = [
  { id: "square", label: "1:1", value: 1 },
  { id: "standard", label: "4:3", value: 4 / 3 },
  { id: "classic", label: "3:2", value: 3 / 2 },
  { id: "landscape", label: "16:9", value: 16 / 9 },
  { id: "story", label: "9:16", value: 9 / 16 },
  { id: "portrait", label: "4:5", value: 4 / 5 },
  { id: "custom", label: "Custom", value: 1 },
] as const;

export type AspectRatioPresetId = (typeof ASPECT_RATIO_PRESETS)[number]["id"];

export function getAspectRatioValue(
  presetId: AspectRatioPresetId,
  customWidth: number,
  customHeight: number,
): number {
  if (presetId === "custom") {
    const safeWidth = Math.max(customWidth || 1, 1);
    const safeHeight = Math.max(customHeight || 1, 1);
    return safeWidth / safeHeight;
  }

  const match = ASPECT_RATIO_PRESETS.find((preset) => preset.id === presetId);
  return match?.value ?? 1;
}

export type CameraFilterPresetId =
  | "none"
  | "fqs"
  | "kv80"
  | "grf"
  | "fxn"
  | "dclassic"
  | "cpm"
  | "og";

export const FILTER_PRESETS = [
  { id: "none", label: "None", preview: "linear-gradient(135deg, #f3efe8 0%, #c9c7c2 100%)" },
  { id: "fqs", label: "FQS", preview: "linear-gradient(135deg, #d8b799 0%, #5e6463 100%)" },
  { id: "kv80", label: "KV80", preview: "linear-gradient(135deg, #f4d9a0 0%, #856555 100%)" },
  { id: "grf", label: "GR F", preview: "linear-gradient(135deg, #a7d7d0 0%, #4c5f5d 100%)" },
  { id: "fxn", label: "FXN", preview: "linear-gradient(135deg, #7d9bb4 0%, #daf0ff 100%)" },
  { id: "dclassic", label: "D Classic", preview: "linear-gradient(135deg, #d7d2c5 0%, #6a4b3a 100%)" },
  { id: "cpm", label: "CPM", preview: "linear-gradient(135deg, #8aa7a4 0%, #d7d1c4 100%)" },
  { id: "og", label: "OG", preview: "linear-gradient(135deg, #c6d8ba 0%, #49604a 100%)" },
] as const;

export function getFilterPreset(filterPreset: CameraFilterPresetId) {
  return FILTER_PRESETS.find((preset) => preset.id === filterPreset) ?? FILTER_PRESETS[0];
}

export function getFilterPreviewStyle(filterPreset: CameraFilterPresetId, intensity: number): string {
  if (filterPreset === "none") return `brightness(${1 + intensity * 0.02}) contrast(1)`;

  const amount = intensity / 100;
  const value = 1 + amount * 0.18;

  const presetMap: Record<Exclude<CameraFilterPresetId, "none">, string> = {
    fqs: `contrast(${1.25 + amount * 0.65}) saturate(${1.2 + amount * 0.8}) sepia(${0.2 + amount * 0.28}) brightness(${1.02 + amount * 0.08}) hue-rotate(-8deg)`,
    kv80: `contrast(${1.35 + amount * 0.55}) saturate(${1.05 + amount * 0.55}) sepia(${0.14 + amount * 0.28}) brightness(${1.05 + amount * 0.08}) hue-rotate(-6deg)`,
    grf: `contrast(${1.2 + amount * 0.5}) saturate(${0.9 + amount * 0.7}) grayscale(${0.12 + amount * 0.18}) brightness(${1.03 + amount * 0.09})`,
    fxn: `contrast(${1.4 + amount * 0.6}) saturate(${0.8 + amount * 0.55}) sepia(${0.18 + amount * 0.22}) hue-rotate(10deg) brightness(${1.08 + amount * 0.09})`,
    dclassic: `contrast(${1.3 + amount * 0.45}) saturate(${0.95 + amount * 0.65}) sepia(${0.2 + amount * 0.35}) brightness(${1.01 + amount * 0.08})`,
    cpm: `contrast(${1.25 + amount * 0.5}) saturate(${1.05 + amount * 0.7}) brightness(${1.05 + amount * 0.12}) hue-rotate(-18deg)`,
    og: `contrast(${1.18 + amount * 0.38}) saturate(${1.1 + amount * 0.75}) brightness(${1.02 + amount * 0.05})`,
  };

  return `${presetMap[filterPreset]} saturate(${value})`;
}

export function getCropRect(sourceWidth: number, sourceHeight: number, ratio: number) {
  const sourceRatio = sourceWidth / sourceHeight;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (sourceRatio > ratio) {
    cropWidth = sourceHeight * ratio;
    offsetX = (sourceWidth - cropWidth) / 2;
  } else {
    cropHeight = sourceWidth / ratio;
    offsetY = (sourceHeight - cropHeight) / 2;
  }

  return {
    cropHeight,
    cropWidth,
    offsetX,
    offsetY,
  };
}

function applyPixelAdjustments(pixelData: Uint8ClampedArray, width: number, height: number, filterPreset: CameraFilterPresetId, intensity: number): void {
  const strength = intensity / 100;
  if (filterPreset === "none") return;

  const presetMap: Record<Exclude<CameraFilterPresetId, "none">, { warmth: number; contrast: number; saturation: number; tint: [number, number, number]; grain: number; fade: number; vignette: number }> = {
    fqs: { warmth: 0.18, contrast: 1.2, saturation: 1.25, tint: [12, -3, -7], grain: 0.08, fade: 0.06, vignette: 0.12 },
    kv80: { warmth: 0.2, contrast: 1.3, saturation: 1.1, tint: [18, 8, -12], grain: 0.1, fade: 0.07, vignette: 0.14 },
    grf: { warmth: -0.05, contrast: 1.15, saturation: 0.9, tint: [-6, 8, 4], grain: 0.06, fade: 0.04, vignette: 0.08 },
    fxn: { warmth: -0.12, contrast: 1.35, saturation: 1.0, tint: [-16, 8, 18], grain: 0.09, fade: 0.05, vignette: 0.1 },
    dclassic: { warmth: 0.15, contrast: 1.22, saturation: 1.0, tint: [10, 4, -5], grain: 0.11, fade: 0.09, vignette: 0.12 },
    cpm: { warmth: 0.08, contrast: 1.2, saturation: 1.08, tint: [6, 10, -8], grain: 0.08, fade: 0.04, vignette: 0.1 },
    og: { warmth: 0.06, contrast: 1.1, saturation: 1.12, tint: [2, 5, -4], grain: 0.05, fade: 0.03, vignette: 0.08 },
  };

  const settings = presetMap[filterPreset];
  const grainAmount = settings.grain * strength;

  for (let index = 0; index < pixelData.length; index += 4) {
    const r = pixelData[index];
    const g = pixelData[index + 1];
    const b = pixelData[index + 2];

    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    let red = r;
    let green = g;
    let blue = b;

    red = red * (1 + settings.warmth * strength) + settings.tint[0] * strength;
    blue = blue * (1 - settings.warmth * strength * 0.7) + settings.tint[2] * strength;

    const contrastFactor = settings.contrast + strength * 0.5;
    red = (red - 128) * contrastFactor + 128;
    green = (green - 128) * contrastFactor + 128;
    blue = (blue - 128) * contrastFactor + 128;

    const saturationBoost = settings.saturation + strength * 0.35;
    const grey = luminance * 255;
    red = red * saturationBoost + grey * (1 - saturationBoost);
    green = green * saturationBoost + grey * (1 - saturationBoost);
    blue = blue * saturationBoost + grey * (1 - saturationBoost);

    if (grainAmount > 0) {
      const grainNoise = (Math.random() - 0.5) * 255 * grainAmount;
      red += grainNoise;
      green += grainNoise;
      blue += grainNoise;
    }

    const fade = settings.fade * strength * 0.65;
    red *= 1 - fade;
    green *= 1 - fade;
    blue *= 1 - fade;

    const x = (index / 4) % width;
    const y = Math.floor((index / 4) / width);
    const distance = Math.hypot(x / width - 0.5, y / height - 0.5);
    const vignette = 1 - Math.min(distance * 1.9, 1) * (settings.vignette + strength * 0.22);
    red *= vignette;
    green *= vignette;
    blue *= vignette;

    pixelData[index] = Math.min(255, Math.max(0, red));
    pixelData[index + 1] = Math.min(255, Math.max(0, green));
    pixelData[index + 2] = Math.min(255, Math.max(0, blue));
  }
}

function applyFilterToCanvas(canvas: HTMLCanvasElement, filterPreset: CameraFilterPresetId, intensity: number): HTMLCanvasElement {
  if (filterPreset === "none" || intensity <= 0) return canvas;

  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  applyPixelAdjustments(imageData.data, canvas.width, canvas.height, filterPreset, intensity);
  context.putImageData(imageData, 0, 0);
  return canvas;
}

export async function captureVideoFrame(
  video: HTMLVideoElement,
  mirror: boolean,
  options?: {
    aspectRatio?: number;
    filterPreset?: CameraFilterPresetId;
    filterIntensity?: number;
  },
): Promise<Blob> {
  if (!isBrowser() || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    throw new Error("The camera preview is not ready to capture yet.");
  }

  const ratio = options?.aspectRatio && Number.isFinite(options.aspectRatio) ? options.aspectRatio : 3 / 4;
  const filterPreset = options?.filterPreset ?? "none";
  const filterIntensity = options?.filterIntensity ?? 0;

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = video.videoWidth;
  sourceCanvas.height = video.videoHeight;

  const context = sourceCanvas.getContext("2d");
  if (!context) {
    throw new Error("This browser could not prepare a photo.");
  }

  if (mirror) {
    context.translate(sourceCanvas.width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);

  const targetCanvas = document.createElement("canvas");
  const crop = getCropRect(sourceCanvas.width, sourceCanvas.height, ratio);
  targetCanvas.width = Math.max(Math.round(crop.cropWidth), 1);
  targetCanvas.height = Math.max(Math.round(crop.cropHeight), 1);

  const targetContext = targetCanvas.getContext("2d");
  if (!targetContext) {
    throw new Error("This browser could not crop the captured photo.");
  }

  targetContext.drawImage(
    sourceCanvas,
    crop.offsetX,
    crop.offsetY,
    crop.cropWidth,
    crop.cropHeight,
    0,
    0,
    targetCanvas.width,
    targetCanvas.height,
  );

  const processedCanvas = applyFilterToCanvas(targetCanvas, filterPreset, filterIntensity);

  try {
    return await new Promise<Blob>((resolve, reject) => {
      processedCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("The photo could not be created. Try capturing again."));
        },
        "image/jpeg",
        0.92,
      );
    });
  } finally {
    sourceCanvas.width = 0;
    sourceCanvas.height = 0;
    targetCanvas.width = 0;
    targetCanvas.height = 0;
  }
}

export function downloadPhoto(blob: Blob): void {
  if (!isBrowser()) return;

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `picturesque-${new Date().toISOString().replaceAll(":", "-")}.jpg`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function sharePhoto(blob: Blob): Promise<boolean> {
  if (!isBrowser() || typeof navigator.share !== "function") return false;

  const photo = new File([blob], "picturesque-photo.jpg", { type: "image/jpeg" });
  if (typeof navigator.canShare !== "function" || !navigator.canShare({ files: [photo] })) {
    return false;
  }

  await navigator.share({ files: [photo], title: "A photo from Picturesque" });
  return true;
}