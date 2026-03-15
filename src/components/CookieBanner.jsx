import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check } from 'lucide-react';

export const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 480);
        window.addEventListener('resize', handleResize);
        
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', handleResize);
            };
        }
        return () => window.removeEventListener('resize', handleResize);
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
                        bottom: isMobile ? '0' : 'max(1.5rem, env(safe-area-inset-bottom))',
                        left: isMobile ? '0' : '50%',
                        transform: isMobile ? 'none' : 'translateX(-50%)',
                        width: isMobile ? '100%' : 'calc(100% - 2rem)',
                        maxWidth: '500px',
                        zIndex: 9999
                    }}
                >
                    <div style={{
                        padding: isMobile ? '1.5rem 1.25rem 2rem' : '1.5rem',
                        borderRadius: isMobile ? '24px 24px 0 0' : '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-glass)',
                    }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: 'var(--bg-base)',
                                border: '1px solid var(--border-glass)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                flexShrink: 0
                            }}>
                                <Cookie size={28} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        Privacy Preference
                                    </h3>
                                    {isMobile && (
                                        <button 
                                            onClick={() => setIsVisible(false)}
                                            style={{ color: 'var(--text-muted)', padding: '0.25rem', marginRight: '-0.5rem' }}
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    We value your privacy. We use cookies to improve your browsing experience and analyze our traffic.
                                </p>
                            </div>
                            {!isMobile && (
                                <button 
                                    onClick={() => setIsVisible(false)}
                                    style={{ color: 'var(--text-muted)', padding: '0.25rem' }}
                                    className="nav-link-hover"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row', 
                            gap: '0.75rem' 
                        }}>
                            <button
                                onClick={handleAccept}
                                className="auth-cta"
                                style={{ 
                                    flex: 1, 
                                    padding: '0.9rem', 
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    borderRadius: '14px',
                                    margin: 0
                                }}
                            >
                                Accept All
                            </button>
                            <button
                                onClick={handleDecline}
                                className="btn-secondary"
                                style={{ 
                                    flex: 1, 
                                    padding: '0.9rem', 
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    borderRadius: '14px',
                                    background: 'var(--bg-base)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-glass)'
                                }}
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
