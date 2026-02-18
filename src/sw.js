/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

// Clean up old caches and precache assets
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Skip waiting to activate immediately
self.skipWaiting();
clientsClaim();

// Handle Push Notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const title = data.title || 'FRESHCUT X';
        const options = {
            body: data.body || 'Notification from FRESHCUT X',
            icon: data.icon || '/pwa-192x192.png',
            badge: '/pwa-192x192.png', // Or specific badge if available
            data: data.url ? { url: data.url } : null,
            vibrate: [100, 50, 100],
            actions: [
                {
                    action: 'open_url',
                    title: 'Voir',
                },
            ],
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
        console.error('Push error:', e);
    }
});

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
