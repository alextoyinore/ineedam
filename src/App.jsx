import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Layout } from './components/Layout';
import { PublicPageWrapper } from './components/PublicPageWrapper';
import { useAuth } from './context/AuthContext';
import { MessageSecurityProvider } from './context/MessageSecurityContext';

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
import { RuleOfEngagementPage } from './pages/RuleOfEngagementPage';
import { MobileWhoToFollowPage } from './pages/MobileWhoToFollowPage';
import { MobileWhatsHappeningPage } from './pages/MobileWhatsHappeningPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PremiumPage } from './pages/PremiumPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { BlockedAccountsPage } from './pages/BlockedAccountsPage';
import { ArchivedContentPage } from './pages/ArchivedContentPage';


// Full-screen spinner while the session is being determined
const AuthLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-base)', color: 'var(--primary)'
  }}>
    <Loader size={48} className="animate-spin" />
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
      <Route path="/500" element={<ServerErrorPage />} />

      {/* ── Public: info pages (no social layout, no auth) ───── */}
      <Route path="/about" element={<PublicPageWrapper><AboutPage /></PublicPageWrapper>} />
      <Route path="/faq" element={<PublicPageWrapper><FAQPage /></PublicPageWrapper>} />
      <Route path="/how-to-use" element={<PublicPageWrapper><HowToUsePage /></PublicPageWrapper>} />
      <Route path="/reset-password" element={<PublicPageWrapper><ResetPasswordPage /></PublicPageWrapper>} />
      <Route path="/privacy" element={<PublicPageWrapper><PrivacyPolicyPage /></PublicPageWrapper>} />
      <Route path="/terms" element={<PublicPageWrapper><TermsOfServicePage /></PublicPageWrapper>} />
      <Route path="/rules" element={<PublicPageWrapper><RuleOfEngagementPage /></PublicPageWrapper>} />

      {/* ── Protected: all app routes inside social layout ────── */}
      <Route path="/*" element={
        <ProtectedRoute>
          <MessageSecurityProvider>
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
                <Route path="/who-to-follow" element={<MobileWhoToFollowPage />} />
                <Route path="/whats-happening" element={<MobileWhatsHappeningPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/blocked-accounts" element={<BlockedAccountsPage />} />
                <Route path="/settings/archived" element={<ArchivedContentPage />} />
                <Route path="/need/:id" element={<NeedDetailPage />} />
                <Route path="/dashboard" element={<Navigate to={`/${useAuth().profile?.username || ''}`} replace />} />
                <Route path="/:username" element={<UserProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </MessageSecurityProvider>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
