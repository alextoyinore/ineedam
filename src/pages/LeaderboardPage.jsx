import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, MessageSquare, Star, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export const LeaderboardPage = () => {
    const navigate = useNavigate();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            setLoading(true);
            try {
                // Fetch profiles with their endorsement counts, ordered by most endorsed
                const { data: endorsements, error } = await supabase
                    .from('endorsements')
                    .select('endorsed_id, profiles:endorsed_id(id, display_name, username, avatar_url, bio, location)');

                if (error) throw error;

                // Count endorsements per user
                const countMap = {};
                const profileMap = {};
                (endorsements || []).forEach(e => {
                    const uid = e.endorsed_id;
                    countMap[uid] = (countMap[uid] || 0) + 1;
                    if (e.profiles) profileMap[uid] = e.profiles;
                });

                // Fetch reply counts per user (helper activity signal)
                const userIds = Object.keys(countMap);
                const { data: replyCounts } = await supabase
                    .from('replies')
                    .select('user_id')
                    .in('user_id', userIds);

                const replyCountMap = {};
                (replyCounts || []).forEach(r => {
                    replyCountMap[r.user_id] = (replyCountMap[r.user_id] || 0) + 1;
                });

                // Build sorted leaderboard
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
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Trophy size={28} style={{ color: '#FFD700' }} />
                <h1 className="h1" style={{ fontSize: '1.75rem', margin: 0 }}>Helper Leaderboard</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                Top community members ranked by endorsements received and replies given.
            </p>

            {loading ? (
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
                                {/* Rank */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: medal ? `color-mix(in srgb, ${medal} 20%, transparent)` : 'var(--bg-base)',
                                    color: medal || 'var(--text-muted)',
                                    fontWeight: 700, fontSize: '1rem', border: medal ? `2px solid ${medal}` : '1px solid var(--border-glass)'
                                }}>
                                    {rank}
                                </div>

                                {/* Avatar */}
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

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {leader.display_name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        @{leader.username}
                                        {leader.location && <span> · {leader.location}</span>}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: 700 }}>
                                            <Award size={16} />
                                            <span>{leader.endorsementCount}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Endorsements</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent)', fontWeight: 700 }}>
                                            <MessageSquare size={16} />
                                            <span>{leader.replyCount}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Replies</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
