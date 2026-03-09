import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export const LandingPage = () => {
    const [authModal, setAuthModal] = useState(null); // null | 'signin' | 'signup'
    const { session, loading } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    // If already signed in, go straight to the app
    if (!loading && session) {
        navigate('/', { replace: true });
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            {/* Full Brand Logo */}
            <div style={{ marginBottom: '2.5rem' }}>
                <img src={settings.theme === 'dark' ? "/logo-dark.svg" : "/logo.svg"} alt="Ineedam" style={{ height: 'clamp(44px, 11vw, 64px)' }} />
            </div>

            <h1 className="h1" style={{ fontSize: 'clamp(2.2rem, 8vw, 4rem)', marginBottom: '1rem', maxWidth: '800px', lineHeight: 1.1 }}>
                Stop Searching. <span className="text-gradient">Start Finding.</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1.05rem, 4vw, 1.25rem)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.5 }}>
                Post exactly what you need, set your budget and constraints, and let the providers come to you. Connecting real needs with real solutions.
            </p>

            <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '500px' }}>
                <button
                    className="btn btn-primary"
                    style={{ fontSize: 'clamp(1rem, 4vw, 1.2rem)', padding: 'clamp(0.8rem, 3vw, 1rem) clamp(1.5rem, 5vw, 2.5rem)', flex: '1 1 auto' }}
                    onClick={() => setAuthModal('signup')}
                >
                    Sign Up Free
                </button>
                <button
                    className="btn btn-secondary"
                    style={{ fontSize: 'clamp(1rem, 4vw, 1.2rem)', padding: 'clamp(0.8rem, 3vw, 1rem) clamp(1.5rem, 5vw, 2.5rem)', flex: '1 1 auto' }}
                    onClick={() => setAuthModal('signin')}
                >
                    Sign In
                </button>
            </div>

            {/* Footer links */}
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <a href="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About</a>
                <a href="/how-to-use" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>How to Use</a>
                <a href="/faq" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>FAQ</a>
                <a href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
                <a href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
                <a href="/rules" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Rules</a>
            </div>

            <AuthModal
                isOpen={!!authModal}
                defaultTab={authModal || 'signin'}
                onClose={() => setAuthModal(null)}
            />
        </div>
    );
};
