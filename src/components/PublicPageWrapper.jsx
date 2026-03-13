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
            <header className="public-header" style={{
                position: 'sticky', top: 0, zIndex: 50,
                padding: '0 2rem',
                height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-glass)',
            }}>
                <Link to={backLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white', fontSize: '0.9rem',
                    }}>I</div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Ineedam</span>
                </Link>

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
                display: 'flex', justifyContent: 'center', gap: '1rem 1.5rem', flexWrap: 'wrap',
                color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center'
            }}>
                <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link-hover">About</Link>
                <Link to="/how-to-use" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link-hover">Use Cases</Link>
                <Link to="/faq" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link-hover">FAQ</Link>
                <Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link-hover">Contact</Link>
                <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link-hover">Privacy</Link>
                <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link-hover">Terms</Link>
            </footer>
        </div>
    );
};
