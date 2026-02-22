import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
    const [authModal, setAuthModal] = useState(null); // null | 'signin' | 'signup'
    const { session, loading } = useAuth();
    const navigate = useNavigate();

    // If already signed in, go straight to the app
    if (!loading && session) {
        navigate('/', { replace: true });
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '3rem', marginBottom: '2rem' }}>
                I
            </div>

            <h1 className="h1" style={{ fontSize: '4rem', marginBottom: '1rem', maxWidth: '800px', lineHeight: 1.1 }}>
                Stop Searching. <span className="text-gradient">Start Finding.</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                Post exactly what you need, set your budget and constraints, and let the providers come to you. Connecting real needs with real solutions.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    className="btn btn-primary"
                    style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}
                    onClick={() => setAuthModal('signup')}
                >
                    Sign Up Free
                </button>
                <button
                    className="btn btn-secondary"
                    style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}
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
            </div>

            <AuthModal
                isOpen={!!authModal}
                defaultTab={authModal || 'signin'}
                onClose={() => setAuthModal(null)}
            />
        </div>
    );
};
