import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MapPin, Clock, Search, Loader, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../data/categories';
import { uploadImageToCloudinary } from '../lib/needsService';

export const EditNeedModal = ({ isOpen, onClose, need, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Products',
        description: '',
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
                <div className="modal-overlay-social">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
                        className="modal-content-social"
                    >
                        <header style={{
                            padding: isMobile ? '1rem' : '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--border-glass)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'var(--bg-surface)', zIndex: 10, flexShrink: 0
                        }}>
                            <h2 className="h2" style={{ margin: 0, fontSize: '1.25rem' }}>Edit Need</h2>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: isMobile ? '1rem' : '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.25rem',
                                WebkitOverflowScrolling: 'touch'
                            }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Title</label>
                                    <input required name="title" value={formData.title} onChange={handleChange} style={inputStyles} />
                                </div>

                                <div className="form-grid-2">
                                    <div style={{ position: 'relative' }} ref={categoryRef}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                                        <div
                                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                            style={{ ...inputStyles, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <span>{formData.category || 'Select a category'}</span>
                                            <Search size={14} style={{ opacity: 0.5 }} />
                                        </div>

                                        {showCategoryDropdown && (
                                            <div style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0,
                                                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                                borderRadius: '8px', marginTop: '4px', zIndex: 100,
                                                boxShadow: 'none', // Removed shadow
                                                maxHeight: '300px',
                                                display: 'flex', flexDirection: 'column'
                                            }}>
                                                <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Search categories..."
                                                        value={categorySearch}
                                                        onChange={(e) => setCategorySearch(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ ...inputStyles, padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                                                    />
                                                </div>
                                                <div style={{ overflowY: 'auto', flex: 1 }}>
                                                    {CATEGORIES.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                                                        <div
                                                            key={cat}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFormData(prev => ({ ...prev, category: cat }));
                                                                setShowCategoryDropdown(false);
                                                                setCategorySearch('');
                                                            }}
                                                            style={{
                                                                padding: '0.7rem 1rem', cursor: 'pointer', fontSize: '0.9rem',
                                                                background: formData.category === cat ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                                                                borderLeft: formData.category === cat ? '3px solid var(--primary)' : '3px solid transparent'
                                                            }}
                                                            className="nav-link-hover"
                                                        >
                                                            {cat}
                                                        </div>
                                                    ))}
                                                    {CATEGORIES.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                                                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                            No categories found
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Location</label>
                                        <input name="location" value={formData.location} onChange={handleChange} placeholder="Remote or City" style={inputStyles} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description</label>
                                    <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} style={{ ...inputStyles, resize: 'vertical' }} />
                                </div>

                                <div className="form-grid-2">
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Budget Mode</label>
                                        <select name="budgetMode" value={formData.budgetMode} onChange={handleChange} style={inputStyles}>
                                            <option value="fixed">Fixed</option>
                                            <option value="range">Range</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="trade">Trade</option>
                                        </select>
                                    </div>
                                    {formData.budgetMode !== 'trade' && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Amount ({formData.budgetMode === 'range' ? 'Min' : 'Price'})</label>
                                            <input type="number" name="budgetMin" value={formData.budgetMin} onChange={handleChange} style={inputStyles} />
                                        </div>
                                    )}
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Photo (Optional)</label>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                    {imagePreview ? (
                                        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                                            <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} style={{
                                                position: 'absolute', top: '0.5rem', right: '0.5rem',
                                                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                                                color: 'white', width: '28px', height: '28px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                            }}><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                                            ...inputStyles, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            gap: '0.5rem', cursor: 'pointer', padding: '1.25rem',
                                            color: 'var(--text-muted)', width: '100%', border: '1px dashed var(--border-glass)'
                                        }}>
                                            <UploadCloud size={18} /> Upload or Change Image
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{
                                padding: isMobile ? '1rem' : '1.25rem 1.5rem',
                                borderTop: '1px solid var(--border-glass)',
                                background: 'var(--bg-surface)',
                                flexShrink: 0
                            }}>
                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                                    {loading ? (
                                        <><Loader size={18} className="animate-spin" /> Updating...</>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
