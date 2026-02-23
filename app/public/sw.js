const CACHE_NAME = 'miloud-coiffeur-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
];

// ============================================================
// INSTALL — Cache core assets
// ============================================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ============================================================
// ACTIVATE — Clean up old caches
// ============================================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// ============================================================
// FETCH — Network first, cache fallback
// ============================================================
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200 && response.type === 'basic' && event.request.method === 'GET') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// ============================================================
// PUSH — Handle incoming push notifications
// ============================================================
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const title = data.title || 'FRESHCUT X';
        const options = {
            body: data.body || 'Notification de votre salon',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: { url: data.url || '/' },
            vibrate: [100, 50, 100],
            tag: data.tag || 'freshcut-notification',
            renotify: true,
            actions: [
                { action: 'open', title: 'Voir' },
                { action: 'dismiss', title: 'Fermer' },
            ],
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
        console.error('Push notification error:', e);
    }
});

// ============================================================
// NOTIFICATION CLICK — Open app or focus existing window
// ============================================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Focus existing tab if open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Open new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
