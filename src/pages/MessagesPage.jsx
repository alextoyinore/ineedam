import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { MessagePinOverlay } from '../components/MessagePinOverlay';
import { MessageThreads } from './messages/MessageThreads';

export const MessagesPage = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // On mobile, the thread list and chat detail are separate views.
    const isDetail = location.pathname.split('/').filter(Boolean).length >= 2;

    if (isMobile) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: isDetail ? '100dvh' : 'calc(100dvh - var(--mobile-nav-height))',
                width: '100%',
                position: 'relative'
            }}>
                <MessagePinOverlay>
                    <Outlet />
                </MessagePinOverlay>
            </div>
        );
    }

    // Desktop: Split view
    return (
        <div style={{
            display: 'flex',
            height: 'calc(100vh - 2px)',
            width: '100%',
            position: 'relative'
        }}>
            <MessagePinOverlay>
                <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                    {/* Left Pane: Thread List */}
                    <div style={{
                        width: '350px',
                        borderRight: '1px solid var(--border-glass)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        overflowY: 'auto'
                    }}>
                        <MessageThreads isSplitView={true} />
                    </div>
                    {/* Right Pane: Chat Detail or Placeholder */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        {isDetail ? (
                            <Outlet />
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Your Messages</h3>
                                    <p>Select a conversation from the sidebar to start chatting.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </MessagePinOverlay>
        </div>
    );
};
