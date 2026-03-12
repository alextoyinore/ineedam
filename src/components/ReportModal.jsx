import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { reportUser } from '../lib/moderationService';
import { useAuth } from '../context/AuthContext';

export const ReportModal = ({ isOpen, onClose, reportedProfile, onSuccess }) => {
    const { user: currentUser } = useAuth();
    const [reason, setReason] = useState('spam');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isOpen || !reportedProfile || !currentUser) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await reportUser(currentUser.id, reportedProfile.id, reason, notes);
            alert('Report submitted successfully. Our team will review it shortly.');
            setNotes('');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to submit report', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', 
                    alignItems: isMobile ? 'flex-end' : 'center', 
                    justifyContent: 'center', 
                    padding: isMobile ? 0 : '1rem'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                    animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                    exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-surface)', 
                        width: '100%', 
                        maxWidth: isMobile ? '100%' : '400px',
                        borderRadius: isMobile ? '24px 24px 0 0' : '24px', 
                        border: '1px solid var(--border-glass)',
                        overflow: 'hidden', 
                        paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : 0
                    }}
                >
                    {/* Handle for mobile bottom sheet */}
                    {isMobile && (
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.75rem' }}>
                            <div style={{ width: '40px', height: '4px', background: 'var(--border-glass)', borderRadius: '2px' }} />
                        </div>
                    )}

                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                            <AlertTriangle size={20} color="#ef4444" />
                            Report User
                        </h3>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Why are you reporting <strong>{reportedProfile.display_name}</strong>?
                        </p>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Reason</label>
                            <select
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '12px',
                                    background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                    color: 'var(--text-primary)', outline: 'none'
                                }}
                            >
                                <option value="spam">Spam or misleading</option>
                                <option value="harassment">Harassment or bullying</option>
                                <option value="inappropriate">Inappropriate content</option>
                                <option value="scam">Scam or fraud</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Additional Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Provide more context to help us understand..."
                                rows={4}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '12px',
                                    background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                    color: 'var(--text-primary)', outline: 'none', resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary"
                                style={{ flex: 1, padding: '0.75rem' }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: 'white' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
