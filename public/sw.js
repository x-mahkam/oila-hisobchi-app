// Service Worker for Oila Hisobchi
const CACHE_NAME = 'oila-hisobchi-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first or pass-through to avoid caching development/dynamic API requests incorrectly
  return;
});
