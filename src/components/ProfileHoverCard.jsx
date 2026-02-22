import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { getFollowStats } from '../lib/socialService';

export const ProfileHoverCard = ({ userData, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const { user: currentUser } = useAuth();
    const { isFollowing: checkIsFollowing, toggleFollow } = useSocial();
    const isFollowing = checkIsFollowing(userData.id);
    let timeout;

    const handleMouseEnter = () => {
        timeout = setTimeout(async () => {
            setIsVisible(true);
            try {
                setIsStatsLoading(true);
                const followStats = await getFollowStats(userData.id);
                setStats(followStats);
            } catch (err) {
                console.error("Error fetching hover card stats:", err);
            } finally {
                setIsStatsLoading(false);
            }
        }, 500);
    };

    const handleMouseLeave = () => {
        clearTimeout(timeout);
        setIsVisible(false);
    };

    const handleToggleFollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) return;

        // Use Global toggle
        await toggleFollow(userData.id);

        // Optimistically update local stats for immediate feedback in hover card
        setStats(prev => ({
            ...prev,
            followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        }));
    };

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        style={{
                            position: 'absolute', top: '100%', left: '0', zIndex: 1000,
                            paddingTop: '0.75rem'
                        }}
                    >
                        <div style={{
                            width: '320px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '16px',
                            boxShadow: 'none',
                            padding: '1.25rem',
                            pointerEvents: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: userData.authorAvatar ? `url(${userData.authorAvatar}) center/cover` : 'var(--primary)',
                                    border: '1px solid var(--border-glass)', overflow: 'hidden'
                                }}>
                                    {!userData.authorAvatar && (userData.author?.charAt(0) || '?')}
                                </div>
                                {currentUser && userData.id !== currentUser.id && (
                                    <button
                                        onClick={handleToggleFollow}
                                        style={{
                                            padding: '0.4rem 1.2rem', borderRadius: '9999px',
                                            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                                            border: isFollowing ? '1px solid var(--border-glass)' : 'none',
                                            background: isFollowing ? 'transparent' : 'var(--text-primary)',
                                            color: isFollowing ? 'var(--text-primary)' : 'var(--bg-surface)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>

                            <div style={{ marginBottom: '0.75rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {userData.author}
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    @{userData.authorUsername || 'user'}
                                </p>
                            </div>

                            {(userData.authorBio || userData.location) && (
                                <div style={{ marginBottom: '0.75rem' }}>
                                    {userData.authorBio && (
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.4, margin: '0 0 0.5rem 0' }}>
                                            {userData.authorBio}
                                        </p>
                                    )}
                                    {userData.location && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <MapPin size={14} />
                                            <span>{userData.location}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>{stats.followingCount}</strong> Following
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>{stats.followersCount}</strong> Followers
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
