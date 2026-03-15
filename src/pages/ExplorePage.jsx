import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { fetchMixedFeed } from '../lib/feedService';
import { getNeedById, updateNeed, shapeNeed, getCategoryPreviews } from '../lib/needsService';
import { getSuggestedProfiles } from '../lib/profileService';
import { CATEGORY_GROUPS, getCategoryIcon } from '../data/categories';

// Components
import { NeedCard } from '../components/NeedCard';
import { EndorsementFeedCard } from '../components/EndorsementFeedCard';
import { HomeComposer } from '../components/HomeComposer';
import { EditNeedModal } from '../components/EditNeedModal';

// Icons
import {
    Loader, Users, LayoutGrid, ChevronRight, ChevronDown,
    Code, Laptop, Music, Palette, Trophy, Home, Car, ShoppingBag,
    Settings, Briefcase, Shirt, PawPrint, Heart, Plane, MoreHorizontal,
    Globe, Terminal, Smartphone, HelpCircle, Layout, Shield, BarChart,
    Cloud, Mouse, Wifi, Guitar, Gamepad2, Tv, Monitor, Mic2, GlassWater, Tent,
    Calendar, Scissors, Camera, PenTool, Sparkles, Dribbble, Activity,
    Building, Palmtree, Building2, Mountain, Bike, Truck, Bus, Ship, Wrench,
    Key, Armchair, Lamp, Utensils, Bed, Flower2, Hammer, Wind, BookOpen,
    UtensilsCrossed, Scale, HeartPulse, Lock, Clock, UserCheck, GraduationCap,
    Footprints, Watch, Cat, Bone, Search, HeartHandshake, Book, Smile,
    UserPlus, LifeBuoy, Compass, Package, Repeat, Gift
} from 'lucide-react';

const CategoryIcon = ({ iconName, ...props }) => {
    const icons = {
        Code, Laptop, Music, Palette, Trophy, Home, Car, ShoppingBag,
        Settings, Briefcase, Shirt, PawPrint, Heart, Plane, MoreHorizontal,
        Globe, Terminal, Smartphone, HelpCircle, Layout, Shield, BarChart,
        Cloud, Mouse, Wifi, Guitar, Gamepad2, Tv, Monitor, Mic2, GlassWater, Tent,
        Calendar, Scissors, Camera, PenTool, Sparkles, Dribbble, Activity,
        Building, Palmtree, Building2, Mountain, Bike, Truck, Bus, Ship, Wrench,
        Key, Armchair, Lamp, Utensils, Bed, Flower2, Hammer, Wind, BookOpen,
        UtensilsCrossed, Scale, HeartPulse, Lock, Clock, UserCheck, GraduationCap,
        Footprints, Watch, Cat, Bone, Search, HeartHandshake, Book, Smile,
        UserPlus, LifeBuoy, Compass, Package, Repeat, Gift, Users
    };
    const IconComponent = icons[iconName] || Globe;
    return <IconComponent {...props} />;
};

export const ExplorePage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [feedTab, setFeedTab] = useState('foryou');
    const [items, setItems] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 10;
    const { profile, user } = useAuth();
    const { following, toggleFollow, isFollowing } = useSocial();
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [visibleCommunityCount, setVisibleCommunityCount] = useState(10);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});

    const loadMoreCommunity = useCallback(() => {
        setTimeout(() => {
            setVisibleCommunityCount(prev => prev + 10);
        }, 400);
    }, []);

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
                const users = await getSuggestedProfiles(user.id, 100); // Fetch a larger batch
                setSuggestedUsers(users);
            } catch (err) {
                console.error("Failed to load suggested users", err);
            } finally {
                setLoadingSuggestions(false);
            }
        };
        loadSuggestions();
    }, [user]);

    useEffect(() => {
        if (feedTab === 'categories' && categories.length === 0) {
            const load = async () => {
                setLoadingCategories(true);
                try {
                    const data = await getCategoryPreviews();
                    setCategories(data);
                } catch (err) {
                    console.error('Failed to load category previews:', err);
                } finally {
                    setLoadingCategories(false);
                }
            };
            load();
        }
    }, [feedTab, categories.length]);

    const lastElementRef = useInfiniteScroll(loadItems, hasMore, loading || loadingMore);

    const visibleCommunityUsers = suggestedUsers.slice(0, visibleCommunityCount);
    const hasMoreCommunity = visibleCommunityCount < suggestedUsers.length;
    const communitySentinelRef = useInfiniteScroll(loadMoreCommunity, hasMoreCommunity, loadingSuggestions);

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

    const handleEditUpdate = async (needId, updates) => {
        try {
            await updateNeed(needId, updates);
            const fullData = await getNeedById(needId);
            const shaped = { ...shapeNeed(fullData), type: 'need' };

            setItems(prev => prev.map(item =>
                (item.id === needId && item.type === 'need') ? shaped : item
            ));
        } catch (err) {
            console.error("Failed to update need:", err);
            throw err;
        }
    };

    const renderItem = (item) => {
        if (item.type === 'need' || item.type === 'broadcast') {
            return (
                <NeedCard
                    need={item}
                    broadcastedBy={item.type === 'broadcast' ? item.broadcasted_by : null}
                    onEdit={item.authorId === user?.id ? (n) => {
                        setSelectedNeed(n);
                        setIsEditModalOpen(true);
                    } : null}
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
                    {['foryou', 'following', 'whotofollow', 'categories'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFeedTab(tab)}
                            style={{
                                flex: 1, padding: '1.5rem .9rem', fontWeight: 600, fontSize: '0.95rem',
                                color: feedTab === tab ? 'var(--text-primary)' : 'var(--text-primary)',
                                position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            className="nav-link-hover"
                        >
                            {tab === 'foryou' ? 'For You' : tab === 'following' ? 'Following' : tab === 'whotofollow' ? 'Community' : 'Categories'}
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
                                padding: '1rem',
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
                        ) : visibleCommunityUsers.length > 0 ? (
                            visibleCommunityUsers.map(profile => (
                                <div
                                    key={profile.id}
                                    onClick={() => navigate(`/${profile.username}`)}
                                    style={{
                                        padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-glass)',
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
                        {/* Sentinel for Community Infinite Scroll */}
                        {feedTab === 'whotofollow' && visibleCommunityUsers.length > 0 && (
                            <div ref={communitySentinelRef} style={{ height: '20px' }} />
                        )}
                        {feedTab === 'whotofollow' && hasMoreCommunity && visibleCommunityUsers.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', color: 'var(--primary)' }}>
                                <Loader size={24} className="animate-spin" />
                            </div>
                        )}
                    </div>
                ) : feedTab === 'categories' ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {loadingCategories ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>
                                <Loader size={32} className="animate-spin" />
                            </div>
                        ) : categories.length > 0 ? (
                            CATEGORY_GROUPS.map((group) => {
                                const groupCategories = categories.filter(c => group.categories.includes(c.category));
                                if (groupCategories.length === 0) return null;

                                const isExpanded = expandedGroups[group.name];
                                const totalNeeds = groupCategories.reduce((sum, c) => sum + c.count, 0);

                                return (
                                    <div key={group.name} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                        <div
                                            onClick={() => setExpandedGroups(prev => ({ ...prev, [group.name]: !isExpanded }))}
                                            style={{
                                                padding: '1.25rem 1rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                cursor: 'pointer', background: isExpanded ? 'var(--bg-base)' : 'transparent'
                                            }}
                                            className="nav-link-hover"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--primary)'
                                                }}>
                                                    <CategoryIcon iconName={group.icon} size={20} />
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{group.name}</h3>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{groupCategories.length} subcategories • {totalNeeds} needs</span>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronDown size={20} color="var(--text-muted)" /> : <ChevronRight size={20} color="var(--text-muted)" />}
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    style={{ overflow: 'hidden', background: 'var(--bg-surface)' }}
                                                >
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                                                        gap: '0.75rem',
                                                        padding: '0.75rem 1rem 1.5rem 1rem'
                                                    }}>
                                                        {groupCategories.map(({ category, count, latestNeed }) => (
                                                            <div
                                                                key={category}
                                                                onClick={() => navigate(`/search?cat=${encodeURIComponent(category)}`)}
                                                                className="glass-panel-hover"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '1rem',
                                                                    padding: '1rem',
                                                                    background: 'var(--bg-base)',
                                                                    borderRadius: '12px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <div style={{
                                                                    width: '36px', height: '36px', borderRadius: '10px',
                                                                    background: 'var(--bg-base)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    color: 'var(--text-secondary)', flexShrink: 0
                                                                }}>
                                                                    <CategoryIcon iconName={getCategoryIcon(category)} size={18} />
                                                                </div>
                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                                                        {category}
                                                                    </p>
                                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                        {count} {count === 1 ? 'need' : 'needs'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <LayoutGrid size={48} style={{ opacity: 0.3 }} />
                                <h3 className="h3">No categories yet</h3>
                                <p>When users post needs, categories will appear here.</p>
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
            <EditNeedModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                need={selectedNeed}
                onUpdate={handleEditUpdate}
            />
        </div>
    );
};
