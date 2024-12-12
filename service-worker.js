const CACHE_NAME = "lyrics-pwa-cache-v11"; // Update version number to invalidate old caches
const urlsToCache = [
  "/", 
  "index.html",
  "db.json", // Cache db.json for offline use
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
  "offline.html" // This file should exist to display an offline message
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
  const url = new URL(event.request.url);

  // Handle requests for record.html to ensure it works offline
  if (url.pathname.includes('record.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request)) // Serve from cache if network fails
    );
    return;
  }

  // Handle requests for db.json - Use cache-first strategy
  if (url.pathname.includes('db.json')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log("Serving db.json from cache");
          return response; // Serve from cache
        }
        return fetch(event.request)
          .then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              console.log("db.json cached for offline use");
              return networkResponse;
            });
          })
          .catch((error) => {
            console.error("Failed to fetch db.json:", error);
            return caches.match("/offline.html"); // Fallback to offline page if available
          });
      })
    );
    return;
  }

  // For all other files, serve them from cache first, then fallback to network
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
      }).catch(() => caches.match("/offline.html"));
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
