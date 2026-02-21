import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import needsData from '../data/needs.json';

export const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const category = searchParams.get('cat') || '';
    const trending = searchParams.get('trend') || '';

    const [showFilters, setShowFilters] = useState(false);
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [timeframe, setTimeframe] = useState('all'); // all, today, week, month

    const viewTitle = useMemo(() => {
        if (category) return 'Category';
        if (trending) return 'Trending';
        return 'Search';
    }, [category, trending]);

    const viewSub = useMemo(() => {
        return category || trending || query;
    }, [category, trending, query]);

    const results = useMemo(() => {
        let filtered = needsData;

        if (category) {
            filtered = filtered.filter(need => need.category.toLowerCase() === category.toLowerCase());
        } else if (trending) {
            const lowerTrend = trending.toLowerCase();
            filtered = filtered.filter(need =>
                need.title.toLowerCase().includes(lowerTrend) ||
                need.description.toLowerCase().includes(lowerTrend)
            );
        } else if (query.trim()) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(need =>
                need.title.toLowerCase().includes(lowerQuery) ||
                need.description.toLowerCase().includes(lowerQuery) ||
                need.category.toLowerCase().includes(lowerQuery) ||
                need.author.toLowerCase().includes(lowerQuery)
            );
        } else {
            return []; // No filter applied
        }

        // Apply Advanced Filters
        if (minBudget) {
            filtered = filtered.filter(n => parseFloat(n.budget.replace(/[^0-9.]/g, '')) >= parseFloat(minBudget));
        }
        if (maxBudget) {
            filtered = filtered.filter(n => parseFloat(n.budget.replace(/[^0-9.]/g, '')) <= parseFloat(maxBudget));
        }
        // Timeframe filter logic would normally use Date objects, here we mock it
        if (timeframe !== 'all') {
            // Mocking date filtering
            if (timeframe === 'today') filtered = filtered.filter(n => n.postedAt.includes('h') || n.postedAt.includes('m'));
        }

        return filtered;
    }, [query, category, trending, minBudget, maxBudget, timeframe]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button onClick={() => window.history.back()} style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)' }} className="glass-panel-hover">
                    <ArrowLeft size={20} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.2 }}>{viewTitle}</h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"{viewSub}"</span>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600,
                        background: showFilters ? 'var(--primary)' : 'var(--bg-surface)',
                        color: showFilters ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <SlidersHorizontal size={16} />
                    Filters
                </button>
            </header>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-surface)' }}
                    >
                        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Budget Range ($)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number" placeholder="Min" value={minBudget} onChange={(e) => setMinBudget(e.target.value)}
                                        style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                                    />
                                    <span>-</span>
                                    <input
                                        type="number" placeholder="Max" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)}
                                        style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Timeframe</label>
                                <select
                                    value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
                                    style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                                >
                                    <option value="all">Any time</option>
                                    <option value="today">Past 24 hours</option>
                                    <option value="week">Past week</option>
                                    <option value="month">Past month</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    onClick={() => { setMinBudget(''); setMaxBudget(''); setTimeframe('all'); }}
                                    style={{ fontSize: '0.85rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', paddingBottom: '0.5rem' }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {results.length > 0 ? (
                    results.map((need) => (
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
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)' }}>
                            <SearchIcon size={48} color="var(--text-secondary)" />
                        </div>
                        <h2 className="h2" style={{ color: 'var(--text-primary)', margin: 0 }}>No results for "{viewSub}"</h2>
                        <p style={{ maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
                            Try searching for something else, or check the spelling of your keywords.
                        </p>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Back to Home
                        </Link>
                    </div>
                )}
            </div>

        </div>
    );
};
