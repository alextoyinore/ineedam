import React, { useState } from 'react';
import { X, Award, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createEndorsement } from '../lib/endorsementService';
import { useAuth } from '../context/AuthContext';

/**
 * EndorseModal — let the need owner publicly endorse the person who helped them.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   need: { id, title, metByProfile: { id, display_name, username, avatar_url } }
 *   onSuccess: () => void  (optional callback after endorsement is created)
 */
export const EndorseModal = ({ isOpen, onClose, need, onSuccess }) => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const MAX_CHARS = 280;
    const charsLeft = MAX_CHARS - message.length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setError('');
        setLoading(true);

        try {
            await createEndorsement(
                user.id,
                need.metByProfile.id,
                need.id,
                message.trim()
            );
            setDone(true);
            setTimeout(() => {
                setDone(false);
                setMessage('');
                onClose();
                if (onSuccess) onSuccess();
            }, 2200);
        } catch (err) {
            console.error('Endorsement error:', err);
            if (err.code === '23505') {
                setError('You have already endorsed someone for this need.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMessage('');
        setError('');
        setDone(false);
        onClose();
    };

    const helper = need?.metByProfile;

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)'
                }} onClick={handleClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            borderRadius: '20px', width: '100%', maxWidth: '480px',
                            boxShadow: 'none', // Removed shadow
                            overflow: 'hidden'
                        }}
                    >
                        {done ? (
                            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}
                                >
                                    <Award size={64} />
                                </motion.div>
                                <h3 className="h3" style={{ marginBottom: '0.5rem' }}>Endorsed! 🎉</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Your endorsement for <strong>{helper?.display_name}</strong> is now public.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Award size={20} color="var(--primary)" />
                                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Endorse</h2>
                                    </div>
                                    <button onClick={handleClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem' }}>
                                    {/* Helper preview */}
                                    {helper && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem 1rem', borderRadius: '12px',
                                            background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                            marginBottom: '1.25rem'
                                        }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                                background: helper.avatar_url ? `url(${helper.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, color: 'white', overflow: 'hidden', fontSize: '1rem'
                                            }}>
                                                {!helper.avatar_url && helper.display_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{helper.display_name}</p>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{helper.username} · helped with "{need.title}"</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Message input */}
                                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                                        <textarea
                                            autoFocus
                                            placeholder={`Share how ${helper?.display_name || 'they'} made a difference...`}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                                            rows={4}
                                            style={{
                                                width: '100%', padding: '0.9rem 1rem',
                                                background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                                borderRadius: '12px', color: 'var(--text-primary)',
                                                fontSize: '0.95rem', lineHeight: 1.6, resize: 'none',
                                                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
                                            }}
                                        />
                                        <span style={{
                                            position: 'absolute', bottom: '0.6rem', right: '0.75rem',
                                            fontSize: '0.75rem',
                                            color: charsLeft < 30 ? (charsLeft < 10 ? '#ef4444' : '#f59e0b') : 'var(--text-muted)'
                                        }}>
                                            {charsLeft}
                                        </span>
                                    </div>

                                    {error && (
                                        <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
                                    )}

                                    {/* Quoted need preview */}
                                    <div style={{
                                        border: '1px solid var(--border-glass)', borderRadius: '12px',
                                        padding: '0.75rem 1rem', marginBottom: '1.25rem',
                                        background: 'var(--bg-base)'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Need</p>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{need?.title}</p>
                                        <span style={{
                                            display: 'inline-block', marginTop: '0.4rem',
                                            fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                                            borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)',
                                            color: '#10b981'
                                        }}>✓ Met</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !message.trim()}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        {loading ? <Loader size={18} className="animate-spin" /> : <Award size={18} />}
                                        {loading ? 'Publishing...' : 'Publish Endorsement'}
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
