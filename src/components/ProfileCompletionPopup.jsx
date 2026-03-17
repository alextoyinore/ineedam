import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Sparkles } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { useAuth } from '../context/AuthContext';

export const ProfileCompletionPopup = ({ isOpen, onClose }) => {
    const { profile, fetchProfile } = useAuth();
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                    display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', 
                    justifyContent: 'center', padding: isMobile ? 0 : '1rem'
                }}
            >
                <motion.div
                    initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0, y: 20 }}
                    animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }}
                    exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{
                        background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                        borderRadius: isMobile ? '28px 28px 0 0' : '28px', 
                        width: '100%', maxWidth: isMobile ? 'none' : '440px',
                        padding: isMobile ? '2rem 1.5rem 3rem' : '2.5rem', 
                        position: 'relative', textAlign: 'center',
                        boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    {/* Handle for bottom sheet on mobile */}
                    {isMobile && (
                        <div style={{
                            width: '40px', height: '4px', background: 'var(--border-glass)',
                            borderRadius: '2px', margin: '-1rem auto 1.5rem', opacity: 0.5
                        }} />
                    )}

                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: isMobile ? '1rem' : '1.25rem', right: isMobile ? '1rem' : '1.25rem',
                            padding: '0.5rem', borderRadius: '50%', color: 'var(--text-muted)',
                            background: 'var(--bg-surface)', border: 'none', cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{
                        width: isMobile ? '64px' : '80px', height: isMobile ? '64px' : '80px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem', color: 'white'
                    }}>
                        <Trophy size={isMobile ? 32 : 40} />
                    </div>

                    <h2 className="h2" style={{ marginBottom: '1rem', fontSize: isMobile ? '1.5rem' : '1.75rem' }}>Make it Official!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6, fontSize: isMobile ? '0.95rem' : '1rem' }}>
                        Complete your profile to build trust, gain more followers, and stand out in the community. It only takes a minute!
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            onClick={() => {
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
