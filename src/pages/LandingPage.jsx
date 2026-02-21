import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
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
                <Link to="/" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}>
                    Enter the App
                </Link>
                <button className="btn btn-secondary" style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}>
                    Learn More
                </button>
            </div>
        </div>
    );
};
