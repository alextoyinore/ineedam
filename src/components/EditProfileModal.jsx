import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader, Camera } from 'lucide-react';
import { updateProfile, isUsernameAvailable } from '../lib/profileService';
import { uploadImageToCloudinary } from '../lib/needsService';

export const EditProfileModal = ({ isOpen, onClose, currentProfile, onProfileUpdate }) => {
    const [submitting, setSubmitting] = useState(false);
    const [uploadingField, setUploadingField] = useState(null); // 'avatar_url' or 'banner_url'
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);

    // Local form state
    const [formData, setFormData] = useState({
        display_name: '',
        username: '',
        bio: '',
        location: '',
        avatar_url: '',
        banner_url: ''
    });

    // Handle resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Populate form when modal opens
    useEffect(() => {
        if (currentProfile) {
            setFormData({
                display_name: currentProfile.display_name || '',
                username: currentProfile.username || '',
                bio: currentProfile.bio || '',
                location: currentProfile.location || '',
                avatar_url: currentProfile.avatar_url || '',
                banner_url: currentProfile.banner_url || ''
            });
        }
    }, [currentProfile, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'username' ? value.toLowerCase().replace(/\s/g, '') : value
        }));
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setUploadingField(field);
        try {
            const url = await uploadImageToCloudinary(file);
            setFormData(prev => ({ ...prev, [field]: url }));
        } catch (err) {
            console.error("Upload error", err);
            setError(`Failed to upload ${field === 'avatar_url' ? 'avatar' : 'banner'}`);
        } finally {
            setUploadingField(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // Check username availability if changed
            if (formData.username !== currentProfile.username) {
                const available = await isUsernameAvailable(formData.username, currentProfile.id);
                if (!available) {
                    setError('This username is already taken. Please choose another.');
                    setSubmitting(false);
                    return;
                }
            }

            const updated = await updateProfile(currentProfile.id, formData);
            onProfileUpdate(updated);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        marginBottom: '1rem'
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', 
                    alignItems: isMobile ? 'flex-end' : 'center', 
                    justifyContent: 'center', 
                    padding: isMobile ? 0 : '1rem'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
                    animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }}
                    exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                        borderRadius: isMobile ? '24px 24px 0 0' : '24px', 
                        width: '100%', maxWidth: isMobile ? '100%' : '500px',
                        maxHeight: isMobile ? '90vh' : 'auto',
                        overflow: 'hidden',
                        display: 'flex', 
                        flexDirection: 'column'
                    }}
                >
                    {/* Handle for mobile bottom sheet */}
                    {isMobile && (
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.75rem', flexShrink: 0 }}>
                            <div style={{ width: '40px', height: '4px', background: 'var(--border-glass)', borderRadius: '2px' }} />
                        </div>
                    )}

                    {/* Header - Sticky */}
                    <div style={{ 
                        padding: '1.25rem 1.5rem', 
                        borderBottom: '1px solid var(--border-glass)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexShrink: 0
                    }}>
                        <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Edit Profile</h2>
                        <button onClick={onClose} style={{ padding: '0.25rem', borderRadius: '50%', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        
                        {/* Scrollable Content */}
                        <div style={{ 
                            padding: '1.5rem', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            overflowY: 'auto', 
                            flex: 1 
                        }}>
                            {/* Images Section */}
                            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                                {/* Banner */}
                                <div style={{
                                    height: '120px', borderRadius: '12px',
                                    background: formData.banner_url ? `url(${formData.banner_url}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                    <label style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }} className="glass-panel-hover">
                                        <Camera size={16} />
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'banner_url')} disabled={uploadingField === 'banner_url'} />
                                    </label>
                                    {uploadingField === 'banner_url' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} color="white" /></div>}
                                </div>

                                {/* Avatar */}
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--bg-base)',
                                    background: formData.avatar_url ? `url(${formData.avatar_url}) center/cover` : 'var(--bg-surface)',
                                    position: 'absolute', bottom: '-20px', left: '1.5rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', zIndex: 10
                                }}>
                                    {!formData.avatar_url && (formData.display_name?.charAt(0) || 'A')}
                                    <label style={{ 
                                        position: 'absolute', bottom: '0', right: '-5px', 
                                        background: 'var(--primary)', 
                                        width: '28px', height: '28px', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '50%', color: 'white', cursor: 'pointer', 
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                                    }}>
                                        <Camera size={14} />
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'avatar_url')} disabled={uploadingField === 'avatar_url'} />
                                    </label>
                                    {uploadingField === 'avatar_url' && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} color="white" /></div>}
                                </div>
                            </div>

                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    {error}
                                </div>
                            )}

                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
                            <input
                                type="text" name="display_name" value={formData.display_name} onChange={handleChange} required
                                style={inputStyle}
                            />

                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Username</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '0.75rem', color: 'var(--text-muted)' }}>@</span>
                                <input
                                    type="text" name="username" value={formData.username} onChange={handleChange}
                                    style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                                />
                            </div>

                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bio</label>
                            <textarea
                                name="bio" value={formData.bio} onChange={handleChange} rows={4}
                                style={{ ...inputStyle, resize: 'vertical' }}
                                placeholder="Tell the community about yourself..."
                            />

                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Location</label>
                            <input
                                type="text" name="location" value={formData.location} onChange={handleChange}
                                style={inputStyle}
                                placeholder="e.g. San Francisco, CA"
                            />
                        </div>

                        {/* Footer - Sticky */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            padding: '1.25rem 1.5rem', 
                            borderTop: '1px solid var(--border-glass)',
                            background: 'var(--bg-base)',
                            paddingBottom: isMobile ? 'calc(1.25rem + env(safe-area-inset-bottom))' : '1.25rem',
                            flexShrink: 0
                        }}>
                            <button type="button" onClick={onClose} className="btn" style={{ background: 'transparent', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', marginRight: '1rem', cursor: 'pointer', border: 'none' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
