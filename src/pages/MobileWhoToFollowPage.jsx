import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Loader, Trophy, Award, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { getSuggestedProfiles } from '../lib/profileService';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export const MobileWhoToFollowPage = () => {
    const { user } = useAuth();
    const { toggleFollow, isFollowing } = useSocial();
    const navigate = useNavigate();
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [leaders, setLeaders] = useState([]);
    const [loadingSuggested, setLoadingSuggested] = useState(true);
    const [loadingLeaders, setLoadingLeaders] = useState(true);
    const [activeTab, setActiveTab] = useState('suggested'); // 'suggested' | 'leaderboard'

    useEffect(() => {
        const loadSuggestedUsers = async () => {
            if (!user) return;
            setLoadingSuggested(true);
            try {
                const users = await getSuggestedProfiles(user.id, 15);
                setSuggestedUsers(users);
            } catch (err) {
                console.error("Failed to load suggested users", err);
            } finally {
                setLoadingSuggested(false);
            }
        };

        const fetchLeaders = async () => {
            setLoadingLeaders(true);
            try {
                const { data: endorsements, error } = await supabase
                    .from('endorsements')
                    .select('endorsed_id, profiles:endorsed_id(id, display_name, username, avatar_url, bio, location)');

                if (error) throw error;

                const countMap = {};
                const profileMap = {};
                (endorsements || []).forEach(e => {
                    const uid = e.endorsed_id;
                    countMap[uid] = (countMap[uid] || 0) + 1;
                    if (e.profiles) profileMap[uid] = e.profiles;
                });

                const userIds = Object.keys(countMap);
                const { data: replyCounts } = await supabase
                    .from('replies')
                    .select('user_id')
                    .in('user_id', userIds);

                const replyCountMap = {};
                (replyCounts || []).forEach(r => {
                    replyCountMap[r.user_id] = (replyCountMap[r.user_id] || 0) + 1;
                });

                const ranked = userIds
                    .map(uid => ({
                        ...profileMap[uid],
                        endorsementCount: countMap[uid] || 0,
                        replyCount: replyCountMap[uid] || 0,
                        score: (countMap[uid] || 0) * 3 + (replyCountMap[uid] || 0)
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 20);

                setLeaders(ranked);
            } catch (err) {
                console.error('Failed to load leaderboard:', err);
            } finally {
                setLoadingLeaders(false);
            }
        };

        loadSuggestedUsers();
        fetchLeaders();
    }, [user]);

    const handleFollowClick = async (e, userId) => {
        e.stopPropagation(); // prevent navigation to profile
        await toggleFollow(userId);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>
            <header className="sticky-header" style={{
                display: 'flex', flexDirection: 'column',
                borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-base)'
            }}>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="h2" style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} color="var(--primary)" /> Community
                    </h2>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', padding: '0 1rem' }}>
                    <button
                        onClick={() => setActiveTab('suggested')}
                        style={{
                            flex: 1, padding: '0.75rem 0', background: 'transparent', border: 'none',
                            color: activeTab === 'suggested' ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'suggested' ? 700 : 500,
                            borderBottom: activeTab === 'suggested' ? '2px solid var(--primary)' : '2px solid transparent',
                            cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem'
                        }}
                    >
                        Suggested
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        style={{
                            flex: 1, padding: '0.75rem 0', background: 'transparent', border: 'none',
                            color: activeTab === 'leaderboard' ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'leaderboard' ? 700 : 500,
                            borderBottom: activeTab === 'leaderboard' ? '2px solid var(--primary)' : '2px solid transparent',
                            cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem'
                        }}
                    >
                        Leaderboard
                    </button>
                </div>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 1rem 0' }}>
                {activeTab === 'suggested' && (
                    <div style={{ paddingTop: '1rem' }}>
                        {loadingSuggested ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--primary)' }}>
                                <Loader size={32} className="animate-spin" />
                            </div>
                        ) : suggestedUsers.length > 0 ? (
                            suggestedUsers.map(profile => (
                                <div
                                    key={profile.id}
                                    onClick={() => navigate(`/${profile.username}`)}
                                    style={{
                                        padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)',
                                        display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                        background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white'
                                    }}>
                                        {!profile.avatar_url && profile.display_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.display_name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{profile.username}</div>
                                            </div>
                                        </div>
                                        {profile.bio && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.bio}</p>}
                                    </div>
                                    <button
                                        onClick={(e) => handleFollowClick(e, profile.id)}
                                        className={isFollowing(profile.id) ? "btn btn-secondary" : "btn btn-primary"}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}
                                    >
                                        {isFollowing(profile.id) ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <h3 className="h3">No suggestions</h3>
                                <p>Check back later for more people to follow.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div style={{ padding: '1rem' }}>
                        {loadingLeaders ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                <Loader size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
                            </div>
                        ) : leaders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                <Trophy size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <p>No leaderboard data yet. Be the first to help!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {leaders.map((leader, idx) => {
                                    const medal = MEDAL_COLORS[idx];
                                    const rank = idx + 1;
                                    return (
                                        <motion.div
                                            key={leader.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            onClick={() => navigate(`/${leader.username}`)}
                                            className="feed-item-hover"
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '1rem',
                                                padding: '1rem 1.25rem', borderRadius: '16px',
                                                border: '1px solid var(--border-glass)',
                                                background: idx < 3 ? `color-mix(in srgb, ${medal} 6%, var(--bg-surface))` : 'var(--bg-surface)',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: medal ? `color-mix(in srgb, ${medal} 20%, transparent)` : 'var(--bg-base)',
                                                color: medal || 'var(--text-muted)',
                                                fontWeight: 700, fontSize: '1rem', border: medal ? `2px solid ${medal}` : '1px solid var(--border-glass)'
                                            }}>
                                                {rank}
                                            </div>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                                background: leader.avatar_url
                                                    ? `url(${leader.avatar_url}) center/cover`
                                                    : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 700, fontSize: '1.1rem',
                                                border: '2px solid var(--border-glass)'
                                            }}>
                                                {!leader.avatar_url && (leader.display_name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {leader.display_name}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    @{leader.username}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: 700 }}>
                                                        <Award size={16} />
                                                        <span>{leader.endorsementCount}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent)', fontWeight: 700 }}>
                                                        <MessageSquare size={16} />
                                                        <span>{leader.replyCount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
