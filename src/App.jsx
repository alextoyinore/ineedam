import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PublicPageWrapper } from './components/PublicPageWrapper';
import { useAuth } from './context/AuthContext';

import { ExplorePage } from './pages/ExplorePage';
import { NeedDetailPage } from './pages/NeedDetailPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SearchPage } from './pages/SearchPage';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';
import { HowToUsePage } from './pages/HowToUsePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { MessageThreads } from './pages/messages/MessageThreads';
import { ChatDetail } from './pages/messages/ChatDetail';
import { SettingsPage } from './pages/SettingsPage';


// Full-screen spinner while the session is being determined
const AuthLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)',
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      border: '3px solid var(--border-glass)',
      borderTop: '3px solid var(--primary)',
      animation: 'spin 0.8s linear infinite',
    }} />
  </div>
);

// Wraps any route that requires authentication
const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (!session) return <Navigate to="/welcome" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* ── Public: landing & auth ───────────────────────────── */}
      <Route path="/welcome" element={<LandingPage />} />

      {/* ── Public: info pages (no social layout, no auth) ───── */}
      <Route path="/about" element={<PublicPageWrapper><AboutPage /></PublicPageWrapper>} />
      <Route path="/faq" element={<PublicPageWrapper><FAQPage /></PublicPageWrapper>} />
      <Route path="/how-to-use" element={<PublicPageWrapper><HowToUsePage /></PublicPageWrapper>} />
      <Route path="/reset-password" element={<PublicPageWrapper><ResetPasswordPage /></PublicPageWrapper>} />
      <Route path="/privacy" element={<PublicPageWrapper><PrivacyPolicyPage /></PublicPageWrapper>} />
      <Route path="/terms" element={<PublicPageWrapper><TermsOfServicePage /></PublicPageWrapper>} />

      {/* ── Protected: all app routes inside social layout ────── */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<ExplorePage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/messages" element={<MessagesPage />}>
                <Route index element={<MessageThreads />} />
                <Route path=":threadId" element={<ChatDetail />} />
              </Route>
              <Route path="/search" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/need/:id" element={<NeedDetailPage />} />
              <Route path="/dashboard" element={<Navigate to={`/${useAuth().profile?.username || ''}`} replace />} />
              <Route path="/:username" element={<UserProfilePage />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
