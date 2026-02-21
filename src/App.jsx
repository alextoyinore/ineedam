import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ExplorePage } from './pages/ExplorePage';
import { NeedDetailPage } from './pages/NeedDetailPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SearchPage } from './pages/SearchPage';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { MessageThreads } from './pages/messages/MessageThreads';
import { ChatDetail } from './pages/messages/ChatDetail';

function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/*" element={
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
            <Route path="/need/:id" element={<NeedDetailPage />} />
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}

export default App;
