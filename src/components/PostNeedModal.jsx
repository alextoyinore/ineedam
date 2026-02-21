import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, DollarSign, MapPin, Clock, X, Archive, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '../context/DraftsContext';

export const PostNeedModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { drafts, saveDraft, deleteDraft } = useDrafts();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting Need:', formData);
        alert('Need Posted successfully! Providers will now be able to reach out to you.');
        onClose();
        navigate('/'); // Redirect to feed if not already there
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
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={isMobile ? "" : "glass-panel"}
                    style={{
                        width: '100%',
                        maxWidth: isMobile ? '100%' : '600px',
                        height: isMobile ? '100dvh' : 'auto',
                        maxHeight: isMobile ? '100dvh' : '90vh',
                        overflowY: 'auto',
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
                        position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 10
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

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} style={{ padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: isMobile ? '1.25rem' : '1.5rem' }}>

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
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} style={inputStyles}>
                                    <option value="Product">Product</option>
                                    <option value="Service">Service</option>
                                    <option value="Training">Training/Course</option>
                                    <option value="Housing & Real Estate">Housing & Real Estate</option>
                                    <option value="Events & Gig Work">Events & Gig Work</option>
                                </select>
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

                        {/* Photo URL */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Photo URL (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <Image size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://images.unsplash.com/..."
                                    style={{ ...inputStyles, paddingLeft: '2.25rem' }}
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={!formData.title && !formData.description}
                                className="btn btn-secondary"
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!formData.title && !formData.description) ? 0.5 : 1 }}
                            >
                                <Archive size={16} />
                                Save Draft
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px' }}>
                                <Send size={16} style={{ marginRight: '0.5rem' }} />
                                Post Need
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
