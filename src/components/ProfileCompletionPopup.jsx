import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Sparkles } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { useAuth } from '../context/AuthContext';

export const ProfileCompletionPopup = ({ isOpen, onClose }) => {
    const { profile, fetchProfile } = useAuth();

    if (!isOpen || !profile) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 3000,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{
                        background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                        borderRadius: '28px', width: '100%', maxWidth: '440px',
                        padding: '2.5rem', position: 'relative', textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '1.25rem', right: '1.25rem',
                            padding: '0.5rem', borderRadius: '50%', color: 'var(--text-muted)',
                            background: 'var(--bg-surface)', border: 'none', cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{
                        width: '80px', height: '80px', borderRadius: '24px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem', color: 'white'
                    }}>
                        <Trophy size={40} />
                    </div>

                    <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>Make it Official!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Complete your profile to build trust, gain more followers, and stand out in the community. It only takes a minute!
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            onClick={() => {
                                // We'll trigger the EditProfileModal by closing this one and returning true or similar
                                // But for simplicity, we can just open EditProfileModal right here if we wrap it.
                                // Actually, let's keep it simple: the parent will switch to EditProfileModal.
                                onClose(true); 
                            }}
                            className="btn btn-primary"
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '14px',
                                fontSize: '1rem', fontWeight: 700, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
                            }}
                        >
                            <Sparkles size={18} /> Complete My Profile
                        </button>
                        <button
                            onClick={() => onClose(false)}
                            style={{
                                width: '100%', padding: '0.8rem', background: 'transparent',
                                border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem',
                                cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            Maybe later
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
