import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, PenSquare, Bookmark, Bell, Mail, LogOut, MoreHorizontal, Settings } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';


export const Sidebar = ({ onPostClick }) => {
    const location = useLocation();
    const { profile, signOut } = useAuth();
    const { unreadCount } = useNotifications();
    const { unreadThreadsCount } = useMessages();
    const [showLogout, setShowLogout] = useState(false);

    return (
        <aside className="social-sidebar-left">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', padding: '1.25rem 0' }}>

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0 1rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white', fontSize: '1.5rem', flexShrink: 0
                    }}>
                        I
                    </div>
                    <span className="h2 text-gradient nav-text" style={{ margin: 0, fontSize: '1.5rem' }}>Ineedam</span>
                </Link>

                {/* Navigation Links */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                        <Home size={24} />
                        <span className="nav-text">Home</span>
                    </Link>
                    <Link to="/bookmarks" className={`nav-link ${location.pathname === '/bookmarks' ? 'active' : ''}`}>
                        <Bookmark size={24} />
                        <span className="nav-text">Bookmarks</span>
                    </Link>
                    <Link to="/notifications" className={`nav-link ${location.pathname === '/notifications' ? 'active' : ''}`} style={{ position: 'relative' }}>
                        <Bell size={24} />
                        <span className="nav-text">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="nav-badge" style={{
                                position: 'absolute', top: '0.4rem', left: '1.8rem',
                                background: '#ef4444', color: 'white', fontSize: '0.65rem',
                                fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '999px',
                                border: '2px solid var(--bg-base)'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/messages" className={`nav-link ${location.pathname === '/messages' ? 'active' : ''}`} style={{ position: 'relative' }}>
                        <Mail size={24} />
                        <span className="nav-text">Messages</span>
                        {unreadThreadsCount > 0 && (
                            <span className="nav-badge" style={{
                                position: 'absolute', top: '0.4rem', left: '1.8rem',
                                background: '#ef4444', color: 'white', fontSize: '0.65rem',
                                fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '999px',
                                border: '2px solid var(--bg-base)'
                            }}>
                                {unreadThreadsCount}
                            </span>
                        )}
                    </Link>
                    <Link to={profile?.username ? `/${profile.username}` : '#'} className={`nav-link ${profile?.username && location.pathname === `/${profile.username}` ? 'active' : ''}`}>
                        <User size={24} />
                        <span className="nav-text">Profile</span>
                    </Link>
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
                            backdropFilter: 'blur(10px)'
                        }}>
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
                                <Settings size={18} />
                                Settings
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
                                <LogOut size={18} />
                                Sign out
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
