const CACHE_NAME = "lyrics-pwa-cache-v3"; // Update version number
const urlsToCache = [
  "/", 
  "/index.html", 
  "/aggiungi.html", 
  "/record.html", 
  "/modifica.html", 
  "/db-admin.html", 
  "/photos/favicon.png", 
  "/photos/icon-192x192.png", 
  "/photos/icon-512x512.png", 
  "/photos/backgroundfo.png", 
  "/photos/printer.png", 
  "/photos/copy.png", 
  "/manifest.json", 
  "/offline.html", // Ensure you have an offline.html file
  "/unpkg.com/dexie@3.2.2/dist/dexie.min.js", 
  "/unpkg.com/jspdf@2.4.0/dist/jspdf.umd.min.js", 
  "https://fonts.googleapis.com/css2?family=Inria+Serif:wght@400;700&display=swap", 
  "https://fonts.gstatic.com/s/inriaserif/v9/V8mCoQfRj0c0GFfK8MNhuWODQJ_aN0hH.woff2"
];

// Install event - Cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and caching files...");
      return cache.addAll(urlsToCache);
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

      // Allow fetch requests for JSON or PDF files (like exported records) to bypass cache
      const requestUrl = new URL(event.request.url);
      const fileExtension = requestUrl.pathname.split('.').pop();
      if (fileExtension === 'json' || fileExtension === 'pdf') {
        return fetch(event.request); // Never cache exported files
      }

      // Use network-first strategy for HTML files to always get the latest updates
      if (event.request.mode === 'navigate') {
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => caches.match("/offline.html")); // Fallback to offline page
      }

      // Cache dynamically (only cache same-origin requests, avoid third-party requests)
      return fetch(event.request).then((networkResponse) => {
        if (
          event.request.url.startsWith(self.location.origin) && 
          !event.request.url.includes('json') && 
          !event.request.url.includes('pdf')
        ) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch((error) => {
        console.error("Fetch failed; returning offline page instead.", error);
        return caches.match("/offline.html");
      });
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
  // Take control of open pages immediately (no need for reload)
  self.clients.claim();
});
