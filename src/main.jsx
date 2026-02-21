import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BookmarksProvider } from './context/BookmarksContext.jsx'
import { SocialProvider } from './context/SocialContext.jsx'
import { DraftsProvider } from './context/DraftsContext.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import { MessagesProvider } from './context/MessagesContext.jsx'
import { LikesProvider } from './context/LikesContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <BookmarksProvider>
            <SocialProvider>
              <DraftsProvider>
                <NotificationsProvider>
                  <MessagesProvider>
                    <LikesProvider>
                      <App />
                    </LikesProvider>
                  </MessagesProvider>
                </NotificationsProvider>
              </DraftsProvider>
            </SocialProvider>
          </BookmarksProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
