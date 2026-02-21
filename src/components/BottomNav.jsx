import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bookmark, Bell, Mail, User } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';

export const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const { unreadThreadsCount } = useMessages();
    const { profile } = useAuth();

    const profilePath = profile?.username ? `/${profile.username}` : '/dashboard';

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Bookmark, label: 'Saved', path: '/bookmarks' },
        { icon: Bell, label: 'Alerts', path: '/notifications', badge: unreadCount },
        { icon: Mail, label: 'Inbox', path: '/messages', badge: unreadThreadsCount },
        { icon: User, label: 'Profile', path: profilePath }
    ];

    return (
        <nav className="bottom-nav mobile-only">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`bottom-nav-item ${location.pathname === item.path || (item.label === 'Profile' && location.pathname.startsWith(`/${profile?.username}`)) ? 'active' : ''}`}
                >
                    <item.icon size={24} />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                        <span className="bottom-nav-badge">{item.badge}</span>
                    )}
                </Link>
            ))}
        </nav>
    );
};
