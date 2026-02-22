import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import { useSocial } from '../context/SocialContext';
import { fetchNeeds, shapeNeed } from '../lib/needsService';
import { supabase } from '../lib/supabase';
import needsData from '../data/needs.json';

export const ExplorePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [feedTab, setFeedTab] = useState('foryou');
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const { following } = useSocial();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const rows = await fetchNeeds();
                setNeeds(rows ? rows.map(shapeNeed) : []);
            } catch (err) {
                console.error("Error fetching needs:", err);
                // Optionally show an error toaster here
                setNeeds([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Subscribe to real-time inserts so new posts appear instantly
    useEffect(() => {
        const channel = supabase
            .channel('needs-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'needs' }, (payload) => {
                const shaped = shapeNeed({ ...payload.new, profiles: null });
                setNeeds(prev => [shaped, ...prev]);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const filteredNeeds = needs.filter(n => {
        const matchesSearch =
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (feedTab === 'following') {
            return matchesSearch && following.includes(n.authorId);
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
                ) : filteredNeeds.length > 0 ? (
                    filteredNeeds.map((need) => (
                        <motion.div
                            key={need.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                borderBottom: '1px solid var(--border-glass)',
                                padding: '1.5rem',
                                transition: 'background-color 0.2s',
                                cursor: 'pointer'
                            }}
                            className="nav-link-hover"
                        >
                            <NeedCard need={need} />
                        </motion.div>
                    ))
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No needs found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};
