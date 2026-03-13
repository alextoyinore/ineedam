import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AuthForm = ({ onAuthSuccess, initialTab = 'signin', variant = 'inline' }) => {
    const [tab, setTab] = useState(initialTab);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isUnconfirmed, setIsUnconfirmed] = useState(false);
    const { signIn, signUp, resendVerification, resetPassword } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const reset = () => {
        setEmail('');
        setPassword('');
        setError('');
        setSuccessMsg('');
        setShowPassword(false);
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
                if (onAuthSuccess) onAuthSuccess();
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
                    if (onAuthSuccess) onAuthSuccess();
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
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    const isModal = variant === 'modal';

    return (
        <div style={{
            width: '100%',
            position: 'relative',
        }}>
            {/* Tabs */}
            {tab !== 'forgot' && (
                <div style={{
                    display: 'flex', 
                    borderBottom: '1px solid var(--border-glass)',
                    margin: '0 -2rem 1.5rem -2rem',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px'
                }}>
                    {['signin', 'signup'].map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => { setTab(t); setError(''); setSuccessMsg(''); }}
                            style={{
                                flex: 1, padding: '0.75rem',
                                border: 'none',
                                background: tab === t ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontWeight: tab === t ? 700 : 400,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderTopLeftRadius: t === 'signin' ? '24px' : '0',
                                borderTopRightRadius: t === 'signup' ? '24px' : '0'
                            }}
                        >
                            {t === 'signin' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>
            )}

            <h2 style={{ 
                fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', 
                fontWeight: 900, 
                color: 'var(--text-primary)', 
                marginBottom: '0.4rem',
                letterSpacing: '-0.02em'
            }}>
                {tab === 'signin' ? 'Welcome back' : tab === 'signup' ? 'Create account' : 'Reset password'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
                {tab === 'signin' ? 'Sign in to access your feed' :
                    tab === 'signup' ? 'Join our community of helpers' :
                        'Enter your email to reset password'}
            </p>

            {/* Messages */}
            {successMsg && (
                <div style={{
                    background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '12px', padding: '0.75rem 1rem',
                    color: '#22C55E', fontSize: '0.9rem', marginBottom: '1.25rem',
                }}>
                    {successMsg}
                </div>
            )}

            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px', padding: '0.75rem 1rem',
                    color: '#ef4444', fontSize: '0.9rem', marginBottom: '1.25rem',
                }}>
                    {error}
                    {isUnconfirmed && (
                        <button
                            type="button"
                            onClick={handleResendClick}
                            style={{
                                display: 'block', marginTop: '0.4rem', background: 'none', border: 'none',
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
                <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{
                        position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)', zIndex: 1, opacity: 0.6
                    }} />
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="auth-input"
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
                                cursor: 'pointer', paddingRight: '0.25rem'
                            }}
                            className="nav-link-hover"
                        >
                            Forgot password?
                        </button>
                    </div>
                )}

                {tab !== 'forgot' && (
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{
                            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-muted)', zIndex: 1, opacity: 0.6
                        }} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="auth-input"
                            style={{ paddingRight: '3rem' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                background: 'transparent', border: 'none',
                                color: 'var(--text-muted)', cursor: 'pointer', padding: 0, opacity: 0.6
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-cta"
                >
                    {loading ? (
                        <Loader size={20} className="animate-spin" style={{ margin: '0 auto', color: '#fff' }} />
                    ) : (
                        tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Reset Link'
                    )}
                </button>
            </form>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1.5rem' }}>
                {tab === 'forgot' ? (
                    <button
                        type="button"
                        onClick={() => { setTab('signin'); setError(''); setSuccessMsg(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Back to Sign In
                    </button>
                ) : (
                    <>
                        {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); setSuccessMsg(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            {tab === 'signin' ? 'Sign up' : 'Sign in'}
                        </button>
                    </>
                )}
            </p>
        </div>
    );
};
