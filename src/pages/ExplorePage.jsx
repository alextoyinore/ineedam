import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import { useSocial } from '../context/SocialContext';
import { fetchMixedFeed } from '../lib/feedService';
import { supabase } from '../lib/supabase';
import { shapeNeed } from '../lib/needsService';
import { EndorsementFeedCard } from '../components/EndorsementFeedCard';
import { useNavigate } from 'react-router-dom';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { getSuggestedProfiles } from '../lib/profileService';
import { useAuth } from '../context/AuthContext';
import { Users } from 'lucide-react';
import { HomeComposer } from '../components/HomeComposer';

export const ExplorePage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [feedTab, setFeedTab] = useState('foryou');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 10;
    const { profile, user } = useAuth();
    const { following, toggleFollow, isFollowing } = useSocial();
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const loadItems = useCallback(async (isInitial = false) => {
        if (isInitial) {
            setLoading(true);
            setPage(0);
        } else {
            setLoadingMore(true);
        }

        try {
            const currentPage = isInitial ? 0 : page;
            const from = currentPage * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const mixedItems = await fetchMixedFeed(from, to);
            const newItems = mixedItems || [];

            if (isInitial) {
                setItems(newItems);
            } else {
                setItems(prev => {
                    // Deduplicate by ID
                    const existingIds = new Set(prev.map(i => i.broadcast_id || i.id));
                    const uniqueNewItems = newItems.filter(i => !existingIds.has(i.broadcast_id || i.id));
                    return [...prev, ...uniqueNewItems];
                });
            }

            if (newItems.length < PAGE_SIZE) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setPage(currentPage + 1);
            }
        } catch (err) {
            console.error("Error fetching mixed feed:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [page]);

    useEffect(() => {
        loadItems(true);
    }, []);

    useEffect(() => {
        const loadSuggestions = async () => {
            if (!user) return;
            setLoadingSuggestions(true);
            try {
                const users = await getSuggestedProfiles(user.id, 15);
                setSuggestedUsers(users);
            } catch (err) {
                console.error("Failed to load suggested users", err);
            } finally {
                setLoadingSuggestions(false);
            }
        };
        loadSuggestions();
    }, [user]);

    const lastElementRef = useInfiniteScroll(loadItems, hasMore, loading || loadingMore);

    // Subscribe to real-time inserts so new posts appear instantly
    useEffect(() => {
        const needsChannel = supabase
            .channel('needs-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'needs' }, (payload) => {
                const shaped = { ...shapeNeed({ ...payload.new, profiles: null }), type: 'need' };
                setItems(prev => [shaped, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            })
            .subscribe();

        const endorseChannel = supabase
            .channel('endorse-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'endorsements' }, (payload) => {
                // Since real-time payload lacks joined profile data, we might need to fetch the full endorsement
                // For MVP, we instruct the UI to reload or just push the basic shape if possible.
                // It's safer to just trigger a re-fetch of the feed to get joined profile data for Endorsements
                console.log("New endorsement, should reload feed");
            })
            .subscribe();

        return () => {
            supabase.removeChannel(needsChannel);
            supabase.removeChannel(endorseChannel);
        };
    }, []);

    const filteredItems = items.filter(item => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();

        if (item.type === 'need' || item.type === 'broadcast') {
            const matchesNeed = (item.title?.toLowerCase() || '').includes(query) ||
                (item.description?.toLowerCase() || '').includes(query);
            const matchesBroadcaster = item.broadcasted_by?.display_name?.toLowerCase().includes(query);
            return matchesNeed || matchesBroadcaster;
        }

        if (item.type === 'endorsement' || item.type === 'broadcast_endorsement') {
            return (item.message?.toLowerCase() || '').includes(query) ||
                (item.endorser?.display_name?.toLowerCase() || '').includes(query) ||
                (item.endorsed?.display_name?.toLowerCase() || '').includes(query);
        }

        return false;
    }).filter(item => {
        if (feedTab === 'following') {
            if (item.type === 'broadcast' || item.type === 'broadcast_endorsement') {
                return following.includes(item.broadcasted_by?.id);
            }
            if (item.type === 'endorsement') {
                return following.includes(item.endorser_id) || following.includes(item.endorsed_id);
            }
            return following.includes(item.authorId);
        }
        return true;
    });

    const renderItem = (item) => {
        if (item.type === 'need' || item.type === 'broadcast') {
            return (
                <NeedCard
                    need={item}
                    broadcastedBy={item.type === 'broadcast' ? item.broadcasted_by : null}
                />
            );
        }
        if (item.type === 'endorsement' || item.type === 'broadcast_endorsement') {
            return (
                <EndorsementFeedCard
                    endorsement={item}
                    broadcastedBy={item.type === 'broadcast_endorsement' ? item.broadcasted_by : null}
                />
            );
        }
        return null;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Timeline Header */}
            <header className="sticky-header">
                <div style={{ display: 'flex' }}>
                    {['foryou', 'following', 'whotofollow'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFeedTab(tab)}
                            style={{
                                flex: 1, padding: '1rem', fontWeight: 600, fontSize: '0.95rem',
                                color: feedTab === tab ? 'var(--text-primary)' : 'var(--text-primary)',
                                position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            className="nav-link-hover"
                        >
                            {tab === 'foryou' ? 'For You' : tab === 'following' ? 'Following' : 'Community'}
                            {feedTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    style={{
                                        position: 'absolute', bottom: 0, left: '15%', right: '15%',
                                        height: '4px', background: 'var(--primary)', borderRadius: '4px 4px 0 0'
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </header>

            {/* Feed List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <HomeComposer />
                {feedTab === 'whotofollow' ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div
                            onClick={() => navigate('/who-to-follow')}
                            style={{
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid var(--border-glass)',
                                color: 'var(--primary)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            className="nav-link-hover"
                        >
                            <Users size={18} />
                            See full Community & Leaderboard →
                        </div>
                        {loadingSuggestions ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>
                                <Loader size={32} className="animate-spin" />
                            </div>
                        ) : suggestedUsers.length > 0 ? (
                            suggestedUsers.map(profile => (
                                <div
                                    key={profile.id}
                                    onClick={() => navigate(`/${profile.username}`)}
                                    style={{
                                        padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)',
                                        display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer'
                                    }}
                                    className="nav-link-hover"
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                        background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white'
                                    }}>
                                        {!profile.avatar_url && profile.display_name?.charAt(0).toUpperCase()}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFollow(profile.id);
                                        }}
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
                ) : (
                    <>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>
                                <Loader size={32} className="animate-spin" />
                            </div>
                        ) : filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <motion.div
                                    key={`${item.type}-${item.broadcast_id || item.id}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => {
                                        if (item.type === 'need' || item.type === 'broadcast') {
                                            navigate(`/need/${item.id}`);
                                        } else if ((item.type === 'endorsement' || item.type === 'broadcast_endorsement') && (item.needs?.id || item.need_id)) {
                                            navigate(`/need/${item.needs?.id || item.need_id}`);
                                        }
                                    }}
                                >
                                    {renderItem(item)}
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No items found matching your criteria.
                            </div>
                        )}

                        {/* Sentinel for infinite scroll */}
                        <div ref={lastElementRef} style={{ height: '20px' }} />

                        {loadingMore && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', color: 'var(--primary)' }}>
                                <Loader size={24} className="animate-spin" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
