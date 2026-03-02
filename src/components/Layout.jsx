import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { PostNeedModal } from './PostNeedModal';
import { BottomNav } from './BottomNav';
import { Plus } from 'lucide-react';
import { MobileTopHeader } from './MobileTopHeader';
import { CallModal } from './messages/CallModal';
import { useMessages } from '../context/MessagesContext';
import { useMessageSecurity } from '../context/MessageSecurityContext';

export const Layout = ({ children }) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { isLocked } = useMessageSecurity();
  const { call, endCall, acceptCall, localStream, remoteStream, toggleVideo } = useMessages();
  const location = useLocation();

  // Hide FAB and potentially other logic for chat detail view
  // Hide branding header and FAB for any deep messaging routes on mobile
  const isChatDetail = location.pathname.includes('/messages/') && location.pathname.split('/').filter(Boolean).length >= 2;

  return (
    <div className="layout-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {(!isChatDetail || isLocked) && <MobileTopHeader />}



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

      {/* Global Call Modal */}
      {call && (
        <CallModal
          isOpen={!!call}
          onClose={endCall}
          isIncoming={call.status === 'incoming'}
          callerName={call.partner.name}
          callerAvatar={call.partner.avatar}
          isVideoCall={call.isVideo}
          localStream={localStream}
          remoteStream={remoteStream}
          onAccept={acceptCall}
          onReject={() => endCall('rejected')}
          onToggleVideo={toggleVideo}
        />
      )}
    </div>
  );
};
