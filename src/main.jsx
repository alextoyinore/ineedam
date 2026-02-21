import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { BookmarksProvider } from './context/BookmarksContext.jsx'
import { SocialProvider } from './context/SocialContext.jsx'
import { DraftsProvider } from './context/DraftsContext.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import { MessagesProvider } from './context/MessagesContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <BookmarksProvider>
          <SocialProvider>
            <DraftsProvider>
              <NotificationsProvider>
                <MessagesProvider>
                  <App />
                </MessagesProvider>
              </NotificationsProvider>
            </DraftsProvider>
          </SocialProvider>
        </BookmarksProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
