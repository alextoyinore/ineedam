import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Clock, X, Archive, Image, Loader, UploadCloud, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '../context/DraftsContext';
import { useAuth } from '../context/AuthContext';
import { createNeed, uploadImageToCloudinary } from '../lib/needsService';
import { CATEGORIES } from '../data/categories';

export const PostNeedModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { drafts, saveDraft, deleteDraft } = useDrafts();
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const fileInputRef = useRef(null);
    const categoryRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
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

    const [formData, setFormData] = useState({
        title: '',
        category: 'Product',
        description: '',
        currency: '$',
        budgetMode: 'fixed',
        budgetMin: '',
        budgetMax: '',
        location: '',
        flexibility: 'Flexible start',
        imageUrl: ''
    });
    const [showDrafts, setShowDrafts] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitting(true);

        try {
            let imageUrl = '';
            if (imageFile) {
                setUploadingImage(true);
                imageUrl = await uploadImageToCloudinary(imageFile);
                setUploadingImage(false);
            }

            await createNeed({ ...formData, imageUrl }, user.id);

            // Reset
            setFormData({ title: '', category: 'Product', description: '', currency: '$', budgetMode: 'fixed', budgetMin: '', budgetMax: '', location: '', flexibility: 'Flexible start', imageUrl: '' });
            setImageFile(null);
            setImagePreview('');
            onClose();
            navigate('/');
        } catch (err) {
            setSubmitError(err.message || 'Failed to post need. Please try again.');
        } finally {
            setSubmitting(false);
            setUploadingImage(false);
        }
    };

    const handleSaveDraft = () => {
        if (!formData.title && !formData.description) return;
        saveDraft(formData);
        alert('Draft saved successfully!');
        setFormData({
            title: '', category: 'Product', description: '', currency: '$', budgetMode: 'fixed',
            budgetMin: '', bgetMax: '', location: '', flexibility: 'Flexible start',
            imageUrl: ''
        });
    };

    const loadDraft = (draft) => {
        setFormData(draft);
        setShowDrafts(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                bottom: isMobile ? 'var(--mobile-nav-height)' : 0,
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: isMobile ? 0 : '1rem',
                background: isMobile ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
                backdropFilter: isMobile ? 'none' : 'blur(4px)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
                    className={isMobile ? "" : "glass-panel"}
                    style={{
                        width: '100%',
                        maxWidth: isMobile ? '100vw' : '600px',
                        height: isMobile ? '100%' : 'auto',
                        maxHeight: isMobile ? '100%' : '90vh',
                        overflow: 'hidden',
                        background: 'var(--bg-surface)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: isMobile ? 0 : '16px'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: isMobile ? '1rem' : '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)',
                        background: 'var(--bg-surface)', zIndex: 10, flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Post a Need</h2>
                            {drafts.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowDrafts(!showDrafts)}
                                    style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {drafts.length} drafts
                                </button>
                            )}
                        </div>
                        <button onClick={onClose} style={{
                            padding: '0.25rem', borderRadius: '50%', color: 'var(--text-muted)'
                        }} className="glass-panel-hover" title="Close">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Drafts Overlay List */}
                    {showDrafts && (
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent Drafts</span>
                                <button onClick={() => setShowDrafts(false)} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {drafts.map(draft => (
                                    <div key={draft.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => loadDraft(draft)}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{draft.title || '(No Title)'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saved {new Date(draft.savedAt).toLocaleString()}</div>
                                        </div>
                                        <button onClick={() => deleteDraft(draft.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: isMobile ? '1rem' : '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: isMobile ? '1.25rem' : '1.5rem',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            <div>
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="What do you need?"
                                    style={{
                                        ...inputStyles,
                                        fontSize: '1.25rem', fontWeight: 500, padding: '0.5rem 0',
                                        background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-glass)',
                                        borderRadius: 0
                                    }}
                                />
                            </div>

                            <div className="form-grid-2">
                                <div style={{ position: 'relative' }} ref={categoryRef}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Category</label>
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
                                                            background: formData.category === cat ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
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
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Location</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Remote or City"
                                            style={{ ...inputStyles, paddingLeft: '2.25rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe exactly what you are looking for. Be specific..."
                                    rows={4}
                                    style={{ ...inputStyles, resize: 'vertical', paddingTop: '0.75rem' }}
                                />
                            </div>

                            {/* Budget Grid */}
                            <div className="budget-grid">
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Budget Type & Amount</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select name="currency" value={formData.currency} onChange={handleChange} style={{ ...inputStyles, width: 'auto', fontWeight: 'bold' }}>
                                            <option value="$">$ (USD)</option>
                                            <option value="€">€ (EUR)</option>
                                            <option value="£">£ (GBP)</option>
                                            <option value="₦">₦ (NGN)</option>
                                            <option value="R">R (ZAR)</option>
                                            <option value="KSh">KSh (KES)</option>
                                            <option value="GH₵">GH₵ (GHS)</option>
                                            <option value="E£">E£ (EGP)</option>
                                            <option value="¥">¥ (JPY)</option>
                                            <option value="₹">₹ (INR)</option>
                                        </select>
                                        <select name="budgetMode" value={formData.budgetMode} onChange={handleChange} style={{ ...inputStyles, width: 'auto' }}>
                                            <option value="fixed">Fixed</option>
                                            <option value="range">Range</option>
                                            <option value="hourly">Hourly</option>
                                        </select>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <span style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                {formData.currency}
                                            </span>
                                            <input
                                                required
                                                type="number"
                                                name="budgetMin"
                                                value={formData.budgetMin}
                                                onChange={handleChange}
                                                placeholder={formData.budgetMode === 'range' ? 'Min' : 'Amount'}
                                                style={{ ...inputStyles, paddingLeft: '1.75rem' }}
                                            />
                                        </div>
                                        {formData.budgetMode === 'range' && (
                                            <>
                                                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>-</span>
                                                <input
                                                    required
                                                    type="number"
                                                    name="budgetMax"
                                                    value={formData.budgetMax}
                                                    onChange={handleChange}
                                                    placeholder="Max"
                                                    style={inputStyles}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Timing</label>
                                    <div style={{ position: 'relative' }}>
                                        <Clock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <select name="flexibility" value={formData.flexibility} onChange={handleChange} style={{ ...inputStyles, paddingLeft: '2.25rem' }}>
                                            <option value="ASAP">Need it ASAP</option>
                                            <option value="within_week">Within a Week</option>
                                            <option value="Flexible start">Flexible</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Photo (Optional)</label>
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
                                        <UploadCloud size={18} /> Upload Image
                                    </button>
                                )}
                            </div>

                            {/* Error */}
                            {submitError && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.875rem' }}>
                                    {submitError}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: isMobile ? '1rem' : '1.25rem 1.5rem',
                            borderTop: '1px solid var(--border-glass)',
                            background: 'var(--bg-surface)',
                            flexShrink: 0
                        }}>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={!formData.title && !formData.description}
                                className="btn btn-secondary"
                                style={{
                                    padding: isMobile ? '0.6rem 1rem' : '0.75rem 1.5rem',
                                    borderRadius: '9999px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    opacity: (!formData.title && !formData.description) ? 0.5 : 1,
                                    fontSize: isMobile ? '0.85rem' : '0.95rem'
                                }}
                            >
                                <Archive size={16} />
                                <span className={isMobile ? "desktop-only" : ""}>Save Draft</span>
                                {isMobile && <span className="mobile-only">Draft</span>}
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                                style={{
                                    padding: isMobile ? '0.6rem 1.2rem' : '0.75rem 1.5rem',
                                    borderRadius: '9999px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    opacity: submitting ? 0.7 : 1,
                                    fontSize: isMobile ? '0.85rem' : '0.95rem'
                                }}
                            >
                                {submitting
                                    ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> {uploadingImage ? 'Uploading...' : 'Posting...'}</>
                                    : <><Send size={16} /> Post Need</>}
                            </button>
                        </div>
                    </form>
                </motion.div >
            </div >
        </AnimatePresence >
    );
};

// Reusable styling for form inputs inside modal
const inputStyles = {
    width: '100%',
    padding: '0.6rem 0.75rem',
    background: 'rgba(15, 17, 21, 0.05)', // Extremely subtle background if needed
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
};
