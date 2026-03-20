import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// Disable native browser scroll restoration — each page manages its own scroll via useEffect
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BookmarksProvider } from './context/BookmarksContext.jsx'
import { SocialProvider } from './context/SocialContext.jsx'
import { DraftsProvider } from './context/DraftsContext.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { LikesProvider } from './context/LikesContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { BroadcastsProvider } from './context/BroadcastsContext.jsx'
import { InterestProvider } from './context/InterestContext.jsx'
import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <SettingsProvider>
              <BookmarksProvider>
                <SocialProvider>
                  <DraftsProvider>
                    <NotificationsProvider>
                      <ChatProvider>
                        <LikesProvider>
                          <BroadcastsProvider>
                            <InterestProvider>
                              <App />
                            </InterestProvider>
                          </BroadcastsProvider>
                        </LikesProvider>
                      </ChatProvider>
                    </NotificationsProvider>
                  </DraftsProvider>
                </SocialProvider>
              </BookmarksProvider>
            </SettingsProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,

)

// Register Service Worker for Push Notifications (existing Web Push / VAPID)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 1. Primary Service Worker (Workbox/PWA) — handles both app caching and Firebase Messaging
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js', { type: 'module' })
        .then(registration => {
          console.log('[SW] Registered successfully:', registration);
        })
        .catch(err => {
          console.error('[SW] Registration failed:', err);
        });
    }
  });
}
