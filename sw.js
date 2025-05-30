importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const CACHE_NAME = 'db-StoryApps';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './public/icons/favicon-192x192.png',
    './public/icons/favicon-152x152.png',
    './public/icons/favicon-96x96.png',
];

if (workbox) {
    console.log('Workbox loaded successfully');

    workbox.precaching.precacheAndRoute([
        { url: './', revision: '1' },
        { url: './index.html', revision: '1' },
        { url: './manifest.json', revision: '1' },
        { url: './public/icons/favicon-192x192.png', revision: '1' },
        { url: './public/icons/favicon-152x152.png', revision: '1' },
        { url: './public/icons/favicon-96x96.png', revision: '1' },
    ]);

    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'document',
        new workbox.strategies.NetworkFirst({
            cacheName: 'pages-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60,
                }),
            ],
        })
    );

    workbox.routing.registerRoute(
        ({ request }) =>
            request.destination === 'style' ||
            request.destination === 'script' ||
            request.destination === 'font',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'assets-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60,
                }),
            ],
        })
    );

    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'image',
        new workbox.strategies.CacheFirst({
            cacheName: 'images-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60,
                }),
            ],
        })
    );

    workbox.routing.registerRoute(
        ({ url }) => url.origin === 'https://story-api.dicoding.dev',
        new workbox.strategies.NetworkFirst({
            cacheName: 'api-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 100,
                    maxAgeSeconds: 5 * 60,
                }),
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
            ],
        })
    );

    workbox.routing.setCatchHandler(({ event }) => {
        if (event.request.destination === 'document') {
            return caches.match('./index.html');
        }
        return Response.error();
    });

} else {
    console.log('Workbox failed to load, using manual cache');

    self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => cache.addAll(urlsToCache))
        );
    });

    self.addEventListener('fetch', (event) => {
        event.respondWith(
            caches.match(event.request).then((response) => response || fetch(event.request))
        );
    });
}

self.addEventListener('push', function (event) {
    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch (err) {
        data = { title: 'Notifikasi', body: event.data ? event.data.text() : 'Anda menerima notifikasi.' };
    }

    const title = data.title || 'Notifikasi Baru';
    const options = {
        body: data.body || 'Anda menerima notifikasi.',
        icon: 'public/icons/favicon-192x192.png',
        badge: 'public/icons/favicon-72x72.png',
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});


self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');

    event.waitUntil(
        Promise.all([
            clients.claim(),
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName.startsWith('db-StoryApps') && cacheName !== CACHE_NAME;
                        })
                        .map((cacheName) => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
        ])
    );
});
