import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader } from 'lucide-react';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';
import { createReply } from '../lib/replyService';
import { useNavigate } from 'react-router-dom';

export const ReplyModal = ({ isOpen, onClose, need, parentId = null, replyingTo = null, onReply, endorsementId = null }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [replyText, setReplyText] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [submitting, setSubmitting] = useState(false);

    const targetUser = replyingTo || {
        author: need.author,
        authorUsername: need.authorUsername,
        authorAvatar: need.authorAvatar,
        postedAt: need.postedAt
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setReplyText(''); // reset on open
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !user) return;

        setSubmitting(true);
        try {
            const isPrivate = visibility === 'private';
            const newReply = await createReply(need.id, user.id, replyText, isPrivate, parentId, endorsementId);

            if (onReply) {
                onReply(newReply);
            }
            onClose();
        } catch (err) {
            console.error("Failed to post reply via modal", err);
            alert("Failed to post reply.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                padding: '4rem 1rem', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
            }} onClick={onClose}>
                <motion.div
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="glass-panel"
                    style={{
                        width: '100%', maxWidth: '600px',
                        background: 'var(--bg-surface)', position: 'relative',
                        display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)'
                    }}>
                        <button onClick={onClose} style={{ padding: '0.25rem', borderRadius: '50%', color: 'var(--text-primary)' }} className="glass-panel-hover">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Original Need Context */}
                    <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', position: 'relative' }}>
                        {/* Vertical connection line */}
                        <div style={{ position: 'absolute', left: '2.45rem', top: '3.5rem', bottom: 0, width: '2px', background: 'var(--border-glass)' }} />

                        <div className="avatar-md" style={{
                            borderRadius: '50%', flexShrink: 0,
                            background: targetUser.authorAvatar ? `url(${targetUser.authorAvatar}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                            fontWeight: 'bold', color: 'white', overflow: 'hidden'
                        }}>
                            {!targetUser.authorAvatar && targetUser.author.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{targetUser.author}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>• {targetUser.postedAt || 'just now'}</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
                                Replying to <span style={{ color: 'var(--primary)' }}>@{targetUser.authorUsername || targetUser.author.toLowerCase().replace(/\s/g, '')}</span>
                            </p>
                        </div>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', gap: '1rem' }}>
                        <div className="avatar-md" style={{
                            borderRadius: '50%', flexShrink: 0,
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                            fontWeight: 'bold', color: 'var(--text-primary)', overflow: 'hidden'
                        }}>
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                (user?.user_metadata?.display_name || user?.email || 'A').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <textarea
                                required
                                autoFocus
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Post your reply or proposal..."
                                rows={4}
                                className="need-description"
                                style={{
                                    width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)',
                                    outline: 'none', resize: 'vertical', paddingTop: '0.5rem',
                                    fontFamily: 'inherit'
                                }}
                            />

                            {/* Footer Actions */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)', marginTop: '0.5rem' }}>
                                {/* Visibility Toggle */}
                                <div style={{
                                    display: 'flex',
                                    background: 'var(--bg-base)',
                                    padding: '0.2rem',
                                    borderRadius: '9999px',
                                    border: '1px solid var(--border-glass)'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setVisibility('public')}
                                        style={{
                                            padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem',
                                            background: visibility === 'public' ? 'var(--bg-surface)' : 'transparent',
                                            color: visibility === 'public' ? 'var(--primary)' : 'var(--text-muted)',
                                            fontWeight: visibility === 'public' ? 600 : 400,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Public
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVisibility('private')}
                                        style={{
                                            padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem',
                                            background: visibility === 'private' ? 'var(--bg-surface)' : 'transparent',
                                            color: visibility === 'private' ? 'var(--primary)' : 'var(--text-muted)',
                                            fontWeight: visibility === 'private' ? 600 : 400,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Private
                                    </button>
                                </div>

                                <button type="submit" disabled={!replyText.trim() || submitting || !user} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', opacity: (replyText.trim() && user) ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                                    {visibility === 'private' ? 'Send Private' : 'Reply'}
                                </button>
                            </div>
                        </div>
                    </form>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};
