import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryPreviews } from '../lib/needsService';
import { CATEGORY_GROUPS, getCategoryIcon } from '../data/categories';

// Icons
import { 
    ArrowLeft, LayoutGrid, ChevronRight, ChevronDown, Loader,
    Code, Laptop, Music, Palette, Trophy, Home, Car, ShoppingBag, 
    Settings, Briefcase, Shirt, PawPrint, Users, Heart, Plane, MoreHorizontal, 
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
        Settings, Briefcase, Shirt, PawPrint, Users, Heart, Plane, MoreHorizontal,
        Globe, Terminal, Smartphone, HelpCircle, Layout, Shield, BarChart,
        Cloud, Mouse, Wifi, Guitar, Gamepad2, Tv, Monitor, Mic2, GlassWater, Tent,
        Calendar, Scissors, Camera, PenTool, Sparkles, Dribbble, Activity,
        Building, Palmtree, Building2, Mountain, Bike, Truck, Bus, Ship, Wrench,
        Key, Armchair, Lamp, Utensils, Bed, Flower2, Hammer, Wind, BookOpen,
        UtensilsCrossed, Scale, HeartPulse, Lock, Clock, UserCheck, GraduationCap,
        Footprints, Watch, Cat, Bone, Search, HeartHandshake, Book, Smile,
        UserPlus, LifeBuoy, Compass, Package, Repeat, Gift
    };
    const IconComponent = icons[iconName] || Globe;
    return <IconComponent {...props} />;
};

export const CategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState({});

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
            <header className="sticky-header" style={{
                padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1.25rem'
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '14px',
                                            background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--primary)'
                                        }}>
                                            <CategoryIcon iconName={group.icon} size={22} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{group.name}</h3>
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
                                                padding: '0.5rem 1rem 1.5rem 1rem'
                                            }}>
                                                {group.categories.map(category => {
                                                    const count = categoryStats[category] || 0;
                                                    const latestNeed = latestNeeds[category];
                                                    // Only render if the category has needs
                                                    if (count === 0) return null;
                                                    return (
                                                        <div
                                                            key={category}
                                                            onClick={() => navigate(`/search?cat=${encodeURIComponent(category)}`)}
                                                            className="glass-panel-hover"
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '0.75rem',
                                                                padding: '1.25rem',
                                                                background: 'var(--bg-surface)',
                                                                borderRadius: '16px',
                                                                cursor: 'pointer',
                                                                height: '100%'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <div style={{
                                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                                    background: 'var(--bg-base)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    color: 'var(--primary)', flexShrink: 0,
                                                                    border: '1px solid var(--border-glass)'
                                                                }}>
                                                                    <CategoryIcon iconName={getCategoryIcon(category)} size={20} />
                                                                </div>
                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                                                        {category}
                                                                    </p>
                                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                        {count} {count === 1 ? 'need' : 'needs'} posted
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {latestNeed && (
                                                                <div style={{
                                                                    marginTop: 'auto',
                                                                    paddingTop: '0.75rem',
                                                                    borderTop: '1px dashed var(--border-glass)'
                                                                }}>
                                                                    <p style={{
                                                                        margin: 0, fontSize: '0.85rem',
                                                                        color: 'var(--text-secondary)',
                                                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        Latest: {latestNeed.title}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
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
        </div>
    );
};
