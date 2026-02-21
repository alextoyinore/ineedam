import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Search } from 'lucide-react';

export const RightSidebar = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery(''); // Optional: Clear input after search
        }
    };
    return (
        <aside className="social-sidebar-right">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', padding: '1.5rem 0' }}>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search Needam..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{
                            width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '9999px',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s'
                        }}
                    />
                </div>

                {/* Theme Toggle */}
                <div style={{ padding: '0 0.5rem' }}>
                    <h3 className="h3" style={{ fontSize: '1.1rem', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>Appearance</h3>
                    <ThemeToggle />
                </div>

                {/* Trending Widget Dummy */}
                <div style={{
                    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px'
                }}>
                    <h3 className="h3" style={{ fontSize: '1.1rem' }}>What's happening</h3>

                    <div
                        onClick={() => navigate('/search?trend=React%20Native')}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', cursor: 'pointer' }}
                        className="nav-link-hover"
                    >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trending in Development</span>
                        <p style={{ fontWeight: 600, margin: 0 }}>React Native Experts</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1,204 needs posted</span>
                    </div>

                    <div
                        onClick={() => navigate('/search?trend=Plumbers')}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', cursor: 'pointer' }}
                        className="nav-link-hover"
                    >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trending in Services</span>
                        <p style={{ fontWeight: 600, margin: 0 }}>Local Plumbers</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>849 needs posted</span>
                    </div>
                </div>

                {/* Categories Widget Dummy */}
                <div style={{
                    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px'
                }}>
                    <h3 className="h3" style={{ fontSize: '1.1rem' }}>Categories</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {['Product', 'Service', 'Housing', 'Software & Tech'].map(cat => (
                            <span
                                key={cat}
                                onClick={() => navigate(`/search?cat=${encodeURIComponent(cat)}`)}
                                style={{
                                    padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.85rem',
                                    background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                    cursor: 'pointer'
                                }} className="glass-panel-hover">
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer Links */}
                <div style={{ padding: '0 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem' }}>
                    <a href="/about" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link-hover">About</a>
                    <a href="/privacy" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link-hover">Privacy Policy</a>
                    <a href="/terms" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link-hover">Terms of Service</a>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 Ineedam</span>
                </div>

            </div>
        </aside>
    );
};
