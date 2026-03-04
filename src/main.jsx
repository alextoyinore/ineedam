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
import { MessagesProvider } from './context/MessagesContext.jsx'
import { LikesProvider } from './context/LikesContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { BroadcastsProvider } from './context/BroadcastsContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <BookmarksProvider>
              <SocialProvider>
                <DraftsProvider>
                  <NotificationsProvider>
                    <MessagesProvider>
                      <LikesProvider>
                        <BroadcastsProvider>
                          <App />
                        </BroadcastsProvider>
                      </LikesProvider>
                    </MessagesProvider>
                  </NotificationsProvider>
                </DraftsProvider>
              </SocialProvider>
            </BookmarksProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,

)

// Register Service Worker for Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
