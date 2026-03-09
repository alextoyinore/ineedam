import React, { useState } from 'react';
import { X, CheckCircle, Search, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfileByUsername } from '../lib/profileService';

export const MarkMetModal = ({ isOpen, onClose, need, onConfirm }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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
        borderRadius: '8px',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            borderRadius: '20px', width: '100%', maxWidth: '400px',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: 'none' // Removed shadow
                        }}
                    >
                        {success ? (
                            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={{ color: '#10b981', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}
                                >
                                    <CheckCircle size={64} />
                                </motion.div>
                                <h3 className="h3" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Success!</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Need marked as met. Helper tagged!</p>
                            </div>
                        ) : (
                            <>
                                <header style={{ padding: '1.5rem 1.5rem 0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 className="h2" style={{ margin: 0, fontSize: '1.25rem' }}>Mark as Met</h2>
                                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <X size={20} />
                                    </button>
                                </header>

                                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                                        Who helped you with this? Tag them to boost their "Fulfilled Requests" count.
                                    </p>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Helper Username</label>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                autoFocus
                                                required
                                                placeholder="e.g. johndoe"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                style={{ ...inputStyles, paddingLeft: '2.75rem' }}
                                            />
                                        </div>
                                        {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>{error}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !username.trim()}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        {loading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                        Confirm
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
