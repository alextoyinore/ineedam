import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Clock, X, Archive, Image, Loader, UploadCloud, Search, Paperclip, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '../context/DraftsContext';
import { useAuth } from '../context/AuthContext';
import { createNeed, uploadImageToCloudinary, uploadFileToCloudinary } from '../lib/needsService';
import { CATEGORIES } from '../data/categories';

export const PostNeedModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { drafts, saveDraft, deleteDraft } = useDrafts();
    const { profile } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);
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
    const categoryRef = useRef(null);

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

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setSubmitError('File size must be less than 10MB');
            e.target.value = '';
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setSubmitError('File size must be less than 10MB');
            e.target.value = '';
            return;
        }

        setAttachedFile(file);
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
            setFormData({ title: '', category: 'Product', description: '', currency: '$', budgetMode: 'fixed', budgetMin: '', budgetMax: '', location: '', flexibility: 'Flexible start', imageUrl: '' });
            setImageFile(null);
            setImagePreview('');
            setAttachedFile(null);
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
            <div className="modal-overlay-social">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
                    className="modal-content-social"
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
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)',
                        background: 'var(--bg-surface)', zIndex: 10, flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div 
                                className="avatar-md"
                                style={{
                                    borderRadius: '50%',
                                    background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem',
                                    overflow: 'hidden', flexShrink: 0
                                }}
                            >
                                {!profile?.avatar_url && (profile?.display_name?.charAt(0).toUpperCase() || '?')}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>Create a Need</h3>
                                {drafts.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowDrafts(!showDrafts)}
                                        style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        View Drafts ({drafts.length})
                                    </button>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            padding: '0.5rem', borderRadius: '50%', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer'
                        }} className="glass-panel-hover" title="Close">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Drafts Overlay List (Simplified) */}
                    {showDrafts && (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}>
                            {drafts.map(draft => (
                                <div key={draft.id} onClick={() => loadDraft(draft)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }} className="nav-link-hover">
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{draft.title || '(Untitled Draft)'}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(draft.savedAt).toLocaleDateString()}</div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); deleteDraft(draft.id); }} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)' }}>
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {/* Unified Text Area */}
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
                                        fontSize: '1.25rem', fontWeight: 600, padding: '0.25rem 0',
                                        background: 'transparent', border: 'none',
                                        borderRadius: 0, boxShadow: 'none'
                                    }}
                                />
                                <textarea
                                    required
                                    name="description"
                                    className="composer-input"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Tell the community what you're looking for..."
                                    rows={isMobile ? 6 : 4}
                                    style={{
                                        ...inputStyles,
                                        fontSize: '1rem', padding: '0',
                                        background: 'transparent', border: 'none',
                                        borderRadius: 0, boxShadow: 'none', resize: 'none',
                                        minHeight: '100px'
                                    }}
                                />
                            </div>

                            {/* Options Row 1: Category & Location */}
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
                                        <Archive size={14} />
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
                                            {CATEGORIES.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                                                <div
                                                    key={cat}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData(prev => ({ ...prev, category: cat }));
                                                        setShowCategoryDropdown(false);
                                                        setCategorySearch('');
                                                    }}
                                                    style={{ padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}
                                                    className="nav-link-hover"
                                                >
                                                    {cat}
                                                </div>
                                            ))}
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

                            {/* Options Row 2: Budget & Timing */}
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
                                    <select name="budgetMode" value={formData.budgetMode} onChange={handleChange} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
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
                                            placeholder={formData.budgetMode === 'range' ? 'Min' : 'Amount'}
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

                            {/* Media Previews */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                                {imagePreview && (
                                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                                        <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'white', padding: '2px', cursor: 'pointer' }}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                {attachedFile && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '12px', maxWidth: '200px' }}>
                                        <FileText size={16} color="var(--primary)" />
                                        <span style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachedFile.name}</span>
                                        <button type="button" onClick={() => setAttachedFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {submitError && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.85rem' }}>
                                    {submitError}
                                </div>
                            )}
                        </div>

                        {/* Bottom Toolbar */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border-glass)',
                            background: 'var(--bg-surface)', flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                <input ref={attachmentInputRef} type="file" onChange={handleFileChange} style={{ display: 'none' }} />

                                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-icon" style={{ color: 'var(--primary)', padding: '0.5rem', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Add Photo">
                                    <Image size={20} />
                                </button>
                                <button type="button" onClick={() => attachmentInputRef.current?.click()} className="btn-icon" style={{ color: 'var(--primary)', padding: '0.5rem', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Attach File">
                                    <Paperclip size={20} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <button 
                                    type="button" 
                                    onClick={handleSaveDraft} 
                                    disabled={!formData.title && !formData.description} 
                                    style={{ 
                                        padding: '0.5rem 1rem', 
                                        borderRadius: '9999px',
                                        fontSize: '0.85rem', 
                                        fontWeight: 600, 
                                        cursor: 'pointer',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--border-glass)',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem'
                                    }}
                                    className="glass-panel-hover"
                                >
                                    <Archive size={16} />
                                    <span>Draft</span>
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting || !formData.title || !formData.description}
                                    style={{
                                        padding: '0.6rem 1.5rem', borderRadius: '9999px',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        fontSize: '0.9rem', border: 'none', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                                    <span>{submitting ? 'Posting...' : 'Post Need'}</span>
                                </button>
                            </div>
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
    background: 'var(--bg-base)', // Using base background for depth on surface
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
};
