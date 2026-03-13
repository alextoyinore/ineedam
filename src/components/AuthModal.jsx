import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AuthForm } from './AuthForm';

export const AuthModal = ({ isOpen, onClose, defaultTab = 'signin' }) => {
    const { isDark } = useTheme();

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    width: '100%',
                    maxWidth: '440px',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1.25rem', right: '1.25rem',
                        background: 'rgba(255, 255, 255, 0.05)', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer',
                        padding: '0.5rem', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    className="nav-link-hover"
                >
                    <X size={20} />
                </button>

                {/* Logo */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <img src={isDark ? "/logo-dark.svg" : "/logo.svg"} alt="Ineedam Logo" style={{ height: '42px' }} />
                </div>

                <AuthForm 
                    initialTab={defaultTab} 
                    onAuthSuccess={onClose} 
                    variant="modal"
                />
            </div>
        </div>
    );
};
