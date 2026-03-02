// Service worker for handling push notifications
/* eslint-disable no-restricted-globals */

self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'You have a new message',
            icon: '/icon.svg',
            badge: '/favicon.svg',
            data: {
                url: data.url || '/'
            },
            actions: [
                { action: 'open', title: 'Open' }
            ],
            vibrate: [100, 50, 100],
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'ineedam', options)
        );
    } catch (err) {
        console.error('Push notification error:', err);
        // Fallback for non-JSON payloads
        const text = event.data.text();
        event.waitUntil(
            self.registration.showNotification('ineedam', {
                body: text,
                icon: '/icon.svg'
            })
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If a window is already open, focus it
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
