const CACHE_NAME = "picturesque-v1";
const APP_SHELL = [
  "/",
  "/explore",
  "/camera",
  "/manifest.webmanifest",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match("/offline.html") || caches.match("/")),
    );
    return;
  }

  if (
    request.url.startsWith(self.location.origin) ||
    request.url.startsWith("https://images.unsplash.com") ||
    request.url.startsWith("https://storage.googleapis.com/mediapipe-models") ||
    request.url.startsWith("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => caches.match("/offline.html") || caches.match(request));
      }),
    );
  }
});
