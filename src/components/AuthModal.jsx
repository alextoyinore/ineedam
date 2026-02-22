import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, defaultTab = 'signin' }) => {
    const [tab, setTab] = useState(defaultTab);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isUnconfirmed, setIsUnconfirmed] = useState(false);
    const { signIn, signUp, resendVerification, resetPassword } = useAuth();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const reset = () => {
        setEmail('');
        setPassword('');
        setError('');
        setSuccessMsg('');
        setShowPassword(false);
    };

    const switchTab = (t) => {
        reset();
        setTab(t);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        if (tab === 'signin') {
            const { error } = await signIn(email, password);
            setLoading(false);
            if (error) {
                setError(error.message);
                if (error.message.toLowerCase().includes('email not confirmed')) {
                    setIsUnconfirmed(true);
                }
            } else {
                onClose();
                navigate('/');
            }
        } else {
            const { data, error } = await signUp(email, password);
            setLoading(false);
            if (error) {
                setError(error.message);
            } else if (data?.user?.identities?.length === 0) {
                setError('An account with this email already exists. Please sign in.');
            } else {
                if (data?.session) {
                    onClose();
                    navigate('/');
                } else {
                    setSuccessMsg('Account created! Check your email to confirm your account, then sign in.');
                    setTab('signin');
                }
            }
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        const { error } = await resetPassword(email);
        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            setSuccessMsg('Password reset link sent! Please check your email.');
        }
    };

    const handleResendClick = async () => {
        setError('');
        setSuccessMsg('');
        setLoading(true);
        const { error } = await resendVerification(email);
        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setSuccessMsg('Verification email resent! Please check your inbox.');
            setIsUnconfirmed(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 2.75rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
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
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '420px',
                    position: 'relative',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1.25rem', right: '1.25rem',
                        background: 'transparent', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer',
                        padding: '0.25rem', borderRadius: '50%',
                    }}
                >
                    <X size={20} />
                </button>

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white', fontSize: '1.2rem',
                    }}>I</div>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Ineedam</span>
                </div>

                {/* Tabs */}
                {tab !== 'forgot' && (
                    <div style={{
                        display: 'flex', background: 'var(--bg-surface)',
                        borderRadius: '12px', padding: '4px', marginBottom: '1.5rem',
                    }}>
                        {['signin', 'signup'].map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError(''); setSuccessMsg(''); }}
                                style={{
                                    flex: 1, padding: '0.5rem',
                                    borderRadius: '9px', border: 'none',
                                    background: tab === t ? 'var(--bg-surface)' : 'transparent',
                                    color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontWeight: tab === t ? 700 : 400,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                                }}
                            >
                                {t === 'signin' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>
                )}

                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {tab === 'signin' ? 'Welcome back' : tab === 'signup' ? 'Create your account' : 'Reset password'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    {tab === 'signin' ? 'Sign in to access your feed' :
                        tab === 'signup' ? 'Start posting and finding what you need' :
                            'Enter your email to receive a password reset link'}
                </p>

                {/* Success message */}
                {successMsg && (
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '10px', padding: '0.75rem 1rem',
                        color: '#22c55e', fontSize: '0.875rem', marginBottom: '1rem',
                    }}>
                        {successMsg}
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '10px', padding: '0.75rem 1rem',
                        color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem',
                    }}>
                        {error}
                        {isUnconfirmed && (
                            <button
                                type="button"
                                onClick={handleResendClick}
                                style={{
                                    display: 'block', marginTop: '0.5rem', background: 'none', border: 'none',
                                    color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                                    padding: 0
                                }}
                            >
                                Resend verification email
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={tab === 'forgot' ? handlePasswordReset : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Email */}
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{
                            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-muted)', pointerEvents: 'none',
                        }} />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {tab === 'signin' && (
                        <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => { setTab('forgot'); setError(''); setSuccessMsg(''); }}
                                style={{
                                    background: 'none', border: 'none',
                                    color: 'var(--text-muted)', fontSize: '0.85rem',
                                    cursor: 'pointer', padding: 0
                                }}
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {tab !== 'forgot' && (
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{
                                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--text-muted)', pointerEvents: 'none',
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ ...inputStyle, paddingRight: '3rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'transparent', border: 'none',
                                    color: 'var(--text-muted)', cursor: 'pointer', padding: 0,
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {loading && <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                        {loading ? 'Please wait...' : (tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Reset Link')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.25rem' }}>
                    {tab === 'forgot' ? (
                        <button
                            onClick={() => { setTab('signin'); setError(''); setSuccessMsg(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            Back to Sign In
                        </button>
                    ) : (
                        <>
                            {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); setSuccessMsg(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                                {tab === 'signin' ? 'Sign up' : 'Sign in'}
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};
