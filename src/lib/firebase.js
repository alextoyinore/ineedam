import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Request notification permission and get the FCM token.
 * Returns the token string, or null if not supported/denied.
 */
export const getFCMToken = async () => {
    if (!('Notification' in window)) return null;
    if (!('serviceWorker' in navigator)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    try {
        // Wait for the PWA service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
        });
        return token || null;
    } catch (err) {
        console.error('[FCM] Failed to get token:', err);
        return null;
    }
};

/**
 * Listen for foreground chats and show a manual notification.
 * onMessage is called when the app is in the foreground.
 */
export const listenForegroundChats = (callback) => {
    return onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message received:', payload);
        callback?.(payload);
    });
};

export { messaging };
