import { POSE_LANDMARKER_MODEL } from "./model-config";

export async function loadPoseLandmarkerModel(signal: AbortSignal): Promise<Uint8Array> {
  const request = new Request(POSE_LANDMARKER_MODEL.url, { mode: "cors" });
  let modelCache: Cache | undefined;

  if (typeof caches !== "undefined") {
    try {
      modelCache = await caches.open(POSE_LANDMARKER_MODEL.cacheName);
      const cachedResponse = await modelCache.match(request);
      if (cachedResponse) return new Uint8Array(await cachedResponse.arrayBuffer());
    } catch {
      modelCache = undefined;
    }
  }

  const response = await fetch(request, { signal });
  if (!response.ok) {
    throw new Error(`The pose model could not be downloaded (HTTP ${response.status}).`);
  }

  const modelBytes = new Uint8Array(await response.clone().arrayBuffer());
  try {
    await modelCache?.put(request, response);
  } catch {
    // Continue with the in-memory model when persistent browser caching is unavailable.
  }

  return modelBytes;
}