// service-worker.js
const CACHE_NAME = 'wooooordo-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/stats.html',
    '/css/styles.css',
    '/js/game.js',
    '/js/stats.js',
    '/js/utils.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
