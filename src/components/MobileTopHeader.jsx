import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info, X } from 'lucide-react';
import pkg from '../../package.json';

export const MobileTopHeader = () => {
    const { profile } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const dropdownRef = useRef(null);

    // Animate transformations based on scroll position - hide it smoothly over 80px scroll
    const height = useTransform(scrollY, [0, 80], ['var(--mobile-header-height)', '0px']);
    const opacity = useTransform(scrollY, [0, 40], [1, 0]);
    const translateY = useTransform(scrollY, [0, 80], [0, -20]);
    const pointerEvents = useTransform(scrollY, [0, 40], ['auto', 'none']);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleHelp = () => {
        setShowDropdown(false);
        navigate('/help');
    };

    const handleInfo = () => {
        setShowDropdown(false);
        setShowInfo(true);
    };

    return (
        <>
            <motion.header
                className="sticky-header mobile-only"
                style={{
                    height,
                    opacity,
                    y: translateY,
                    "--sticky-offset": height, // Export height for sub-headers
                    pointerEvents,
                    padding: '0 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 'none',
                    position: 'relative',
                    zIndex: 1100, // Ensure it's above page headers
                    paddingTop: 'env(safe-area-inset-top)',
                    overflow: 'visible'
                }}
            >
                {/* Logo area */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={isDark ? "/logo-dark.svg" : "/logo.svg"} alt="Ineedam Logo" style={{ height: '32px' }} />
                </Link>

                {/* Help/Info area */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <div
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-glass)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        className="nav-link-hover"
                    >
                        <HelpCircle size={20} />
                    </div>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{
                                    position: 'absolute', top: '120%', right: 0,
                                    background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                                    border: '1px solid var(--border-glass)', borderRadius: '12px',
                                    padding: '0.5rem', width: '160px', zIndex: 1200,
                                    boxShadow: 'none'
                                }}
                            >
                                <button
                                    onClick={handleHelp}
                                    style={{
                                        width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                                        cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, borderRadius: '8px',
                                        textAlign: 'left'
                                    }}
                                    className="nav-link-hover"
                                >
                                    <HelpCircle size={18} />
                                    Help
                                </button>
                                <button
                                    onClick={handleInfo}
                                    style={{
                                        width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                                        cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, borderRadius: '8px',
                                        textAlign: 'left'
                                    }}
                                    className="nav-link-hover"
                                >
                                    <Info size={18} />
                                    App Info
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Polymorphic Gradient Border */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(to right, var(--primary), var(--secondary), var(--accent))',
                    opacity: 1
                }} />
            </motion.header>

            {/* App Info Modal */}
            <AnimatePresence>
                {showInfo && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInfo(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{
                                width: '100%', maxWidth: '100%', background: 'var(--bg-surface)',
                                borderTop: '1px solid var(--border-glass)', borderRadius: '24px 24px 0 0',
                                padding: '1.5rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom))', position: 'relative', zIndex: 1, textAlign: 'center'
                            }}
                        >
                            {/* Handle for bottom sheet */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '40px', height: '4px', background: 'var(--border-glass)', borderRadius: '2px' }} />
                            </div>

                            <button
                                onClick={() => setShowInfo(false)}
                                style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                            <div style={{ margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'center' }}>
                                <img src="/icon.svg" alt="Ineedam Icon" style={{ height: '64px' }} />
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>Version {pkg.version} (Alpha)</p>
                            <div style={{ textAlign: 'center', background: 'var(--bg-base)', padding: '1.25rem', borderRadius: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <p style={{ margin: 0 }}>Connecting real needs with real solutions.<br/>Built for clarity, speed, and community trust.</p>
                            </div>
                            <button
                                onClick={() => setShowInfo(false)}
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '1.5rem' }}
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
