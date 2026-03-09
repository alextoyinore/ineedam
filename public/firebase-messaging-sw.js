// Firebase Cloud Messaging — Background Message Handler
// This file is used by Firebase to handle push messages when the app is in the background.
// It MUST be named firebase-messaging-sw.js and placed in the public folder.

/* eslint-disable no-restricted-globals */

importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Firebase config — these are injected at build time or hardcoded here because
// service workers cannot access import.meta.env.
// You MUST replace these with your actual values or inject them during deploy.
firebase.initializeApp({
    apiKey: self.__FIREBASE_CONFIG__?.apiKey || '',
    authDomain: self.__FIREBASE_CONFIG__?.authDomain || '',
    projectId: self.__FIREBASE_CONFIG__?.projectId || '',
    storageBucket: self.__FIREBASE_CONFIG__?.storageBucket || '',
    messagingSenderId: self.__FIREBASE_CONFIG__?.messagingSenderId || '',
    appId: self.__FIREBASE_CONFIG__?.appId || '',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Background message received:', payload);

    const { title, body, icon, data } = payload.notification || {};
    const clickAction = data?.url || '/';

    self.registration.showNotification(title || 'ineedam', {
        body: body || 'You have a new notification.',
        icon: icon || '/icon.svg',
        badge: '/favicon.svg',
        data: { url: clickAction },
        vibrate: [100, 50, 100],
    });
});

// Handle notification click (shared with existing sw.js click handler pattern)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
