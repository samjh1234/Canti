const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = ['index.html', 'backgroundfo.png', 'aggiungi.html', 'favicon.png', 'manifest.json', 'icon-192x192.png','icon-512x512.png', 'db-admin.html', 'logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
