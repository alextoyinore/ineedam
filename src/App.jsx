import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Layout } from './components/Layout';
import { PublicPageWrapper } from './components/PublicPageWrapper';
import { useAuth } from './context/AuthContext';
import { ChatSecurityProvider } from './context/ChatSecurityContext';

// Lazy load all pages
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(module => ({ default: module.ExplorePage })));
const NeedDetailPage = lazy(() => import('./pages/NeedDetailPage').then(module => ({ default: module.NeedDetailPage })));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage').then(module => ({ default: module.BookmarksPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(module => ({ default: module.FAQPage })));
const HowToUsePage = lazy(() => import('./pages/HowToUsePage').then(module => ({ default: module.HowToUsePage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage').then(module => ({ default: module.UserProfilePage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage').then(module => ({ default: module.TermsOfServicePage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(module => ({ default: module.ChatPage })));
const ChatThreads = lazy(() => import('./pages/chat/ChatThreads').then(module => ({ default: module.ChatThreads })));
const ChatDetail = lazy(() => import('./pages/chat/ChatDetail').then(module => ({ default: module.ChatDetail })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const RuleOfEngagementPage = lazy(() => import('./pages/RuleOfEngagementPage').then(module => ({ default: module.RuleOfEngagementPage })));
const MobileWhoToFollowPage = lazy(() => import('./pages/MobileWhoToFollowPage').then(module => ({ default: module.MobileWhoToFollowPage })));
const MobileWhatsHappeningPage = lazy(() => import('./pages/MobileWhatsHappeningPage').then(module => ({ default: module.MobileWhatsHappeningPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(module => ({ default: module.CategoriesPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const PremiumPage = lazy(() => import('./pages/PremiumPage').then(module => ({ default: module.PremiumPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const ServerErrorPage = lazy(() => import('./pages/ServerErrorPage').then(module => ({ default: module.ServerErrorPage })));
const BlockedAccountsPage = lazy(() => import('./pages/BlockedAccountsPage').then(module => ({ default: module.BlockedAccountsPage })));
const ArchivedContentPage = lazy(() => import('./pages/ArchivedContentPage').then(module => ({ default: module.ArchivedContentPage })));
const EndorsementDetailPage = lazy(() => import('./pages/EndorsementDetailPage').then(module => ({ default: module.EndorsementDetailPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then(module => ({ default: module.HelpPage })));
const SupportPage = lazy(() => import('./pages/SupportPage').then(module => ({ default: module.SupportPage })));
const VideoIntroPage = lazy(() => import('./pages/VideoIntroPage').then(module => ({ default: module.VideoIntroPage })));

// Full-screen spinner while the session is being determined or pages are loading
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
    <Suspense fallback={<AuthLoader />}>
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
        <Route path="/contact" element={<PublicPageWrapper><ContactPage /></PublicPageWrapper>} />
        <Route path="/rules" element={<PublicPageWrapper><RuleOfEngagementPage /></PublicPageWrapper>} />
        <Route path="/intro" element={<VideoIntroPage />} />

        {/* ── Protected: all app routes inside social layout ────── */}
        <Route path="/*" element={
          <ProtectedRoute>
            <ChatSecurityProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<ExplorePage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/chat" element={<ChatPage />}>
                    <Route index element={<ChatThreads />} />
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
                  <Route path="/endorsement/:id" element={<EndorsementDetailPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/dashboard" element={<Navigate to={`/${useAuth().profile?.username || ''}`} replace />} />
                  <Route path="/:username" element={<UserProfilePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </ChatSecurityProvider>
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
