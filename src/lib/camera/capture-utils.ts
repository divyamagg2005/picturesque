import { isBrowser } from "@/utils/environment";

export async function captureVideoFrame(
  video: HTMLVideoElement,
  mirror: boolean,
): Promise<Blob> {
  if (!isBrowser() || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    throw new Error("The camera preview is not ready to capture yet.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("This browser could not prepare a photo.");
  }

  if (mirror) {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("The photo could not be created. Try capturing again."));
        },
        "image/jpeg",
        0.92,
      );
    });
  } finally {
    canvas.width = 0;
    canvas.height = 0;
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