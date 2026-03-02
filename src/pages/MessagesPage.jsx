import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { MessagePinOverlay } from '../components/MessagePinOverlay';

export const MessagesPage = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // On mobile, the thread list and chat detail are separate views.
    // On desktop, they could be side-by-side, but the user requested a list-to-detail flow.
    const isDetail = location.pathname.split('/').filter(Boolean).length >= 2;

    return (
        <div style={{
            display: 'flex',
            height: isMobile ? (isDetail ? '100dvh' : 'calc(100dvh - var(--mobile-nav-height))') : 'calc(100vh - 2px)',
            width: '100%',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <MessagePinOverlay>
                <Outlet />
            </MessagePinOverlay>
        </div>
    );
};
