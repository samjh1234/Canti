const CACHE_NAME = "lyrics-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/aggiungi.html",
  "/record.html",
  "/modifica.html",
  "/db-admin.html",
  "/photos/favicon.png",
  "/photos/logo.png",
  "/photos/icon-192x192.png",
  "/photos/icon-512x512.png",
  "/photos/backgroundfo.png",
  "/manifest.json",
  "/css/styles.css", // Include any CSS
  "/js/main.js", // Include any JavaScript files
  "/unpkg.com/dexie@3.2.2/dist/dexie.min.js", // External scripts
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
