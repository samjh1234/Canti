const CACHE_NAME = "lyrics-pwa-cache-v6"; // Update version to invalidate old caches

const urlsToCache = [ 
  "https://samjh1234.github.io/canti/index.html",
  "https://samjh1234.github.io/canti/scripts/db.json", // Cache db.json for offline use
  "https://samjh1234.github.io/canti/scripts/dexie-export-import.min.js",
  "https://samjh1234.github.io/canti/scripts/dexie.min.js",
  "https://samjh1234.github.io/canti/scripts/jspdf.umd.min.js",
  "https://samjh1234.github.io/canti/fonts/Inria+Serif.css",
  "https://samjh1234.github.io/canti/aggiungi.html", 
  "https://samjh1234.github.io/canti/record.html", 
  "https://samjh1234.github.io/canti/modifica.html", 
  "https://samjh1234.github.io/canti/db-admin.html",
  "https://samjh1234.github.io/canti/cancella.html",
  "https://samjh1234.github.io/canti/photos/favicon.png", 
  "https://samjh1234.github.io/canti/photos/logo.png", 
  "https://samjh1234.github.io/canti/photos/icon-512x512.png", 
  "https://samjh1234.github.io/canti/photos/backgroundfo.png", 
  "https://samjh1234.github.io/canti/photos/printer.png", 
  "https://samjh1234.github.io/canti/photos/copy.png", 
  "https://samjh1234.github.io/canti/manifest.json", 
  "https://samjh1234.github.io/canti/offline.html" // Ensure this file exists for offline fallback
];

//  **Install event - Cache core files**
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).catch((error) => {
      console.error("Cache install failed:", error);
    })
  );
});

//  **Fetch event - Cache-first strategy for assets, network-first for dynamic content**
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return from cache if available
      if (response) {
        return response; 
      }
      
      // Fetch from network if not in cache
      return fetch(event.request).then(networkResponse => {
        // Cache the fetched response
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => caches.match("https://samjh1234.github.io/canti/offline.html")); // Fallback to offline page
    })
  );
});

//  **Activate event - Delete old caches**
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
  // Take control of open pages immediately
  self.clients.claim();
});
