import React, { useState } from 'react';
import { X, CheckCircle, Search, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfileByUsername } from '../lib/profileService';
import { createNeedStory } from '../lib/storyService';

export const MarkMetModal = ({ isOpen, onClose, need, onConfirm }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setUsername('');
            setError('');
            setLoading(false);
            setSuccess(false);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const cleanUsername = username.trim().replace('@', '');
            if (!cleanUsername) {
                setError('Please enter a username');
                setLoading(false);
                return;
            }

            const helperProfile = await getProfileByUsername(cleanUsername);
            if (!helperProfile) {
                setError('User not found. Please check the spelling.');
                setLoading(false);
                return;
            }

            await onConfirm(need.id, helperProfile);
            await createNeedStory(need.id, helperProfile);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setUsername('');
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Fulfillment error:", err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        width: '100%',
        padding: '0.8rem 1rem',
        background: 'var(--bg-base)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
                    padding: isMobile ? '0' : '1rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)'
                }} onClick={onClose}>
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: isMobile ? '100%' : 20, scale: isMobile ? 1 : 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: isMobile ? '100%' : 20, scale: isMobile ? 1 : 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            background: 'var(--bg-surface)', 
                            border: isMobile ? 'none' : '1px solid var(--border-glass)',
                            borderTop: isMobile ? '1px solid var(--border-glass)' : undefined,
                            borderRadius: isMobile ? '24px 24px 0 0' : '24px', 
                            width: '100%', maxWidth: isMobile ? '100%' : '420px',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                            paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 1.5rem)' : '0'
                        }}
                    >
                        {/* Drag indicator for mobile bottom sheet */}
                        {isMobile && (
                            <div style={{ width: '40px', height: '4px', background: 'var(--border-glass)', borderRadius: '2px', margin: '0.75rem auto 0', opacity: 0.5 }} />
                        )}

                        {success ? (
                            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={{ color: '#10b981', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}
                                >
                                    <CheckCircle size={64} />
                                </motion.div>
                                <h3 className="h3" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>Success!</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Need marked as met. Helper tagged!</p>
                            </div>
                        ) : (
                            <>
                                <header style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isMobile ? 'none' : '1px solid var(--border-glass)' }}>
                                    <div>
                                        <h2 className="h2" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Mark as Met</h2>
                                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Acknowledge who helped you</p>
                                    </div>
                                    <button onClick={onClose} style={{ background: 'var(--bg-base)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
                                        <X size={20} />
                                    </button>
                                </header>

                                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                        Who helped you with this? Tag them to boost their "Fulfilled Requests" count and generate a success story.
                                    </p>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Helper Username</label>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.6 }} />
                                            <input
                                                autoFocus
                                                required
                                                placeholder="e.g. johndoe"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                style={{ ...inputStyles, paddingLeft: '3rem' }}
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {error && (
                                                <motion.p 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 500 }}
                                                >
                                                    {error}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !username.trim()}
                                        className="btn-primary"
                                        style={{ 
                                            width: '100%', 
                                            padding: '1.1rem', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '0.75rem',
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            borderRadius: '14px',
                                            boxShadow: '0 10px 20px -5px var(--primary-shadow)'
                                        }}
                                    >
                                        {loading ? <Loader size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                                        Mark as Resolved
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
