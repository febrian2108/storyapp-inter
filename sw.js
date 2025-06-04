importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const CACHE_NAME = 'storyapps-v1';
const urlsToCache = [
    './',
    './index.html',
    './src/manifest.json',
    './src/public/icons/icon-192x192.png',
    './src/public/icons/icon-512x512.png',
    './src/public/icons/badge-96x96.png',
];

if (workbox) {
    console.log('Workbox berhasil dimuat');

    workbox.precaching.precacheAndRoute([
        { url: './', revision: '1' },
        { url: './index.html', revision: '1' },
        { url: './src/manifest.json', revision: '1' },
        { url: './src/public/icons/icon-192x192.png', revision: '1' },
        { url: './src/public/icons/icon-512x512.png', revision: '1' },
        { url: './src/public/icons/badge-96x96.png', revision: '1' },
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

    // Cache First Strategy for images
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
} else {
    console.log('Workbox gagal dimuat, menggunakan cache manual');
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
                    return response || fetch(event.request);
                })
        );
    });
}

// Push Notification Event
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');

    let notification = {
        title: 'StoryApps',
        options: {
            body: 'Ada pembaruan baru di StoryApps!',
            icon: './src/public/icons/favicon-192x192.png',
            badge: './src/public/icons/favicon-96x96.png',
            vibrate: [100, 50, 100],
            data: { url: './' },
            actions: [
                {
                    action: 'open',
                    title: 'Buka App',
                    icon: './src/public/icons/favicon-192x192.png',
                },
                {
                    action: 'close',
                    title: 'Tutup',
                },
            ],
        },
    };

    if (event.data) {
        try {
            const dataJson = event.data.json();
            notification = { ...notification, ...dataJson };
        } catch (e) {
            console.error('Error parsing push data:', e);
        }
    }

    event.waitUntil(
        self.registration.showNotification(notification.title, notification.options)
    );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : './';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes('index.html') || client.url === urlToOpen) {
                        return client.focus();
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Service Worker Install and Activate
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
                            return cacheName.startsWith('Story-') && cacheName !== CACHE_NAME;
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
