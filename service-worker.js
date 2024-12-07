const CACHE_NAME = "lyrics-pwa-cache-v2"; // Incremented version number
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
  "/unpkg.com/dexie@3.2.2/dist/dexie.min.js", // Dexie.js
  "/unpkg.com/jspdf@2.4.0/dist/jspdf.umd.min.js", // jsPDF for PDF printing
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js", // Remote jsPDF
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css", // Font Awesome Icons
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-solid-900.woff2", // Font Awesome Icons
  "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.5/pdfmake.min.js", // PDFMake for PDF
  "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.5/vfs_fonts.js", // PDF Fonts
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and caching files...");
      return cache.addAll(urlsToCache);
    })
  );
});

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

      return fetch(event.request).then((networkResponse) => {
        // Dynamic Caching: Cache only if not from an external source
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
      });
    }).catch((error) => {
      console.error("Fetch failed; returning offline page instead.", error);
      return caches.match("/offline.html"); // Optionally, show an offline page
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
            console.log(`Deleting outdated cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
