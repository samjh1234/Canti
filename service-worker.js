const CACHE_NAME = "lyrics-pwa-cache-v8"; // Update version number when necessary
const urlsToCache = [
  "/", 
  "index.html",
  "db.json", // Cache the JSON file
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
  "offline.html"
];

// INSTALL - Cache core files
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

// FETCH - Cache-first strategy, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Serve from cache if available
      }

      const requestUrl = new URL(event.request.url);
      const fileExtension = requestUrl.pathname.split('.').pop();
      if (fileExtension === 'json' || fileExtension === 'pdf') {
        console.log(`Fetching ${event.request.url} from network`);
        return fetch(event.request);
      }

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

// ACTIVATE - Clean old caches
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
