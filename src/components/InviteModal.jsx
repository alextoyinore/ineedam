import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Mail, MessageSquare, Smartphone, Copy, Check, MessageCircle } from 'lucide-react';

export const InviteModal = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    const appUrl = window.location.origin;
    const inviteMessage = `Hey! Check out Ineedam - it's a great place to post what you need and find people who can help. Join me here: ${appUrl}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: '#25D366',
            action: () => window.open(`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`, '_blank')
        },
        {
            name: 'Telegram',
            icon: Send, // Using a generic Send icon if MessageSquare feels too generic
            color: '#0088cc',
            action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(inviteMessage)}`, '_blank')
        },
        {
            name: 'Email',
            icon: Mail,
            color: 'var(--primary)',
            action: () => window.location.href = `mailto:?subject=${encodeURIComponent('Join me on Ineedam')}&body=${encodeURIComponent(inviteMessage)}`
        },
        {
            name: 'SMS',
            icon: Smartphone,
            color: '#ff9500',
            action: () => window.location.href = `sms:?&body=${encodeURIComponent(inviteMessage)}`
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
            }} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        width: '100%', maxWidth: '400px', background: 'var(--bg-surface)',
                        borderRadius: '24px', border: '1px solid var(--border-glass)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Share2 size={24} color="var(--primary)" />
                            Invite Friends
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }} className="nav-link-hover">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem' }}>
                        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                            Share Ineedam with your friends and help grow our community.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            {shareOptions.map(option => (
                                <button
                                    key={option.name}
                                    onClick={option.action}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                                        padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-base)',
                                        border: '1px solid var(--border-glass)', transition: 'all 0.2s', cursor: 'pointer'
                                    }}
                                    className="nav-link-hover"
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: `${option.color}15`, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: option.color
                                    }}>
                                        <option.icon size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{option.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Copy Link Section */}
                        <div style={{
                            background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                            borderRadius: '12px', padding: '0.5rem 0.5rem 0.5rem 1rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem'
                        }}>
                            <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {appUrl}
                            </span>
                            <button
                                onClick={handleCopy}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem', borderRadius: '8px',
                                    background: copied ? '#22c55e' : 'var(--primary)',
                                    color: 'white', border: 'none', cursor: 'pointer',
                                    fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s'
                                }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Help helper for the Telegram Share icon
const Send = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
