import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bookmark, Bell, Mail, User, Search } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';

export const BottomNav = ({ onInviteClick, isDrawerOpen, setIsDrawerOpen, shouldFocusSearch, setShouldFocusSearch }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const { unreadThreadsCount } = useMessages();
    const { profile } = useAuth();

    const openSearchDrawer = () => {
        if (isDrawerOpen && shouldFocusSearch) {
            setIsDrawerOpen(false);
            setShouldFocusSearch(false);
        } else {
            setShouldFocusSearch(true);
            setIsDrawerOpen(true);
        }
    };

    const toggleProfileDrawer = () => {
        if (isDrawerOpen && !shouldFocusSearch) {
            setIsDrawerOpen(false);
        } else {
            setShouldFocusSearch(false);
            setIsDrawerOpen(true);
        }
    };

    const profilePath = profile?.username ? `/${profile.username}` : '/dashboard';

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        location.pathname === '/bookmarks'
            ? { icon: Search, label: 'Explore', isButton: true, onClick: openSearchDrawer }
            : { icon: Bookmark, label: 'Saved', path: '/bookmarks' },
        { icon: Bell, label: 'Alerts', path: '/notifications', badge: unreadCount },
        { icon: Mail, label: 'Inbox', path: '/messages', badge: unreadThreadsCount },
        { icon: User, label: 'Profile', isButton: true, onClick: toggleProfileDrawer, useAvatar: true }
    ];

    return (
        <nav className="bottom-nav mobile-only">
            {navItems.map((item) => {
                const isActive = item.isButton
                    ? (isDrawerOpen && ((item.label === 'Explore' && shouldFocusSearch) || (item.label === 'Profile' && !shouldFocusSearch)))
                    : location.pathname === item.path;

                if (item.isButton) {
                    return (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            {/* Avatar or Icon */}
                            {item.useAvatar && profile?.avatar_url ? (
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    background: `url(${profile.avatar_url}) center/cover`,
                                    border: isActive ? '2px solid var(--primary)' : 'none',
                                    marginBottom: '2px'
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
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
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
    );
};
