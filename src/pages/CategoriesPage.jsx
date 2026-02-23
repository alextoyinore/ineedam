import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, ChevronRight, Loader } from 'lucide-react';
import { getCategoryPreviews } from '../lib/needsService';

export const CategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getCategoryPreviews();
                setCategories(data);
            } catch (err) {
                console.error('Failed to load category previews:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>

            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.5rem', borderRadius: '50%', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                    className="glass-panel-hover"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="h2" style={{ margin: 0, fontSize: '1.25rem', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LayoutGrid size={20} color="var(--primary)" />
                        All Categories
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ranked by all-time engagement</span>
                </div>
            </header>

            {/* Content */}
            <div style={{ flex: 1 }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>
                        <Loader size={32} className="animate-spin" />
                    </div>
                ) : categories.length > 0 ? (
                    categories.map(({ category, count, latestNeed }, idx) => (
                        <div
                            key={category}
                            onClick={() => navigate(`/search?cat=${encodeURIComponent(category)}`)}
                            style={{
                                padding: '1.25rem 1.5rem',
                                borderBottom: '1px solid var(--border-glass)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                cursor: 'pointer', gap: '1rem'
                            }}
                            className="nav-link-hover"
                        >
                            {/* Rank badge */}
                            <div style={{
                                minWidth: '2.25rem', height: '2.25rem', borderRadius: '50%',
                                background: idx < 3 ? 'var(--primary)' : 'var(--bg-surface)',
                                border: '1px solid var(--border-glass)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 800,
                                color: idx < 3 ? 'white' : 'var(--text-muted)',
                                flexShrink: 0
                            }}>
                                #{idx + 1}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                    {category}
                                </p>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {count} {count === 1 ? 'need' : 'needs'} posted
                                </span>
                                {latestNeed && (
                                    <p style={{
                                        margin: '0.25rem 0 0 0', fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        Latest: "{latestNeed.title}" by {latestNeed.author}
                                    </p>
                                )}
                            </div>

                            <ChevronRight size={18} color="var(--text-muted)" style={{ opacity: 0.5, flexShrink: 0 }} />
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <LayoutGrid size={48} style={{ opacity: 0.3 }} />
                        <h3 className="h3">No categories yet</h3>
                        <p>When users post needs, categories will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
