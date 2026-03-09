import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, DollarSign, MapPin, Clock, Search } from 'lucide-react';
import { CATEGORIES } from '../data/categories';

export const PostNeedPage = () => {
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
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const categoryRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate submission
        console.log('Submitting Need:', formData);
        alert('Need Posted successfully! Providers will now be able to reach out to you.');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <section style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h1 className="h1 text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>What do you need?</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Fill out the details below. Be specific so providers can offer you the best match.</p>
            </section>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >

                {/* Core Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Title</label>
                        <input
                            required
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Need a Python Tutor for Data Science"
                            style={inputStyles}
                        />
                    </div>

                    <div className="form-grid-2">
                        <div style={{ position: 'relative' }} ref={categoryRef}>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Category</label>
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
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxHeight: '300px',
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
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Location / Delivery</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Remote, City, or Address"
                                    style={{ ...inputStyles, paddingLeft: '2.8rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</label>
                        <textarea
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe exactly what you are looking for. Include requirements, quality expectations, etc."
                            rows={5}
                            style={{ ...inputStyles, resize: 'vertical', paddingTop: '1rem' }}
                        />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)' }} />

                {/* Budget & Constraints */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 className="h3" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Budget & Constraints</h3>

                    <div className="budget-grid">
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Budget Type & Amount</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select name="budgetMode" value={formData.budgetMode} onChange={handleChange} style={{ ...inputStyles, width: 'auto' }}>
                                    <option value="fixed">Fixed</option>
                                    <option value="range">Range</option>
                                    <option value="hourly">Hourly</option>
                                </select>

                                <div style={{ position: 'relative', flex: 1 }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        required
                                        type="number"
                                        name="budgetMin"
                                        value={formData.budgetMin}
                                        onChange={handleChange}
                                        placeholder={formData.budgetMode === 'range' ? 'Min' : 'Amount'}
                                        style={{ ...inputStyles, paddingLeft: '2.2rem' }}
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
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Time Flexibility</label>
                            <div style={{ position: 'relative' }}>
                                <Clock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select name="flexibility" value={formData.flexibility} onChange={handleChange} style={{ ...inputStyles, paddingLeft: '2.8rem' }}>
                                    <option value="ASAP">Need it ASAP (Urgent)</option>
                                    <option value="within_week">Within a Week</option>
                                    <option value="Flexible start">Flexible / Whenever</option>
                                    <option value="Specific date">Must be exact date</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
                    <Send size={18} />
                    Post "I Need Am"
                </button>

            </motion.form>
        </div>
    );
};

// Reusable styling for form inputs to match the glassmorphism theme
const inputStyles = {
    width: '100%',
    padding: '0.8rem 1rem',
    background: 'rgba(15, 17, 21, 0.4)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
};
