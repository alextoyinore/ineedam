import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Settings, HelpCircle, FileText, Shield, Users, TrendingUp, Award } from 'lucide-react';
import { fetchMetCounts } from '../lib/needsService';
import { getFollowStats } from '../lib/socialService';
import { fetchEndorsementsForUser } from '../lib/endorsementService';

export const MobileDrawer = ({ isOpen, onClose }) => {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        needsMet: 0,
        fulfilledRequests: 0,
        followersCount: 0,
        followingCount: 0,
        endorsementsCount: 0
    });

    useEffect(() => {
        if (isOpen && profile) {
            const loadStats = async () => {
                try {
                    const [metStats, followStats, endorsements] = await Promise.all([
                        fetchMetCounts(profile.id),
                        getFollowStats(profile.id),
                        fetchEndorsementsForUser(profile.id)
                    ]);
                    setStats({
                        ...metStats,
                        ...followStats,
                        endorsementsCount: endorsements?.length || 0
                    });
                } catch (err) {
                    console.error("Error loading drawer stats:", err);
                }
            };
            loadStats();
        }
    }, [isOpen, profile]);

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    const handleSignOut = async () => {
        await signOut();
        onClose();
        navigate('/welcome');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1100,
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1102,
                            width: '80%', maxWidth: '300px',
                            background: 'var(--bg-surface)',
                            borderLeft: '1px solid var(--border-glass)',
                            display: 'flex', flexDirection: 'column',
                            boxShadow: '-10px 0 30px rgba(0,0,0,0.2)'
                        }}
                    >
                        {/* Drawer Header */}
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div
                                onClick={() => handleNavigation('/')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                className="nav-link-hover"
                            >
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', color: 'white', fontSize: '1.25rem', flexShrink: 0
                                }}>
                                    I
                                </div>
                                <span className="h2 text-gradient" style={{ margin: 0, fontSize: '1.25rem' }}>Ineedam</span>
                            </div>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>

                            {/* Profile Section */}
                            {profile && (
                                <div
                                    onClick={() => handleNavigation(`/${profile.username}`)}
                                    style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', marginBottom: '1rem' }}
                                    className="nav-link-hover"
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700
                                    }}>
                                        {!profile.avatar_url && profile.display_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{profile.display_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>@{profile.username}</div>

                                        {/* Compact Stats Row */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Needs Met (Given)">
                                                <Award size={14} color="var(--accent)" />
                                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.needsMet}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Fulfilled (Received)">
                                                <TrendingUp size={14} color="var(--primary)" />
                                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.fulfilledRequests}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Endorsements">
                                                <Award size={14} color="var(--secondary)" />
                                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.endorsementsCount}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Following">
                                                <Users size={14} color="var(--text-muted)" />
                                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.followingCount}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Followers">
                                                <Users size={14} fill="currentColor" style={{ opacity: 0.3 }} color="var(--text-muted)" />
                                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.followersCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Mobile specific links (extracted from Right Sidebar) */}
                            <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                                <div
                                    onClick={() => handleNavigation('/who-to-follow')}
                                    style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                                    className="nav-link-hover"
                                >
                                    <Users size={20} color="var(--primary)" />
                                    <span style={{ fontWeight: 600 }}>Who to follow</span>
                                </div>
                                <div
                                    onClick={() => handleNavigation('/whats-happening')}
                                    style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                                    className="nav-link-hover"
                                >
                                    <TrendingUp size={20} color="var(--accent)" />
                                    <span style={{ fontWeight: 600 }}>What's happening</span>
                                </div>
                            </div>

                            {/* Utility Links */}
                            <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                                <div
                                    onClick={() => handleNavigation('/settings')}
                                    style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                                    className="nav-link-hover"
                                >
                                    <Settings size={20} />
                                    <span style={{ fontWeight: 500 }}>Settings</span>
                                </div>
                                <div
                                    onClick={() => handleNavigation('/how-to-use')}
                                    style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                                    className="nav-link-hover"
                                >
                                    <HelpCircle size={20} />
                                    <span style={{ fontWeight: 500 }}>How to Use</span>
                                </div>
                                <div
                                    onClick={() => handleNavigation('/privacy')}
                                    style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                                    className="nav-link-hover"
                                >
                                    <Shield size={20} />
                                    <span style={{ fontWeight: 500 }}>Privacy Policy</span>
                                </div>
                                <div
                                    onClick={() => handleNavigation('/terms')}
                                    style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                                    className="nav-link-hover"
                                >
                                    <FileText size={20} />
                                    <span style={{ fontWeight: 500 }}>Terms of Service</span>
                                </div>
                            </div>

                        </div>

                        {/* Logout - Outside scrollable area, stuck to bottom */}
                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={handleSignOut}
                                style={{
                                    background: 'transparent', border: 'none', color: '#ef4444',
                                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                    fontSize: '1rem'
                                }}
                            >
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
