import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';

export const MobileTopHeader = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const { scrollY } = useScroll();

    // Animate transformations based on scroll position - hide it smoothly over 80px scroll
    const height = useTransform(scrollY, [0, 80], ['var(--mobile-header-height)', '0px']);
    const opacity = useTransform(scrollY, [0, 40], [1, 0]);
    const translateY = useTransform(scrollY, [0, 80], [0, -20]);
    const pointerEvents = useTransform(scrollY, [0, 40], ['auto', 'none']);

    return (
        <motion.header
            className="sticky-header mobile-only"
            style={{
                height,
                opacity,
                y: translateY,
                pointerEvents,
                padding: '0 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 'none',
                position: 'relative',
                zIndex: 100,
                paddingTop: 'env(safe-area-inset-top)',
                overflow: 'hidden'
            }}
        >
            {/* Logo area */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/icon.svg" alt="Ineedam Icon" style={{ height: '28px' }} />
                <span className="text-gradient" style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.025em' }}>
                    Ineedam
                </span>
            </Link>

            {/* Profile area */}
            <div
                onClick={() => navigate(`/${profile?.username}`)}
                style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.8rem',
                    overflow: 'hidden', cursor: 'pointer'
                }}>
                {!profile?.avatar_url && (profile?.display_name?.charAt(0) || '?')}
            </div>

            {/* Polymorphic Gradient Border */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(to right, var(--primary), var(--secondary), var(--accent))',
                opacity: 0.3
            }} />
        </motion.header>
    );
};
