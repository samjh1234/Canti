const CACHE_NAME = "lyrics-pwa-cache-v5"; // Update version to invalidate old caches

const urlsToCache = [ 
  "/index.html",
  "/scripts/db.json", // Cache db.json for offline use
  "/scripts/dexie-export-import.min.js",
  "/scripts/dexie.min.js",
  "/scripts/jspdf.umd.min.js",
  "fonts/Inria+Serif.css",
  "aggiungi.html", 
  "record.html", 
  "modifica.html", 
  "db-admin.html",
  "cancella.html",
  "photos/favicon.png", 
  "photos/logo.png", 
  "photos/icon-512x512.png", 
  "photos/backgroundfo.png", 
  "photos/printer.png", 
  "photos/copy.png", 
  "manifest.json", 
  "offline.html" // Make sure this file exists for offline fallback
];

// Install event - Cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and caching files...");
      return Promise.all(
        urlsToCache.map(async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`HTTP Error: ${response.status} for ${url}`);
            }
            await cache.put(url, response);
            console.log(`Successfully cached: ${url}`);
          } catch (error) {
            console.error(`Failed to cache: ${url} - ${error.message}`);
          }
        })
      );
    }).catch((error) => {
      console.error("Cache install failed:", error);
    })
  );
});

// Fetch event - Cache then network strategy
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Serve from cache
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => caches.match("offline.html")); 
    })
  );
});

// Activate event - Delete old caches and activate new cache
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Deleting outdated cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log("Cache cleanup complete.");
    })
  );
  self.clients.claim();
});
