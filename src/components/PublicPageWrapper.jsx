import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export const PublicPageWrapper = ({ children }) => {
    const { session } = useAuth();
    const navigate = useNavigate();

    // If logged in, back goes to app root or previous page.
    const backLink = session ? '/' : '/welcome';

    // Allow users to go back in history if possible, otherwise fallback to backLink
    const handleBack = (e) => {
        e.preventDefault();
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate(backLink);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Minimal header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                padding: '0 2rem',
                height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-glass)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a
                        href="#"
                        onClick={handleBack}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: 'var(--text-muted)', textDecoration: 'none',
                            fontSize: '0.9rem', fontWeight: 500,
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <ArrowLeft size={16} />
                        Back
                    </a>

                    <div style={{ width: '1px', height: '20px', background: 'var(--border-glass)' }} />

                    <Link to={backLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', color: 'white', fontSize: '0.9rem',
                        }}>I</div>
                        <span className="text-gradient" style={{ fontWeight: 700, fontSize: '1rem' }}>Ineedam</span>
                    </Link>
                </div>

                <ThemeToggle />
            </header>

            {/* Page content */}
            <main style={{ flex: 1 }}>
                {children}
            </main>

            {/* Minimal footer */}
            <footer style={{
                padding: '1.5rem 2rem',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex', justifyContent: 'center', gap: '1.5rem',
                color: 'var(--text-muted)', fontSize: '0.85rem',
            }}>
                <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About</Link>
                <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</Link>
                <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</Link>
            </footer>
        </div>
    );
};
