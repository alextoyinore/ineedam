import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Loader, ChevronRight } from 'lucide-react';
import { getCategoryStats } from '../lib/needsService';

export const MobileWhatsHappeningPage = () => {
    const navigate = useNavigate();
    const [categoryStats, setCategoryStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await getCategoryStats();
                setCategoryStats(stats);
            } catch (err) {
                console.error("Failed to load category stats:", err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const trendingCategories = Object.entries(categoryStats)
        .sort((a, b) => b[1] - a[1]); // Show all categories on mobile page, not just top 3

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>
            <header className="sticky-header" style={{
                padding: '0.75rem var(--feed-item-padding)', display: 'flex', alignItems: 'center', gap: '1rem',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)', marginLeft: '-0.5rem' }} className="glass-panel-hover">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="h2" style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={20} color="var(--accent)" /> What's happening
                </h2>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                <div style={{ padding: '1.5rem var(--feed-item-padding) 0.5rem var(--feed-item-padding)' }}>
                    <h3 className="h3" style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Trending Categories</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Explore what needs people are posting most.</p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--accent)' }}>
                        <Loader size={32} className="animate-spin" />
                    </div>
                ) : trendingCategories.length > 0 ? (
                    <div style={{ padding: '1rem 0' }}>
                        {trendingCategories.map(([cat, count], idx) => (
                            <div
                                key={cat}
                                onClick={() => navigate(`/search?cat=${encodeURIComponent(cat)}`)}
                                style={{
                                    padding: '1.25rem var(--feed-item-padding)', borderBottom: '1px solid var(--border-glass)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                                }}
                                className="nav-link-hover"
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>#{idx + 1} Trending</span>
                                    <p style={{ fontWeight: 800, margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{cat}</p>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{count} {count === 1 ? 'need' : 'needs'} posted</span>
                                </div>
                                <ChevronRight size={20} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <h3 className="h3">No trends right now</h3>
                        <p>When users post needs, categories will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
