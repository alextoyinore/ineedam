import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bookmark, Bell, Mail, User } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';
import { MobileDrawer } from './MobileDrawer';

export const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const { unreadThreadsCount } = useMessages();
    const { profile } = useAuth();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const profilePath = profile?.username ? `/${profile.username}` : '/dashboard';

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Bookmark, label: 'Saved', path: '/bookmarks' },
        { icon: Bell, label: 'Alerts', path: '/notifications', badge: unreadCount },
        { icon: Mail, label: 'Inbox', path: '/messages', badge: unreadThreadsCount },
        { icon: User, label: 'Profile', isButton: true }
    ];

    return (
        <>
            <nav className="bottom-nav mobile-only">
                {navItems.map((item) => {
                    if (item.isButton) {
                        return (
                            <button
                                key={item.label}
                                onClick={() => setIsDrawerOpen(true)}
                                className={`bottom-nav-item ${isDrawerOpen ? 'active' : ''}`}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                {/* Avatar or Icon */}
                                {profile?.avatar_url ? (
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: `url(${profile.avatar_url}) center/cover`,
                                        marginBottom: '4px'
                                    }} />
                                ) : (
                                    <item.icon size={24} />
                                )}
                                <span>{item.label}</span>
                            </button>
                        )
                    }

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <item.icon size={24} />
                            <span>{item.label}</span>
                            {item.badge > 0 && (
                                <span className="bottom-nav-badge">{item.badge}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>
            <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
};
