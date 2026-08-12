const CACHE_NAME = "ghazatna-pwa-v3";
const PRECACHE = [
  "/images/pwa-icon-192.png",
  "/images/pwa-icon-512.png",
  "/images/pwa-icon-maskable-512.png",
  "/images/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// Cache only static assets (images, fonts, icons).
// Never cache HTML navigation or API calls — stale HTML causes 503 on first open.
const STATIC_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf)(\?.*)?$/i;

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Pass navigation requests (HTML) directly to the network — never serve from cache.
  if (event.request.mode === "navigate") return;

  // Only cache true static assets.
  if (!STATIC_EXTENSIONS.test(url.pathname)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
