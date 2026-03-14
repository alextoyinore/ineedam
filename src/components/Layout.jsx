import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { PostNeedModal } from './PostNeedModal';
import { BottomNav } from './BottomNav';
import { Plus } from 'lucide-react';
import { MobileTopHeader } from './MobileTopHeader';
import { MobileDrawer } from './MobileDrawer';
import { CallModal } from './messages/CallModal';
import { InviteModal } from './InviteModal';
import { useChat } from '../context/ChatContext';
import { useChatSecurity } from '../context/ChatSecurityContext';
import { useAuth } from '../context/AuthContext';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { ProfileCompletionPopup } from './ProfileCompletionPopup';
import { EditProfileModal } from './EditProfileModal';
import { CookieBanner } from './CookieBanner';

export const Layout = ({ children }) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);
  const { user, profile, fetchProfile } = useAuth();
  const { isLocked } = useChatSecurity();
  const {
    call, endCall, acceptCall, localStream, remoteStream, toggleVideo
  } = useChat();
  const { isPromptOpen, setIsPromptOpen } = useProfileCompletion();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const location = useLocation();

  // Hide FAB and potentially other logic for chat detail view
  // Hide branding header and FAB for any deep messaging routes on mobile
  const isChatDetail = location.pathname.includes('/chat/') && location.pathname.split('/').filter(Boolean).length >= 2;
  const isChatRoute = location.pathname.startsWith('/chat');

  return (
    <div className="layout-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isChatDetail && <MobileTopHeader />}



      <div className={`social-layout-grid ${isChatRoute ? 'is-chat-route' : ''}`}>
        {/* Left Navigation */}
        <div className={`sidebar-spacer ${isChatRoute ? 'is-chat-route' : ''}`}>
          <Sidebar
            forceIconic={isChatRoute}
            onPostClick={() => {
              setIsPostModalOpen(true);
              setIsDrawerOpen(false);
            }}
            onInviteClick={() => {
              setIsInviteModalOpen(true);
              setIsDrawerOpen(false);
            }}
          />
        </div>

        {/* Main Feed Activity */}
        <div className={`social-main-wrapper ${isChatRoute ? 'is-chat-route' : ''}`}>
          <main className={`social-main-content ${isChatDetail ? 'is-chat-detail' : ''} ${isChatRoute ? 'is-chat-route' : ''}`}>
            {children}
          </main>
        </div>

        {/* Right Widgets - Hidden on messages route to make room for chat */}
        {!isChatRoute && (
          <div style={{ width: '300px' }} className="desktop-only">
            <RightSidebar />
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      {!isChatDetail && (
        <button
          className="mobile-fab mobile-only"
          onClick={() => {
            setIsPostModalOpen(true);
            setIsDrawerOpen(false);
          }}
          aria-label="Post a Need"
        >
          <Plus size={32} />
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      {!isChatDetail && (
        <BottomNav
          onInviteClick={() => {
            setIsInviteModalOpen(true);
            setIsDrawerOpen(false);
          }}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          shouldFocusSearch={shouldFocusSearch}
          setShouldFocusSearch={setShouldFocusSearch}
        />
      )}

      {/* Modals */}
      {isPostModalOpen && <PostNeedModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />}
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      <ProfileCompletionPopup
        isOpen={isPromptOpen}
        onClose={(shouldEdit) => {
          setIsPromptOpen(false);
          if (shouldEdit === true) setIsEditProfileOpen(true);
        }}
      />

      {isEditProfileOpen && profile && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentProfile={profile}
          onProfileUpdate={() => {
            fetchProfile(user.id);
            setIsEditProfileOpen(false);
          }}
        />
      )}

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setShouldFocusSearch(false);
        }}
        autoFocusSearch={shouldFocusSearch}
        onInviteClick={() => {
          setIsInviteModalOpen(true);
          setIsDrawerOpen(false);
        }}
      />

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
          status={call.status}
          onAccept={acceptCall}
          onReject={() => endCall('rejected')}
          onToggleVideo={toggleVideo}
          localName={profile?.display_name || user?.email}
          localAvatar={profile?.avatar_url}
        />
      )}

      <CookieBanner />
    </div>
  );
};
