// Service Worker for offline functionality
const CACHE_NAME = 'emergency-route-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  // Add other critical assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for offline emergency creation
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-sync') {
    event.waitUntil(
      // Handle offline emergency sync
      console.log('Background sync for emergency data')
    );
  }
});