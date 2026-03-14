import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check } from 'lucide-react';

export const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    style={{
                        position: 'fixed',
                        bottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'calc(100% - 2rem)',
                        maxWidth: '500px',
                        zIndex: 9999,
                        pointerEvents: 'none'
                    }}
                >
                    <div className="glass-panel" style={{
                        padding: '1.25rem',
                        borderRadius: '20px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        pointerEvents: 'auto',
                        background: 'var(--bg-surface-glass)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border-glass)',
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                flexShrink: 0
                            }}>
                                <Cookie size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    Cookie Consent
                                </h3>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    We use cookies to enhance your helper experience, analyze traffic, and ensure the platform stays premium. 
                                    By accepting, you agree to our use of essential and analytical cookies.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsVisible(false)}
                                style={{ color: 'var(--text-muted)', padding: '0.25rem' }}
                                className="nav-link-hover"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleAccept}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '0.65rem', fontSize: '0.9rem' }}
                            >
                                <Check size={18} />
                                Accept All
                            </button>
                            <button
                                onClick={handleDecline}
                                className="btn btn-secondary"
                                style={{ flex: 1, padding: '0.65rem', fontSize: '0.9rem' }}
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
