import React, { useState, useEffect } from 'react';
import { X, Send, DollarSign, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EditNeedModal = ({ isOpen, onClose, need, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Product',
        description: '',
        budgetMode: 'fixed',
        budgetMin: '',
        budgetMax: '',
        location: '',
        flexibility: 'Flexible start'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (need) {
            // Primitive parsing of budget string if needed, 
            // but better to use the raw values from the DB if available.
            // Since we're passing the 'need' object from shapeNeed, let's ensure we have raw fields.
            setFormData({
                title: need.title || '',
                category: need.category || 'Product',
                description: need.description || '',
                budgetMode: need.budgetMode || 'fixed',
                budgetMin: need.budgetMin || '',
                budgetMax: need.budgetMax || '',
                location: need.location === 'Remote' ? '' : (need.location || ''),
                flexibility: need.flexibility || 'Flexible start'
            });
        }
    }, [need]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(need.id, {
                title: formData.title,
                category: formData.category,
                description: formData.description,
                budget_mode: formData.budgetMode,
                budget_min: parseFloat(formData.budgetMin) || 0,
                budget_max: parseFloat(formData.budgetMax) || null,
                location: formData.location || null,
                flexibility: formData.flexibility
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
        transition: 'border-color 0.2s',
        marginBottom: '1rem'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            borderRadius: '16px', width: '100%', maxWidth: '600px',
                            maxHeight: '90vh', overflowY: 'auto', position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="h2" style={{ margin: 0, fontSize: '1.25rem' }}>Edit Need</h2>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Title</label>
                                <input required name="title" value={formData.title} onChange={handleChange} style={inputStyles} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} style={inputStyles}>
                                        <option value="Product">Product</option>
                                        <option value="Service">Service</option>
                                        <option value="Training">Training</option>
                                        <option value="Housing & Real Estate">Housing</option>
                                        <option value="Events & Gig Work">Gig Work</option>
                                        <option value="Software & Tech">Software</option>
                                    </select>
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Budget Mode</label>
                                    <select name="budgetMode" value={formData.budgetMode} onChange={handleChange} style={inputStyles}>
                                        <option value="fixed">Fixed</option>
                                        <option value="range">Range</option>
                                        <option value="hourly">Hourly</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Amount ({formData.budgetMode === 'range' ? 'Min' : 'Price'})</label>
                                    <input type="number" name="budgetMin" value={formData.budgetMin} onChange={handleChange} style={inputStyles} />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', py: '1rem' }}>
                                {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
