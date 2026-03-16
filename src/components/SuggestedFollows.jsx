import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Users, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocial } from '../context/SocialContext';
import { getSuggestedProfiles } from '../lib/profileService';
import { useAuth } from '../context/AuthContext';

export const SuggestedFollows = ({ onDismiss, seedUserId = null }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toggleFollow, isFollowing } = useSocial();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followingAll, setFollowingAll] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadSuggestions = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch a small batch of suggestions
                const data = await getSuggestedProfiles(user.id, 6);
                setSuggestions(data);
            } catch (err) {
                console.error("Failed to load suggested follows:", err);
            } finally {
                setLoading(false);
            }
        };
        loadSuggestions();
    }, [user, seedUserId]);

    const handleFollowAll = async () => {
        setFollowingAll(true);
        try {
            const unfollowed = suggestions.filter(p => !isFollowing(p.id));
            await Promise.all(unfollowed.map(p => toggleFollow(p.id)));
        } catch (err) {
            console.error("Error following all:", err);
        } finally {
            setFollowingAll(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                <Loader size={20} className="animate-spin" color="var(--primary)" />
            </div>
        );
    }

    if (suggestions.length === 0) return null;

    // Mobile Stacked View
    if (isMobile) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-glass)',
                    padding: '0.75rem var(--feed-item-padding)',
                    overflow: 'hidden'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Suggested for you</span>
                        <button onClick={onDismiss} style={{ color: 'var(--text-muted)', padding: '4px', marginRight: '-4px' }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {suggestions.slice(0, 3).map((profile, i) => (
                                <div
                                    key={profile.id}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        border: '2px solid var(--bg-surface)',
                                        marginLeft: i === 0 ? 0 : '-12px',
                                        zIndex: 3 - i,
                                        background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        flexShrink: 0
                                    }}
                                >
                                    {!profile.avatar_url && profile.display_name?.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {suggestions.length > 3 && (
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-base)',
                                    border: '2px solid var(--bg-surface)',
                                    marginLeft: '-12px',
                                    zIndex: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.65rem',
                                    color: 'var(--text-muted)',
                                    fontWeight: 600
                                }}>
                                    +{suggestions.length - 3}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleFollowAll}
                            disabled={followingAll || suggestions.every(p => isFollowing(p.id))}
                            className="btn btn-primary"
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.8rem',
                                borderRadius: '9999px',
                                height: '32px'
                            }}
                        >
                            {followingAll ? '...' : 'Follow all'}
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border-glass)',
                overflow: 'hidden'
            }}
        >
            <div style={{ padding: '1rem var(--feed-item-padding)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} color="var(--primary)" />
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Suggested for you</h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={handleFollowAll}
                            disabled={followingAll || suggestions.every(p => isFollowing(p.id))}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px'
                            }}
                            className="nav-link-hover"
                        >
                            {followingAll ? 'Following...' : 'Follow all'}
                        </button>
                        <button
                            onClick={onDismiss}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }} className="no-scrollbar">
                    {suggestions.map(profile => (
                        <div
                            key={profile.id}
                            style={{
                                flexShrink: 0,
                                width: '150px',
                                padding: '1.25rem 1rem',
                                background: 'var(--bg-surface-glass)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, border-color 0.2s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                            onClick={() => navigate(`/${profile.username}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-glass)';
                            }}
                        >
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                color: 'white',
                                fontSize: '1.4rem',
                                border: '2px solid var(--bg-base)',
                                boxShadow: '0 2px 8px rgba(var(--primary-rgb), 0.2)'
                            }}>
                                {!profile.avatar_url && profile.display_name?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ width: '100%', minWidth: 0 }}>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {profile.display_name}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    @{profile.username}
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFollow(profile.id);
                                }}
                                className={isFollowing(profile.id) ? "btn btn-secondary" : "btn btn-primary"}
                                style={{
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    width: '100%'
                                }}
                            >
                                {isFollowing(profile.id) ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
