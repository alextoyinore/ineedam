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
    const { following } = useSocial();

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

            if (isInitial) {
                setItems(mixedItems || []);
            } else {
                setItems(prev => [...prev, ...(mixedItems || [])]);
            }

            if (!mixedItems || mixedItems.length < PAGE_SIZE) {
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
                    {['foryou', 'following'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFeedTab(tab)}
                            style={{
                                flex: 1, padding: '1rem', fontWeight: 600, fontSize: '0.95rem',
                                color: feedTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                                position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="nav-link-hover"
                        >
                            {tab === 'foryou' ? 'For You' : 'Following'}
                            {feedTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    style={{
                                        position: 'absolute', bottom: 0, left: '25%', right: '25%',
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
            </div>
        </div>
    );
};
