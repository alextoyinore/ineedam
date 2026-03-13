import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, ShieldAlert, Loader } from 'lucide-react';
import { useChatSecurity } from '../context/ChatSecurityContext';

export const ChatPinSetupModal = ({ isOpen, onClose }) => {
    const { setupPin } = useChatSecurity();
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState('initial'); // 'initial' or 'confirm'
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setConfirmPin(['', '', '', '']);
            setStep('initial');
            setError('');
        }
    }, [isOpen]);

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
            const nextInput = document.getElementById(`setup-pin-${isConfirm ? 'confirm-' : ''}${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e, isConfirm = false) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            const prevInput = document.getElementById(`setup-pin-${isConfirm ? 'confirm-' : ''}${index - 1}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        const enteredPin = pin.join('');

        if (step === 'initial') {
            if (enteredPin.length !== 4) {
                setError('Please enter a 4-digit PIN');
                setIsSubmitting(false);
                return;
            }
            setStep('confirm');
            setTimeout(() => document.getElementById('setup-pin-confirm-0')?.focus(), 100);
        } else {
            const enteredConfirmPin = confirmPin.join('');
            if (enteredConfirmPin.length !== 4) {
                setError('Please confirm your 4-digit PIN');
                setIsSubmitting(false);
                return;
            }

            if (enteredPin !== enteredConfirmPin) {
                setError('PINs do not match. Please try again.');
                setConfirmPin(['', '', '', '']);
                setTimeout(() => document.getElementById('setup-pin-confirm-0')?.focus(), 100);
                setIsSubmitting(false);
                return;
            }

            const success = await setupPin(enteredPin);
            if (success) {
                onClose();
            } else {
                setError('Failed to setup PIN. Please try again later.');
            }
        }
        setIsSubmitting(false);
    };

    useEffect(() => {
        const currentPin = step === 'confirm' ? confirmPin : pin;
        if (currentPin.join('').length === 4) {
            handleSubmit();
        }
    }, [pin, confirmPin, step]);

    if (!isOpen) return null;

    const displayPin = step === 'confirm' ? confirmPin : pin;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1100,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                        borderRadius: '24px', width: '100%', maxWidth: '380px',
                        padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', padding: '0.25rem', borderRadius: '50%', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                        color: '#10b981'
                    }}>
                        <KeyRound size={32} />
                    </div>

                    <h2 className="h2" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                        {step === 'initial' ? 'Secure Your Chats' : 'Confirm Your PIN'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>
                        {step === 'initial' ? 'Set a 4-digit PIN to keep your conversations private.' : 'Re-enter your 4-digit PIN to confirm.'}
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {displayPin.map((digit, idx) => (
                            <input
                                key={`${step}-${idx}`}
                                id={`setup-pin-${step === 'confirm' ? 'confirm-' : ''}${idx}`}
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handlePinChange(idx, e.target.value, step === 'confirm')}
                                onKeyDown={(e) => handleKeyDown(idx, e, step === 'confirm')}
                                style={{
                                    width: '50px', height: '60px',
                                    background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                    borderRadius: '8px', fontSize: '1.5rem', fontWeight: 700,
                                    textAlign: 'center', color: 'var(--text-primary)', outline: 'none',
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

                    {step === 'confirm' && (
                        <button
                            onClick={() => { setStep('initial'); setConfirmPin(['', '', '', '']); setTimeout(() => document.getElementById('setup-pin-0')?.focus(), 100); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Back to create PIN
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
