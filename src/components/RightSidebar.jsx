import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { getSuggestedProfiles } from '../lib/profileService';
import { getCategoryStats } from '../lib/needsService';

export const RightSidebar = () => {
    const { user } = useAuth();
    const { toggleFollow } = useSocial();
    const [query, setQuery] = useState('');
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [categoryStats, setCategoryStats] = useState({});
    const [trendingStats, setTrendingStats] = useState({});
    const [trendTimeframe, setTrendTimeframe] = useState('all'); // 'all' | 'today' | '3h'
    const [loading, setLoading] = useState(true);
    const [trendLoading, setTrendLoading] = useState(false);
    const navigate = useNavigate();

    const sidebarRef = React.useRef(null);
    const [stickyTop, setStickyTop] = useState(16);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            if (!sidebarRef.current) return;

            const sidebar = sidebarRef.current;
            const sh = sidebar.offsetHeight;
            const vh = window.innerHeight;
            const scrollY = window.scrollY;
            const delta = scrollY - lastScrollY;
            lastScrollY = scrollY;

            // If sidebar is shorter than viewport, keep it at top
            if (sh <= vh - 32) {
                setStickyTop(16);
                return;
            }

            setStickyTop(prev => {
                const newTop = prev - delta;
                const minTop = vh - sh - 24; // 24px bottom margin/buffer
                const maxTop = 16; // 1rem top margin
                return Math.min(maxTop, Math.max(minTop, newTop));
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    useEffect(() => {
        const loadSidebarData = async () => {
            if (!user) return;
            try {
                const [users, stats] = await Promise.all([
                    getSuggestedProfiles(user.id, 3),
                    getCategoryStats()
                ]);
                setSuggestedUsers(users);
                setCategoryStats(stats);
            } catch (err) {
                console.error("Failed to load sidebar data", err);
            } finally {
                setLoading(false);
            }
        };
        loadSidebarData();
    }, [user]);

    // Re-fetch trending stats whenever the timeframe tab changes
    useEffect(() => {
        const loadTrending = async () => {
            setTrendLoading(true);
            try {
                let since = null;
                if (trendTimeframe === 'today') {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    since = d.toISOString();
                } else if (trendTimeframe === '3h') {
                    since = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
                }
                const stats = await getCategoryStats(since);
                setTrendingStats(stats);
            } catch (err) {
                console.error('Failed to load trending stats', err);
            } finally {
                setTrendLoading(false);
            }
        };
        loadTrending();
    }, [trendTimeframe]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery('');
        }
    };

    const handleFollow = async (userId) => {
        await toggleFollow(userId);
        setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
    };

    // Sort trending by engagement for selected timeframe, top 3
    const trendingCategories = Object.entries(trendingStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // All-time sort by engagement desc, cap at 10 for the pill widget
    const topCategories = Object.entries(categoryStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const TABS = [
        { key: 'all', label: 'All time' },
        { key: 'today', label: 'Today' },
        { key: '3h', label: '3h' },
    ];
    return (
        <aside ref={sidebarRef} className="social-sidebar-right" style={{ top: `${stickyTop}px` }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', padding: '1.5rem 0' }}>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search Needam..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{
                            width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '9999px',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s'
                        }}
                    />
                </div>



                {/* Trending Widget */}
                <div style={{
                    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px'
                }}>
                    {/* Header row: title + tab toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <h3 className="h3" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <TrendingUp size={16} color="var(--primary)" />
                            What's happening
                        </h3>

                    </div>

                    {/* <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setTrendTimeframe(tab.key)}
                                style={{
                                    padding: '0.2rem 0.55rem', borderRadius: '9999px', border: 'none',
                                    fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                                    background: trendTimeframe === tab.key ? 'var(--text-muted)' : 'transparent',
                                    color: trendTimeframe === tab.key ? 'white' : 'var(--text-muted)',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div> */}

                    {trendLoading ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Loading…</p>
                    ) : trendingCategories.length > 0 ? (
                        trendingCategories.map(([cat, count]) => (
                            <div
                                key={cat}
                                onClick={() => navigate(`/search?cat=${encodeURIComponent(cat)}`)}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', cursor: 'pointer' }}
                                className="nav-link-hover"
                            >
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trending in {cat}</span>
                                <p style={{ fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{cat} Needs</p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count} {count === 1 ? 'need' : 'needs'} posted</span>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No trends yet</p>
                    )}
                    <span
                        onClick={() => navigate('/categories')}
                        style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', marginTop: '0.25rem' }}
                        className="nav-link-hover"
                    >
                        See all →
                    </span>
                </div>

                {/* Who to follow */}
                {suggestedUsers.length > 0 && (
                    <div style={{
                        padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
                        background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px'
                    }}>
                        <h3 className="h3" style={{ fontSize: '1.1rem' }}>Community</h3>
                        {suggestedUsers.map(profile => (
                            <div key={profile.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
                                <div
                                    onClick={() => navigate(`/${profile.username}`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.25rem', borderRadius: '8px', transition: 'all 0.2s', minWidth: 0 }}
                                    className="nav-link-hover"
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', flexShrink: 0
                                    }}>
                                        {!profile.avatar_url && profile.display_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.display_name}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{profile.username}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleFollow(profile.id)}
                                    className="btn-primary"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '9999px', flexShrink: 0 }}
                                >
                                    Follow
                                </button>
                            </div>
                        ))}
                        <span
                            onClick={() => navigate('/who-to-follow')}
                            style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', marginTop: '0.25rem' }}
                            className="nav-link-hover"
                        >
                            See all →
                        </span>
                    </div>
                )}

                {/* Categories Widget */}
                {/* <div style={{
                    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px'
                }}>
                    <h3 className="h3" style={{ fontSize: '1.1rem' }}>Categories</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {topCategories.length > 0 ? (
                            topCategories.map(([cat, count]) => (
                                <span
                                    key={cat}
                                    onClick={() => navigate(`/search?cat=${encodeURIComponent(cat)}`)}
                                    style={{
                                        padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem',
                                        background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
                                    }} className="glass-panel-hover"
                                >
                                    {cat}
                                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>{count}</span>
                                </span>
                            ))
                        ) : (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No categories found</p>
                        )}
                    </div>
                    <span
                        onClick={() => navigate('/categories')}
                        style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                        className="nav-link-hover"
                    >
                        See all →
                    </span>
                </div> */}

                {/* Footer Links */}
                <div style={{ padding: '0 0 1rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', marginBottom: '2rem' }}>
                    <span onClick={() => navigate('/about')} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link-hover">About</span>
                    <span onClick={() => navigate('/faq')} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link-hover">FAQ</span>
                    <span onClick={() => navigate('/support')} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link-hover">Support</span>
                    <span onClick={() => navigate('/help')} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link-hover">Help</span>
                    <span onClick={() => navigate('/how-to-use')} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link-hover">Use Cases</span>
                    <span onClick={() => navigate('/privacy')} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link-hover">Privacy</span>
                    <span onClick={() => navigate('/terms')} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link-hover">Terms</span>
                    <span onClick={() => navigate('/rules')} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link-hover">Rules</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Ineedam</span>
                </div>

            </div>
        </aside>
    );
};
