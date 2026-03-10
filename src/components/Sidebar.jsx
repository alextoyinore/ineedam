import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, PenSquare, Bookmark, Bell, Mail, LogOut, MoreHorizontal, Settings, Share2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';


export const Sidebar = ({ onPostClick, onInviteClick, forceIconic = false }) => {
    const location = useLocation();
    const { profile, signOut } = useAuth();
    const { settings } = useSettings();
    const { isDark } = useTheme();

    const { unreadCount } = useNotifications();
    const { unreadThreadsCount } = useMessages();
    const [showLogout, setShowLogout] = useState(false);

    return (
        <aside className={`social-sidebar-left ${forceIconic ? 'force-iconic' : ''}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', padding: '1.25rem 0' }}>

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0 1rem' }} className="sidebar-logo-container">
                    <img src={isDark ? "/logo-dark.svg" : "/logo.svg"} alt="Ineedam Logo" className="full-text-logo" style={{ height: '40px' }} />
                    <img src="/icon.svg" alt="Ineedam Icon" className="icon-only-logo" style={{ height: '40px', display: 'none' }} />
                </Link>

                {/* Navigation Links */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {[
                        { to: '/', label: 'Home', Icon: Home, isActive: location.pathname === '/', fillable: false },
                        { to: '/bookmarks', label: 'Bookmarks', Icon: Bookmark, isActive: location.pathname === '/bookmarks', fillable: true },
                        { to: '/notifications', label: 'Notifications', Icon: Bell, isActive: location.pathname === '/notifications', badge: unreadCount, fillable: true },
                        { to: '/messages', label: 'Messages', Icon: Mail, isActive: location.pathname === '/messages', badge: unreadThreadsCount, fillable: false },
                        { to: profile?.username ? `/${profile.username}` : '#', label: 'Profile', Icon: User, isActive: !!(profile?.username && location.pathname === `/${profile.username}`), fillable: true },
                        { to: '#', label: 'Invite Friends', Icon: Share2, isAction: true, onClick: onInviteClick },
                    ].map(({ to, label, Icon, isActive, badge, fillable, isAction, onClick }) => (
                        <Link
                            key={label}
                            to={to}
                            onClick={isAction ? (e) => { e.preventDefault(); onClick(); } : undefined}
                            className={`nav-link ${isActive ? 'active' : ''}`}
                            style={{ position: 'relative', width: 'fit-content', paddingRight: '1.5rem' }}
                        >
                            <Icon
                                size={24}
                                fill={isActive && fillable ? 'currentColor' : 'none'}
                                strokeWidth={isActive ? (fillable ? 1.5 : 2.5) : 2}
                            />
                            <span className="nav-text">{label}</span>
                            {!isAction && badge > 0 && (
                                <span style={{
                                    position: 'absolute', top: '0.4rem', left: '1.8rem',
                                    background: '#ef4444', color: 'white', fontSize: '0.65rem',
                                    fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '999px',
                                    border: '2px solid var(--bg-base)'
                                }}>
                                    {badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Post Button */}
                <div style={{ padding: '0 1rem', marginTop: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '9999px', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={onPostClick}
                    >
                        <PenSquare size={20} />
                        <span className="nav-text">Post</span>
                    </button>
                </div>

                {/* User Mini Profile at bottom */}
                <div style={{ position: 'relative', marginTop: 'auto' }}>
                    {showLogout && (
                        <div style={{
                            position: 'absolute', bottom: '110%', left: '0.5rem', right: '0.5rem',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            borderRadius: '16px', padding: '0.5rem',
                            zIndex: 10,
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'none' // Ensure no shadow
                        }}>
                            <div className="hide-on-iconic" style={{ padding: '0.5rem 0.5rem', marginBottom: '0.25rem', display: 'flex', justifyContent: 'center' }}>
                                <div className="theme-toggle-container" style={{ width: '100%', overflow: 'hidden' }}>
                                    <ThemeToggle />
                                </div>
                            </div>
                            <div className="hide-on-iconic" style={{ height: '1px', background: 'var(--border-glass)', margin: '0 0 0.4rem 0' }} />
                            <Link
                                to="/settings"
                                onClick={() => setShowLogout(false)}
                                style={{
                                    width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    background: 'transparent', border: 'none', color: 'var(--text-primary)',
                                    cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, borderRadius: '8px',
                                    textDecoration: 'none'
                                }}
                                className="glass-panel-hover"
                            >
                                <Settings size={18} style={{ flexShrink: 0 }} />
                                <span className="nav-text">Settings</span>
                            </Link>
                            <div style={{ height: '1px', background: 'var(--border-glass)', margin: '0.4rem 0' }} />
                            <button
                                onClick={() => signOut()}
                                style={{
                                    width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    background: 'transparent', border: 'none', color: '#ef4444',
                                    cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, borderRadius: '8px'
                                }}
                                className="glass-panel-hover"
                            >
                                <LogOut size={18} style={{ flexShrink: 0 }} />
                                <span className="nav-text">Sign out</span>
                            </button>
                        </div>
                    )}
                    <div
                        onClick={() => setShowLogout(!showLogout)}
                        style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '9999px', cursor: 'pointer', transition: 'background 0.2s' }}
                        className="nav-link-hover"
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                            background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--bg-surface)',
                            border: '1px solid var(--border-glass)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '600', color: 'var(--text-primary)',
                            overflow: 'hidden'
                        }}>
                            {!profile?.avatar_url && (profile?.display_name?.charAt(0) || '?')}
                        </div>
                        <div className="nav-text" style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {profile?.display_name || 'User'}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                @{profile?.username || 'user'}
                            </p>
                        </div>
                        <MoreHorizontal size={18} className="nav-text" style={{ color: 'var(--text-muted)' }} />
                    </div>
                </div>
            </div>
        </aside>
    );
};
