import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Send, MapPin, Clock, Search, Loader, UploadCloud, 
    Code, Laptop, Music, Palette, Trophy, Home, Car, ShoppingBag, 
    Settings, Briefcase, Shirt, PawPrint, Heart, Plane, MoreHorizontal, 
    Globe, Terminal, Smartphone, HelpCircle, Layout, Shield, BarChart, 
    Cloud, Mouse, Wifi, Guitar, Gamepad2, Tv, Mic2, GlassWater, Tent, 
    Calendar, Scissors, Camera, PenTool, Sparkles, Dribbble, Activity, 
    Building, Palmtree, Building2, Mountain, Bike, Truck, Ship, Wrench, 
    Key, Armchair, Lamp, Utensils, Bed, Flower2, Hammer, Wind, BookOpen, 
    UtensilsCrossed, Scale, HeartPulse, Lock, Clock as ClockIcon, 
    UserCheck, GraduationCap, Footprints, Watch, Cat, Bone, HeartHandshake, 
    Book, Smile, UserPlus, Users, Compass, Package, Repeat, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, CATEGORY_GROUPS, getCategoryGroup, getCategoryIcon } from '../data/categories';
import { uploadImageToCloudinary } from '../lib/needsService';

const CategoryIcon = ({ iconName, ...props }) => {
    const icons = {
        Code, Laptop, Music, Palette, Trophy, Home, Car, ShoppingBag,
        Settings, Briefcase, Shirt, PawPrint, Users, Heart, Plane, MoreHorizontal,
        Globe, Terminal, Smartphone, HelpCircle, Layout, Shield, BarChart,
        Cloud, Mouse, Wifi, Guitar, Gamepad2, Tv, Mic2, GlassWater, Tent,
        Calendar, Scissors, Camera, PenTool, Sparkles, Dribbble, Activity,
        Building, Palmtree, Building2, Mountain, Bike, Truck, Ship, Wrench,
        Key, Armchair, Lamp, Utensils, Bed, Flower2, Hammer, Wind, BookOpen,
        UtensilsCrossed, Scale, HeartPulse, Lock, UserCheck, GraduationCap,
        Footprints, Watch, Cat, Bone, Search, HeartHandshake, Book, Smile,
        UserPlus, Compass, Package, Repeat, Gift
    };
    const IconComponent = icons[iconName] || Globe;
    return <IconComponent {...props} />;
};

export const EditNeedModal = ({ isOpen, onClose, need, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Products',
        description: '',
        currency: '$',
        budgetMode: 'fixed',
        budgetMin: '',
        budgetMax: '',
        location: '',
        flexibility: 'Flexible start'
    });
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const categoryRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);

        const handleClickOutside = (e) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (need) {
            setFormData({
                title: need.title || '',
                category: need.category || 'Products',
                description: need.description || '',
                currency: need.currency || '$',
                budgetMode: need.budgetMode || 'fixed',
                budgetMin: need.budgetMin || '',
                budgetMax: need.budgetMax || '',
                location: need.location === 'Remote' ? '' : (need.location || ''),
                flexibility: need.flexibility || 'Flexible start'
            });
            setImagePreview(need.imageUrl || '');
            setImageFile(null);
        }
    }, [need, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            e.target.value = '';
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = need.imageUrl || '';
            if (imageFile) {
                setUploadingImage(true);
                imageUrl = await uploadImageToCloudinary(imageFile);
                setUploadingImage(false);
            } else if (!imagePreview) {
                // If image was cleared
                imageUrl = null;
            }

            await onUpdate(need.id, {
                title: formData.title,
                category: formData.category,
                description: formData.description,
                currency: formData.currency,
                budget_mode: formData.budgetMode,
                budget_min: parseFloat(formData.budgetMin) || 0,
                budget_max: parseFloat(formData.budgetMax) || null,
                location: formData.location || null,
                flexibility: formData.flexibility,
                image_url: imageUrl
            });
            onClose();
        } catch (err) {
            console.error("Failed to update need:", err);
            alert("Error updating need.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const inputStyles = {
        width: '100%',
        padding: '0.8rem 1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-glass)',
        borderRadius: '8px',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay-social" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
                        className="modal-content-social"
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: '600px',
                            borderRadius: isMobile ? '20px 20px 0 0' : '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            height: isMobile ? '68dvh' : 'auto',
                            maxHeight: isMobile ? '68dvh' : '90dvh',
                            marginTop: isMobile ? 'auto' : '0'
                        }}
                    >
                        <header style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid var(--border-glass)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'var(--bg-surface)', zIndex: 10, flexShrink: 0
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Edit Need</h3>
                            <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }} className="glass-panel-hover">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)' }}>
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}>
                                {/* Unified Composer Area */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.75rem' : '0.5rem' }}>
                                    <input
                                        required
                                        type="text"
                                        name="title"
                                        className="composer-input"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Title of your need..."
                                        style={{
                                            ...inputStyles,
                                            background: 'transparent', border: 'none', padding: '0.25rem 0',
                                            fontSize: '1.25rem', fontWeight: 600, borderRadius: 0, boxShadow: 'none'
                                        }}
                                    />
                                    <textarea
                                        required
                                        name="description"
                                        className="composer-input"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Description..."
                                        rows={isMobile ? 6 : 4}
                                        style={{
                                            ...inputStyles,
                                            background: 'transparent', border: 'none', padding: 0,
                                            fontSize: '1rem', borderRadius: 0, boxShadow: 'none', resize: 'none',
                                            minHeight: '100px'
                                        }}
                                    />
                                </div>

                                {/* Row 1: Category & Location */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <div style={{ position: 'relative', flex: 1, minWidth: '150px' }} ref={categoryRef}>
                                        <div
                                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem',
                                                borderRadius: '9999px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                                fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)'
                                            }}
                                            className="glass-panel-hover"
                                        >
                                            <CategoryIcon iconName={getCategoryGroup(formData.category).icon} size={14} />
                                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formData.category}</span>
                                        </div>
                                        {showCategoryDropdown && (
                                            <div style={{
                                                position: 'absolute', bottom: '100%', left: 0, width: '250px',
                                                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                                borderRadius: '12px', marginBottom: '8px', zIndex: 100,
                                                boxShadow: 'none', maxHeight: '250px', overflowY: 'auto'
                                            }}>
                                                <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-glass)', position: 'sticky', top: 0, background: 'var(--bg-surface)' }}>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Search categories..."
                                                        value={categorySearch}
                                                        onChange={(e) => setCategorySearch(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ width: '100%', padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}
                                                    />
                                                </div>
                                                 <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                                    {categorySearch ? (
                                                        // Flat list for search
                                                        CATEGORIES.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                                                            <div
                                                                key={cat}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFormData(prev => ({ ...prev, category: cat }));
                                                                    setShowCategoryDropdown(false);
                                                                    setCategorySearch('');
                                                                }}
                                                                style={{ padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                                                                className="nav-link-hover"
                                                            >
                                                                <CategoryIcon iconName={getCategoryIcon(cat)} size={14} color="var(--text-muted)" />
                                                                {cat}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        // Hierarchical list for default view
                                                        CATEGORY_GROUPS.map(group => (
                                                            <div key={group.name}>
                                                                <div style={{
                                                                    padding: '0.6rem 1rem',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 700,
                                                                    color: 'var(--primary)',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.05em',
                                                                    background: 'var(--bg-base)',
                                                                    position: 'sticky',
                                                                    top: 0,
                                                                    zIndex: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem'
                                                                }}>
                                                                    <CategoryIcon iconName={group.icon} size={14} />
                                                                    {group.name}
                                                                </div>
                                                                {group.categories.map(cat => (
                                                                    <div
                                                                        key={cat}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setFormData(prev => ({ ...prev, category: cat }));
                                                                            setShowCategoryDropdown(false);
                                                                            setCategorySearch('');
                                                                        }}
                                                                        style={{ padding: '0.6rem 1.25rem', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                                                                        className="nav-link-hover"
                                                                    >
                                                                        <CategoryIcon iconName={getCategoryIcon(cat)} size={14} color="var(--text-muted)" />
                                                                        {cat}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem',
                                            borderRadius: '9999px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                            fontSize: '0.8rem', color: 'var(--text-secondary)'
                                        }}>
                                            <MapPin size={14} />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="Remote or City"
                                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Budget & Timing */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem',
                                        borderRadius: '9999px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                        fontSize: '0.8rem', color: 'var(--text-secondary)', flexShrink: 0
                                    }}>
                                        <select name="currency" value={formData.currency} onChange={handleChange} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                                            <option value="$">$ USD</option>
                                            <option value="€">€ EUR</option>
                                            <option value="£">£ GBP</option>
                                            <option value="₦">₦ NGN</option>
                                            <option value="C$">C$ CAD</option>
                                            <option value="A$">A$ AUD</option>
                                            <option value="₹">₹ INR</option>
                                            <option value="¥">¥ JPY</option>
                                            <option value="R">R ZAR</option>
                                            <option value="د.إ">د.إ AED</option>
                                        </select>
                                        <select name="budgetMode" value={formData.budgetMode} onChange={handleChange} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                                            <option value="fixed">Fixed</option>
                                            <option value="range">Range</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="trade">Trade</option>
                                        </select>
                                        {formData.budgetMode !== 'trade' && (
                                            <input
                                                required
                                                type="number"
                                                name="budgetMin"
                                                value={formData.budgetMin}
                                                onChange={handleChange}
                                                placeholder={formData.budgetMode === 'range' ? 'Min' : 'Price'}
                                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', width: '60px' }}
                                            />
                                        )}
                                        {formData.budgetMode === 'range' && (
                                            <>
                                                <span style={{ opacity: 0.5 }}>-</span>
                                                <input
                                                    required
                                                    type="number"
                                                    name="budgetMax"
                                                    value={formData.budgetMax}
                                                    onChange={handleChange}
                                                    placeholder="Max"
                                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', width: '60px' }}
                                                />
                                            </>
                                        )}
                                    </div>

                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem',
                                        borderRadius: '9999px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                        fontSize: '0.8rem', color: 'var(--text-secondary)'
                                    }}>
                                        <Clock size={14} />
                                        <select name="flexibility" value={formData.flexibility} onChange={handleChange} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                                            <option value="ASAP">ASAP</option>
                                            <option value="within_week">Within a Week</option>
                                            <option value="Flexible start">Flexible</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Image Preview */}
                                {imagePreview && (
                                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)', marginTop: '0.5rem' }}>
                                        <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'white', padding: '2px', cursor: 'pointer' }}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{
                                padding: '0.75rem 1.5rem',
                                borderTop: '1px solid var(--border-glass)',
                                background: 'var(--bg-surface)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                flexShrink: 0
                            }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{ color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem' }} className="btn-icon" title="Change Image">
                                        <UploadCloud size={20} />
                                    </button>
                                </div>

                                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.6rem 2rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.6 : 1 }}>
                                    {loading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                                    <span>{loading ? 'Updating...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
