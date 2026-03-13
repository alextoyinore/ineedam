import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ShieldAlert, KeyRound, Loader } from 'lucide-react';
import { useChatSecurity } from '../context/ChatSecurityContext';

export const ChatPinOverlay = ({ children }) => {
    const { isLocked, hasPinSetup, verifyPin, setupPin, loading } = useChatSecurity();
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState(hasPinSetup ? 'verify' : 'setup-initial');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                zIndex: 50, background: 'var(--bg-base)', backdropFilter: 'blur(12px)',
                overflow: 'hidden'
            }}>
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            borderRadius: '24px', padding: '2.5rem 2rem', width: '100%', maxWidth: '380px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}
                    >
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
