import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader, MessageSquare } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal/bottom-sheet that lets a user pick a chat thread to send a need reference to.
 * Used from NeedCard and NeedDetailPage "Send to Chat" actions.
 */
export const SendNeedToChat = ({ needId, needTitle, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { threads, sendMessage } = useChat();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [sending, setSending] = useState(null); // threadId being sent to
    const [sent, setSent] = useState(null); // threadId that was just sent

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return threads;
        return threads.filter(t =>
            t.withUser?.toLowerCase().includes(q) ||
            t.withUserUsername?.toLowerCase().includes(q)
        );
    }, [threads, search]);

    const handleSend = async (thread) => {
        if (sending) return;
        setSending(thread.id);
        try {
            await sendMessage(thread.withUserId, '', null, needId);
            setSent(thread.id);
            setTimeout(() => {
                onClose();
                navigate(`/chat/${thread.id}`);
            }, 800);
        } catch (err) {
            console.error('Failed to send need reference:', err);
        } finally {
            setSending(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 2000,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)'
                        }}
                    />

                    {/* Bottom sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        style={{
                            position: 'fixed', bottom: 0, left: 0, right: 0,
                            zIndex: 2001,
                            background: 'var(--bg-surface)',
                            borderTopLeftRadius: '20px',
                            borderTopRightRadius: '20px',
                            padding: '0',
                            maxHeight: '70vh',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid var(--border-glass)',
                            borderBottom: 'none',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Handle */}
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0' }}>
                            <div style={{ width: '36px', height: '4px', background: 'var(--border-glass)', borderRadius: '2px' }} />
                        </div>

                        {/* Header */}
                        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Send to Chat</h3>
                                {needTitle && (
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        "{needTitle}"
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-base)', borderRadius: '10px', padding: '0.5rem 0.75rem', border: '1px solid var(--border-glass)' }}>
                                <Search size={16} color="var(--text-muted)" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Thread list */}
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {filtered.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No conversations found</p>
                                </div>
                            ) : (
                                filtered.map(thread => {
                                    const isSent = sent === thread.id;
                                    const isSending = sending === thread.id;
                                    return (
                                        <button
                                            key={thread.id}
                                            onClick={() => handleSend(thread)}
                                            disabled={!!sending || !!sent}
                                            style={{
                                                width: '100%', padding: '0.85rem 1.25rem',
                                                display: 'flex', alignItems: 'center', gap: '0.85rem',
                                                background: isSent ? 'rgba(34,197,94,0.08)' : 'none',
                                                border: 'none', borderBottom: '1px solid var(--border-glass)',
                                                cursor: (sending || sent) ? 'default' : 'pointer',
                                                transition: 'background 0.15s', textAlign: 'left'
                                            }}
                                            className="nav-link-hover"
                                        >
                                            {/* Avatar */}
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                                background: thread.withUserAvatar
                                                    ? `url(${thread.withUserAvatar}) center/cover`
                                                    : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, color: 'white', fontSize: '1rem'
                                            }}>
                                                {!thread.withUserAvatar && thread.withUser?.charAt(0)}
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                    {thread.withUser}
                                                </p>
                                                {thread.withUserUsername && (
                                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                        @{thread.withUserUsername}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action button */}
                                            <div style={{
                                                padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                                                background: isSent ? 'var(--primary)' : 'var(--bg-base)',
                                                color: isSent ? 'white' : 'var(--text-primary)',
                                                border: '1px solid var(--border-glass)',
                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                flexShrink: 0
                                            }}>
                                                {isSending ? <Loader size={14} className="animate-spin" /> : isSent ? '✓ Sent' : 'Send'}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
