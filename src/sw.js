// Service worker for handling push notifications
/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// The self.__WB_MANIFEST is injected by workbox during the build process
precacheAndRoute(self.__WB_MANIFEST);

// Initialize Firebase in the service worker
// These variables are injected by Vite at build time
const firebaseApp = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

const messaging = getMessaging(firebaseApp);

// Handle FCM background messages
onBackgroundMessage(messaging, (payload) => {
    console.log('[FCM SW] Background message received:', payload);

    const { title, body, icon, image } = payload.notification || {};
    const data = payload.data || {};
    const clickAction = data.url || '/';

    const notificationOptions = {
        body: body || 'You have a new notification.',
        icon: icon || '/icon.svg',
        badge: '/badge.png', // Assuming badge.png exists in public
        image: image || data.image,
        data: { url: clickAction },
        vibrate: [100, 50, 100],
    };

    return self.registration.showNotification(title || 'ineedam', notificationOptions);
});

// Existing custom push handler (for Supabase/VAPID)
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
