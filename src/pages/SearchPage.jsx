import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, ArrowLeft, SlidersHorizontal, Loader } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import { searchMixedFeed } from '../lib/feedService';
import { EndorsementFeedCard } from '../components/EndorsementFeedCard';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { EditNeedModal } from '../components/EditNeedModal';
import { getNeedById, shapeNeed, updateNeed } from '../lib/needsService';
import { useAuth } from '../context/AuthContext';

export const SearchPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const category = searchParams.get('cat') || '';
    const trending = searchParams.get('trend') || '';

    const [results, setResults] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [timeframe, setTimeframe] = useState('all'); // all, today, week, month

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 10;

    const performSearch = useCallback(async (isInitial = false) => {
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

            const data = await searchMixedFeed({
                query: query || trending,
                category,
                minBudget,
                maxBudget
            }, from, to);

            if (isInitial) {
                setResults(data || []);
            } else {
                setResults(prev => [...prev, ...(data || [])]);
            }

            if (!data || data.length < PAGE_SIZE) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setPage(currentPage + 1);
            }
        } catch (err) {
            console.error("Search failed:", err);
            if (isInitial) setResults([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [query, trending, category, minBudget, maxBudget, page]);

    useEffect(() => {
        if (query || category || trending || minBudget || maxBudget) {
            performSearch(true);
        } else {
            setResults([]);
            setLoading(false);
            setHasMore(false);
        }
    }, [query, category, trending, minBudget, maxBudget]);

    const lastElementRef = useInfiniteScroll(performSearch, hasMore, loading || loadingMore);

    const handleEditUpdate = async (needId, updates) => {
        try {
            await updateNeed(needId, updates);
            const fullData = await getNeedById(needId);
            const shaped = { ...shapeNeed(fullData), type: 'need' };

            setResults(prev => prev.map(item => 
                (item.id === needId && item.type === 'need') ? shaped : item
            ));
        } catch (err) {
            console.error("Failed to update need:", err);
            throw err;
        }
    };

    const viewTitle = useMemo(() => {
        if (category) return 'Category';
        if (trending) return 'Trending';
        return 'Search';
    }, [category, trending]);

    const viewSub = useMemo(() => {
        return category || trending || query;
    }, [category, trending, query]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <header className="sticky-header" style={{
                padding: '0.75rem var(--feed-item-padding)', display: 'flex', alignItems: 'center', gap: '1.5rem'
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
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>
                        <Loader size={32} className="animate-spin" />
                    </div>
                ) : results.length > 0 ? (
                    <>
                        {results.map((item) => (
                            <motion.div
                                key={`${item.type}-${item.broadcast_id || item.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {item.type === 'need' || item.type === 'broadcast' ? (
                                    <NeedCard
                                        need={item}
                                        broadcastedBy={item.type === 'broadcast' ? item.broadcasted_by : null}
                                        onEdit={item.authorId === user?.id ? (n) => {
                                            setSelectedNeed(n);
                                            setIsEditModalOpen(true);
                                        } : null}
                                    />
                                ) : (
                                    <EndorsementFeedCard
                                        endorsement={item}
                                        broadcastedBy={(item.type === 'broadcast_endorsement' || item.type === 'broadcast') ? item.broadcasted_by : null}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </>
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

                {/* Sentinel for infinite scroll */}
                <div ref={lastElementRef} style={{ height: '20px' }} />

                {loadingMore && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', color: 'var(--primary)' }}>
                        <Loader size={24} className="animate-spin" />
                    </div>
                )}
            </div>

            <EditNeedModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                need={selectedNeed}
                onUpdate={handleEditUpdate}
            />
        </div>
    );
};
