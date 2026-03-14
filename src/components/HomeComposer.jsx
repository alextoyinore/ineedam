import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, MapPin, Clock, X, Archive, Image, Loader, Paperclip, 
    FileText, Search, Code, Laptop, Music, Palette, Trophy, Home, 
    Car, ShoppingBag, Settings, Briefcase, Shirt, PawPrint, 
    Heart, Plane, MoreHorizontal, Globe, Terminal, Smartphone, HelpCircle, 
    Layout, Shield, BarChart, Cloud, Mouse, Wifi, Guitar, Gamepad2, Tv, 
    Mic2, GlassWater, Tent, Calendar, Scissors, Camera, PenTool, Sparkles, 
    Dribbble, Activity, Building, Palmtree, Building2, Mountain, Bike, 
    Truck, Ship, Wrench, Key, Armchair, Lamp, Utensils, Bed, Flower2, 
    Hammer, Wind, BookOpen, UtensilsCrossed, Scale, HeartPulse, Lock, 
    UserCheck, GraduationCap, Footprints, Watch, Cat, Bone, HeartHandshake, 
    Book, Smile, UserPlus, Users, Compass, Package, Repeat, Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createNeed, uploadImageToCloudinary, uploadFileToCloudinary } from '../lib/needsService';
import { CATEGORIES, CATEGORY_GROUPS, getCategoryGroup, getCategoryIcon } from '../data/categories';

const CategoryIcon = ({ iconName, ...props }) => {
    const icons = {
        Code, Laptop, Music, Palette, Trophy, Home, Car, ShoppingBag,
        Settings, Briefcase, Shirt, PawPrint, Users, Heart, Plane, MoreHorizontal,
        Globe, Terminal, Smartphone, HelpCircle, Layout, Shield, BarChart,
        Cloud, Mouse, Wifi, Guitar, Gamepad2, Tv, Mic2, GlassWater, Tent,
        Calendar, Scissors, Camera, PenTool, Sparkles, Dribbble, Activity,
        Building, Palmtree, Building2, Mountain, Bike, Truck, Ship, Wrench,
        Key, Armchair, Lamp, Utensils, Bed, Flower2, Hammer, Wind, BookOpen,
        UtensilsCrossed, Scale, HeartPulse, Lock, Clock, UserCheck, GraduationCap,
        Footprints, Watch, Cat, Bone, Search, HeartHandshake, Book, Smile,
        UserPlus, Compass, Package, Repeat, Gift
    };
    const IconComponent = icons[iconName] || Globe;
    return <IconComponent {...props} />;
};

export const HomeComposer = () => {
    const { profile } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const fileInputRef = useRef(null);
    const attachmentInputRef = useRef(null);
    const composerRef = useRef(null);
    const categoryRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        category: 'General Product',
        description: '',
        currency: '$',
        budgetMode: 'fixed',
        budgetMin: '',
        budgetMax: '',
        location: '',
        flexibility: 'Flexible start',
        imageUrl: ''
    });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (composerRef.current && !composerRef.current.contains(e.target)) {
                // Only collapse if the form is empty
                if (!formData.title && !formData.description && !imagePreview && !attachedFile) {
                    setIsExpanded(false);
                    setShowCategoryDropdown(false);
                }
            }
            if (categoryRef.current && !categoryRef.current.contains(e.target)) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [formData, imagePreview, attachedFile]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setSubmitError('File size must be less than 10MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setSubmitError('File size must be less than 10MB');
            return;
        }
        setAttachedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return;

        setSubmitError('');
        setSubmitting(true);

        try {
            let imageUrl = '';
            if (imageFile) {
                setUploadingImage(true);
                imageUrl = await uploadImageToCloudinary(imageFile);
                setUploadingImage(false);
            }

            let fileUrl = '';
            let fileType = '';
            if (attachedFile) {
                setUploadingFile(true);
                const res = await uploadFileToCloudinary(attachedFile);
                fileUrl = res.url;
                fileType = res.fileType;
                setUploadingFile(false);
            }

            await createNeed({ ...formData, imageUrl, fileUrl, fileType }, profile.id);

            // Reset
            setFormData({ title: '', category: 'General Product', description: '', currency: '$', budgetMode: 'fixed', budgetMin: '', budgetMax: '', location: '', flexibility: 'Flexible start', imageUrl: '' });
            setImageFile(null);
            setImagePreview('');
            setAttachedFile(null);
            setIsExpanded(false);
        } catch (err) {
            setSubmitError(err.message || 'Failed to post need. Please try again.');
        } finally {
            setSubmitting(false);
            setUploadingImage(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div
            ref={composerRef}
            className="glass-panel"
            style={{
                margin: '0',
                padding: '1rem 1.25rem',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderRadius: '0',
                background: 'var(--bg-surface)'
            }}
        >
            <div style={{ display: 'flex', gap: '1rem' }}>
                <div 
                    className="avatar-md"
                    style={{
                        borderRadius: '50%', flexShrink: 0,
                        background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold',
                        overflow: 'hidden'
                    }}
                >
                    {!profile?.avatar_url && (profile?.display_name?.charAt(0).toUpperCase() || '?')}
                </div>

                <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            onFocus={() => setIsExpanded(true)}
                            placeholder="What do you need?"
                            className="composer-input"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '1.2rem',
                                fontWeight: 500,
                                fontFamily: 'inherit',
                                padding: '0.5rem 0',
                                width: '100%'
                            }}
                        />
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <textarea
                                        required
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe your need in detail..."
                                        rows={3}
                                        className="composer-input"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            color: 'var(--text-primary)',
                                            fontSize: '1rem',
                                            fontFamily: 'inherit',
                                            padding: '0.5rem 0',
                                            width: '100%',
                                            resize: 'none'
                                        }}
                                    />

                                    {/* Action Rows */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                                        {/* Category */}
                                        <div style={{ position: 'relative' }} ref={categoryRef}>
                                            <div
                                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                style={pillStyles}
                                                className="glass-panel-hover"
                                            >
                                                <CategoryIcon iconName={getCategoryGroup(formData.category).icon} size={14} />
                                                <span>{formData.category}</span>
                                            </div>
                                            {showCategoryDropdown && (
                                                <div style={dropdownStyles}>
                                                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder="Search categories..."
                                                            value={categorySearch}
                                                            onChange={(e) => setCategorySearch(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={searchInputStyles}
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

                                        {/* Location */}
                                        <div style={{ ...pillStyles, cursor: 'default' }}>
                                            <MapPin size={14} />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="Remote or City"
                                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', width: '100px' }}
                                            />
                                        </div>

                                        {/* Budget Group */}
                                        <div style={{ ...pillStyles, cursor: 'default' }}>
                                            <select name="currency" value={formData.currency} onChange={handleChange} style={selectStyles}>
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
                                            <select name="budgetMode" value={formData.budgetMode} onChange={handleChange} style={selectStyles}>
                                                <option value="fixed">Fixed</option>
                                                <option value="range">Range</option>
                                                <option value="hourly">Hourly</option>
                                                <option value="trade">Trade</option>
                                            </select>
                                            {formData.budgetMode !== 'trade' && (
                                                <input
                                                    type="number"
                                                    name="budgetMin"
                                                    value={formData.budgetMin}
                                                    onChange={handleChange}
                                                    placeholder={formData.budgetMode === 'range' ? 'Min' : 'Budget'}
                                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', width: '60px' }}
                                                />
                                            )}
                                        </div>

                                        {/* Flexibility */}
                                        <div style={{ ...pillStyles, cursor: 'default' }}>
                                            <Clock size={14} />
                                            <select name="flexibility" value={formData.flexibility} onChange={handleChange} style={selectStyles}>
                                                <option value="ASAP">ASAP</option>
                                                <option value="within_week">Within Week</option>
                                                <option value="Flexible start">Flexible</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Previews */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                                        {imagePreview && (
                                            <div style={mediaPreviewStyles}>
                                                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} style={removeMediaStyles}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                        {attachedFile && (
                                            <div style={{ ...pillStyles, borderRadius: '8px' }}>
                                                <FileText size={16} color="var(--primary)" />
                                                <span style={{ fontSize: '0.75rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachedFile.name}</span>
                                                <button type="button" onClick={() => setAttachedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: isExpanded ? '0.5rem' : '0',
                        paddingTop: isExpanded ? '0.5rem' : '0',
                        borderTop: isExpanded ? '1px solid var(--border-glass)' : 'none'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            <input ref={attachmentInputRef} type="file" onChange={handleFileChange} style={{ display: 'none' }} />

                            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-icon">
                                <Image size={20} color="var(--primary)" />
                            </button>
                            <button type="button" onClick={() => attachmentInputRef.current?.click()} className="btn-icon">
                                <Paperclip size={20} color="var(--primary)" />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !formData.title || !formData.description}
                            className="btn-primary"
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '9999px',
                                height: '36px',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            {submitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                            <span>{submitting ? 'Posting...' : 'Post'}</span>
                        </button>
                    </div>

                    {submitError && (
                        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            {submitError}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

const pillStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.3rem 0.6rem',
    borderRadius: '9999px',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-glass)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s'
};

const dropdownStyles = {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '250px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
    marginTop: '8px',
    zIndex: 100,
    boxShadow: 'none'
};

const searchInputStyles = {
    width: '100%',
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-glass)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    outline: 'none'
};

const selectStyles = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer'
};

const mediaPreviewStyles = {
    position: 'relative',
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border-glass)'
};

const removeMediaStyles = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: 'rgba(0,0,0,0.6)',
    border: 'none',
    borderRadius: '50%',
    color: 'white',
    padding: '2px',
    cursor: 'pointer',
    lineHeight: 0
};
