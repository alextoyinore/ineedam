import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { PostNeedModal } from './PostNeedModal';
import { BottomNav } from './BottomNav';
import { Plus } from 'lucide-react';

export const Layout = ({ children }) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const location = useLocation();

  // Hide FAB and potentially other logic for chat detail view
  const isChatDetail = location.pathname.startsWith('/messages/') && location.pathname.split('/').length > 2;

  return (
    <div className="layout-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>



      <div className="social-layout-grid">
        {/* Left Navigation */}
        <div style={{ width: '250px' }} className="desktop-only">
          <Sidebar onPostClick={() => setIsPostModalOpen(true)} />
        </div>

        {/* Main Feed Activity */}
        <div className="social-main-wrapper">
          <main className={`social-main-content ${isChatDetail ? 'is-chat-detail' : ''}`}>
            {children}
          </main>
        </div>

        {/* Right Widgets */}
        <div style={{ width: '300px' }} className="desktop-only">
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {!isChatDetail && (
        <button
          className="mobile-fab mobile-only"
          onClick={() => setIsPostModalOpen(true)}
          aria-label="Post a Need"
        >
          <Plus size={32} />
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      {!isChatDetail && <BottomNav />}

      {/* Modals */}
      {isPostModalOpen && <PostNeedModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />}
    </div>
  );
};
