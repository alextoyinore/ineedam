import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Helmet } from 'react-helmet-async';
import { AuthForm } from '../components/AuthForm';
import { Sun, Moon } from 'lucide-react';

export const LandingPage = () => {
    const { session, loading } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isMobileAuthOpen, setIsMobileAuthOpen] = React.useState(false);
    const [authTab, setAuthTab] = React.useState('signup');

    // If already signed in, go straight to the app
    if (!loading && session) {
        navigate('/', { replace: true });
        return null;
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
            overflowX: 'hidden',
            padding: '2rem',
            position: 'relative',
            transition: 'background-color 0.3s ease'
        }} className="landing-container">
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem',
                    zIndex: 10,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s'
                }}
                className="nav-link-hover"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Background Layers */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0
            }} className="landing-grid-pattern" />

            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                background: isDark
                    ? 'radial-gradient(circle at 15% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(34, 197, 94, 0.05) 0%, transparent 40%)'
                    : 'radial-gradient(circle at 15% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(34, 197, 94, 0.03) 0%, transparent 40%)'
            }} />

            <Helmet>
                <title>Ineedam - Connect Needs with Solutions</title>
                <meta name="description" content="Post exactly what you need, set your budget and constraints, and let the providers come to you. Connecting real needs with real solutions." />
            </Helmet>

            <div style={{
                width: '100%',
                maxWidth: '1100px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4rem',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1
            }} className="landing-content">
                {/* Left Column: Branding & Messaging */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }} className="landing-left">
                    <div style={{ marginBottom: '2.5rem' }} className="landing-logo">
                        <img src={isDark ? "/logo-dark.svg" : "/logo.svg"} alt="Ineedam" style={{ height: '42px' }} />
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        marginBottom: '1.25rem',
                        letterSpacing: '-0.02em',
                        color: 'var(--text-primary)'
                    }}>
                        Stop Searching, <br />
                        <span className="text-gradient">Start Finding.</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                        color: 'var(--text-secondary)',
                        maxWidth: '480px',
                        lineHeight: 1.6,
                        marginBottom: '3rem'
                    }}>
                        Post exactly what you need, set budget and constraints, and let the providers come to you.
                    </p>

                    {/* Mobile CTA Buttons */}
                    <div className="mobile-only mobile-ctas" style={{ display: 'none', flexDirection: 'column', gap: '1rem', width: '100%', marginBottom: '3rem' }}>
                        <button
                            className="auth-cta"
                            onClick={() => { setAuthTab('signup'); setIsMobileAuthOpen(true); }}
                        >
                            Get Started
                        </button>
                        <button
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-glass)',
                                color: 'var(--text-primary)',
                                padding: '0.85rem',
                                borderRadius: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            onClick={() => { setAuthTab('signin'); setIsMobileAuthOpen(true); }}
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Footer links */}
                    <div style={{
                        display: 'flex',
                        gap: '1.25rem',
                        flexWrap: 'wrap',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem'
                    }} className="landing-footer">
                        <a href="/about" style={{ color: 'inherit', textDecoration: 'none' }} className="nav-link-hover">About</a>
                        <a href="/how-to-use" style={{ color: 'inherit', textDecoration: 'none' }} className="nav-link-hover">Use Cases</a>
                        <a href="/faq" style={{ color: 'inherit', textDecoration: 'none' }} className="nav-link-hover">FAQ</a>
                        <a href="/contact" style={{ color: 'inherit', textDecoration: 'none' }} className="nav-link-hover">Contact</a>
                        <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }} className="nav-link-hover">Privacy</a>
                        <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }} className="nav-link-hover">Terms</a>
                    </div>
                </div>

                {/* Right Column: Auth Form (Desktop Only) */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center'
                }} className="landing-right desktop-only">
                    <div style={{
                        width: '100%',
                        maxWidth: '400px',
                        background: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                        padding: '0 2rem 2rem 2rem',
                        borderRadius: '24px',
                        border: '1px solid var(--border-glass)',
                        position: 'relative',
                        zIndex: 2,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                    }}>
                        <AuthForm variant="inline" />
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Sheet Auth */}
            {isMobileAuthOpen && (
                <div
                    className="bottom-sheet-overlay"
                    onClick={() => setIsMobileAuthOpen(false)}
                >
                    <div
                        className="bottom-sheet-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AuthForm variant="inline" initialTab={authTab} onAuthSuccess={() => setIsMobileAuthOpen(false)} />
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 968px) {
                    .landing-content {
                        flex-direction: column !important;
                        gap: 2rem !important;
                        text-align: center;
                        padding-top: 4rem;
                    }
                    .landing-left {
                        align-items: center;
                    }
                    .landing-left p {
                        margin-bottom: 2rem !important;
                    }
                    .landing-footer {
                        justify-content: center;
                    }
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-only {
                        display: flex !important;
                    }
                    .landing-logo {
                        margin-bottom: 1.5rem !important;
                    }
                }
            `}} />
        </div>
    );
};
