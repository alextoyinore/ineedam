import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, ShieldAlert, KeyRound, Loader, X } from 'lucide-react';
import { useChatSecurity } from '../context/ChatSecurityContext';

export const ChatPinOverlay = ({ children }) => {
    const { isLocked, hasPinSetup, verifyPin, setupPin, loading } = useChatSecurity();
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState(hasPinSetup ? 'verify' : 'setup-initial');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync step if hasPinSetup changes loaded from context
    useEffect(() => {
        if (!loading) {
            setStep(hasPinSetup ? 'verify' : 'setup-initial');
            setPin(['', '', '', '']);
            setConfirmPin(['', '', '', '']);
            setError('');
        }
    }, [hasPinSetup, loading]);

    const handlePinChange = (index, value, isConfirm = false) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = isConfirm ? [...confirmPin] : [...pin];
        newPin[index] = value;

        if (isConfirm) {
            setConfirmPin(newPin);
        } else {
            setPin(newPin);
        }

        setError('');

        if (value && index < 3) {
            const nextInput = document.getElementById(`pin-${isConfirm ? 'confirm-' : ''}${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e, isConfirm = false) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            const prevInput = document.getElementById(`pin-${isConfirm ? 'confirm-' : ''}${index - 1}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        const enteredPin = pin.join('');

        if (step === 'verify') {
            if (enteredPin.length !== 4) {
                setError('Please enter a 4-digit PIN');
                setIsSubmitting(false);
                return;
            }

            const success = await verifyPin(enteredPin);
            if (!success) {
                setError('Incorrect PIN. Please try again.');
                setPin(['', '', '', '']);
                document.getElementById('pin-0')?.focus();
            }
        } else if (step === 'setup-initial') {
            if (enteredPin.length !== 4) {
                setError('Please enter a 4-digit PIN');
                setIsSubmitting(false);
                return;
            }
            setStep('setup-confirm');
            document.getElementById('pin-confirm-0')?.focus();
        } else if (step === 'setup-confirm') {
            const enteredConfirmPin = confirmPin.join('');
            if (enteredConfirmPin.length !== 4) {
                setError('Please confirm your 4-digit PIN');
                setIsSubmitting(false);
                return;
            }

            if (enteredPin !== enteredConfirmPin) {
                setError('PINs do not match. Please try again.');
                setConfirmPin(['', '', '', '']);
                document.getElementById('pin-confirm-0')?.focus();
                setIsSubmitting(false);
                return;
            }

            const success = await setupPin(enteredPin);
            if (!success) {
                setError('Failed to setup PIN. Please try again later.');
            }
        }
        setIsSubmitting(false);
    };

    useEffect(() => {
        const currentPin = step === 'setup-confirm' ? confirmPin : pin;
        if (currentPin.join('').length === 4) {
            handleSubmit();
        }
    }, [pin, confirmPin, step]);


    useEffect(() => {
        if (isLocked) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isLocked]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', background: 'var(--bg-base)' }}>
                <Loader size={32} className="animate-spin" color="var(--primary)" />
            </div>
        );
    }

    if (!isLocked) {
        return <>{children}</>;
    }

    const isSetup = step.startsWith('setup');
    const displayPin = step === 'setup-confirm' ? confirmPin : pin;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg-base)' }}>
            {/* Blurry background for the actual messages to feel hidden behind frosted glass */}
            <div style={{ position: 'absolute', inset: 0, filter: 'blur(20px)', opacity: 0.3, pointerEvents: 'none' }}>
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ height: '50px', background: 'var(--border-glass)', borderRadius: '8px' }} />
                    <div style={{ height: '100px', background: 'var(--border-glass)', borderRadius: '8px' }} />
                    <div style={{ height: '80px', width: '70%', background: 'var(--border-glass)', borderRadius: '8px' }} />
                    <div style={{ height: '50px', background: 'var(--border-glass)', borderRadius: '8px' }} />
                </div>
            </div>

            <div 
                className={isMobile ? "bottom-sheet-overlay" : ""}
                style={{
                    position: isMobile ? 'fixed' : 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: isMobile ? 'flex-end' : 'center',
                    alignItems: 'center',
                    zIndex: 1100, 
                    background: isMobile ? 'rgba(0,0,0,0.5)' : 'var(--bg-base)', 
                    backdropFilter: 'blur(12px)',
                    padding: isMobile ? 0 : '1.5rem',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    flex: isMobile ? 'none' : 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: isMobile ? 0 : '1.5rem',
                    width: '100%'
                }}>
                    <motion.div
                        initial={isMobile ? { y: '100%', opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={isMobile ? "bottom-sheet-content" : ""}
                        style={{
                            width: '100%', maxWidth: isMobile ? 'none' : '380px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            background: 'var(--bg-surface)',
                            borderRadius: isMobile ? '24px 24px 0 0' : '16px',
                            padding: isMobile ? '1.5rem 1.5rem 3rem 1.5rem' : '1.5rem',
                            border: isMobile ? 'none' : '1px solid var(--border-glass)',
                            boxShadow: isMobile ? '0 -10px 25px -5px rgba(0,0,0,0.3)' : 'none',
                            position: 'relative'
                        }}
                    >
                        {isMobile && (
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    position: 'absolute',
                                    top: '1.25rem',
                                    right: '1.25rem',
                                    padding: '0.4rem',
                                    borderRadius: '50%',
                                    color: 'var(--text-muted)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    zIndex: 10
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div style={{

                            width: '64px', height: '64px', borderRadius: '50%',
                            background: isSetup ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                            color: isSetup ? '#10b981' : 'var(--primary)'
                        }}>
                            {isSetup ? <KeyRound size={32} /> : <Lock size={32} />}
                        </div>

                        <h2 className="h2" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                            {step === 'verify' ? 'Unlock Chat' : step === 'setup-initial' ? 'Secure Your Chats' : 'Confirm Your PIN'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>
                            {step === 'verify' ? 'Enter your 4-digit PIN to access private chats.' :
                                step === 'setup-initial' ? 'Set a 4-digit PIN to keep your conversations private.' :
                                    'Re-enter your 4-digit PIN to confirm.'}
                        </p>

                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {displayPin.map((digit, idx) => (
                                <input
                                    key={`${step}-${idx}`}
                                    id={`pin-${step === 'setup-confirm' ? 'confirm-' : ''}${idx}`}
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handlePinChange(idx, e.target.value, step === 'setup-confirm')}
                                    onKeyDown={(e) => handleKeyDown(idx, e, step === 'setup-confirm')}
                                    style={{
                                        width: '50px', height: '60px',
                                        background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                        borderRadius: '8px', fontSize: '1.5rem', fontWeight: 700,
                                        textAlign: 'center', color: 'var(--text-primary)', outline: 'none',
                                        boxShadow: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
                                />
                            ))}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444',
                                    fontSize: '0.85rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)',
                                    padding: '0.5rem 1rem', borderRadius: '8px'
                                }}
                            >
                                <ShieldAlert size={16} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {step === 'setup-confirm' && (
                            <button
                                onClick={() => { setStep('setup-initial'); setConfirmPin(['', '', '', '']); document.getElementById('pin-0')?.focus(); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Back to create PIN
                            </button>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
