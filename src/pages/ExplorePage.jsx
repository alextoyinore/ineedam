import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import { useSocial } from '../context/SocialContext';
import { fetchMixedFeed } from '../lib/feedService';
import { supabase } from '../lib/supabase';
import { shapeNeed } from '../lib/needsService';
import { EndorsementFeedCard } from '../components/EndorsementFeedCard';
import { useNavigate } from 'react-router-dom';

export const ExplorePage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [feedTab, setFeedTab] = useState('foryou');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { following } = useSocial();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const mixedItems = await fetchMixedFeed();
                setItems(mixedItems || []);
            } catch (err) {
                console.error("Error fetching mixed feed:", err);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

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
        let matchesSearch = false;
        if (item.type === 'need') {
            matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (item.type === 'endorsement') {
            matchesSearch = (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.endorsed?.display_name && item.endorsed.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.endorser?.display_name && item.endorser.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.needs?.title && item.needs.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (feedTab === 'following') {
            // For endorsements, consider it following if they follow EITHER the endorser or the endorsed
            if (item.type === 'endorsement') {
                return matchesSearch && (following.includes(item.endorser_id) || following.includes(item.endorsed_id));
            }
            return matchesSearch && following.includes(item.authorId);
        }
        return matchesSearch;
    });

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
                            key={`${item.type}-${item.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => {
                                if (item.type === 'need') {
                                    navigate(`/need/${item.id}`);
                                } else if (item.type === 'endorsement' && item.needs?.id) {
                                    navigate(`/need/${item.needs.id}`);
                                }
                            }}
                        >
                            {item.type === 'need' ? (
                                <NeedCard need={item} />
                            ) : (
                                <EndorsementFeedCard endorsement={item} />
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No items found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};
