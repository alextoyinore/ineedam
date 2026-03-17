import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Mail, Smartphone, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Inline SVG social icons
const WhatsAppIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const TelegramIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const TwitterXIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FacebookIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const LinkedInIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

export const InviteModal = ({ isOpen, onClose }) => {
    const { profile } = useAuth();
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);
    const appUrl = window.location.origin;

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Use username as referral code if available
    const referralCode = profile?.username || '';
    const inviteLink = referralCode ? `${appUrl}?ref=${referralCode}` : appUrl;
    const inviteMessage = `Hey! Check out Ineedam - it's a great place to post what you need and find people who can help. Join me here: ${inviteLink}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNativeShare = async () => {
        const shareData = {
            title: 'Join me on Ineedam',
            text: inviteMessage,
            url: appUrl
        };

        if (navigator.share) {
            try {
                if (navigator.canShare && !navigator.canShare(shareData)) {
                    handleCopy();
                    return;
                }
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed, falling back', err);
                    handleCopy();
                }
            }
        } else {
            handleCopy();
        }
    };

    const shareOptions = [
        {
            name: 'WhatsApp',
            Icon: WhatsAppIcon,
            color: '#25D366',
            action: () => window.open(`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`, '_blank')
        },
        {
            name: 'Telegram',
            Icon: TelegramIcon,
            color: '#0088cc',
            action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(inviteMessage)}`, '_blank')
        },
        {
            name: 'X (Twitter)',
            Icon: TwitterXIcon,
            color: '#000000',
            action: () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(inviteMessage)}`, '_blank')
        },
        {
            name: 'Facebook',
            Icon: FacebookIcon,
            color: '#1877F2',
            action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}&quote=${encodeURIComponent(inviteMessage)}`, '_blank')
        },
        {
            name: 'LinkedIn',
            Icon: LinkedInIcon,
            color: '#0A66C2',
            action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink)}`, '_blank')
        },
        {
            name: 'Email',
            Icon: Mail,
            color: '#15803D',
            action: () => window.location.href = `mailto:?subject=${encodeURIComponent('Join me on Ineedam')}&body=${encodeURIComponent(inviteMessage)}`
        },
        {
            name: 'SMS',
            Icon: Smartphone,
            color: '#ff9500',
            action: () => window.location.href = `sms:?&body=${encodeURIComponent(inviteMessage)}`
        }
    ];

    const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 2000, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
                    padding: isMobile ? '0' : '1rem', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)'
                }} onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, y: isMobile ? '100%' : 20, scale: isMobile ? 1 : 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: isMobile ? '100%' : 20, scale: isMobile ? 1 : 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: isMobile ? '100%' : '440px', background: 'var(--bg-surface)',
                            borderRadius: isMobile ? '24px 24px 0 0' : '24px', 
                            border: isMobile ? 'none' : '1px solid var(--border-glass)',
                            borderTop: isMobile ? '1px solid var(--border-glass)' : undefined,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden',
                            paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 1.5rem)' : '0'
                        }}
                    >
                        {/* Drag indicator for mobile bottom sheet */}
                        {isMobile && (
                            <div style={{ width: '40px', height: '4px', background: 'var(--border-glass)', borderRadius: '2px', margin: '0.75rem auto 0', opacity: 0.5 }} />
                        )}

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
                            <p style={{ margin: '0 0 1.25rem 0', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                Share Ineedam with your friends and help grow our community.
                            </p>

                            {/* Native share button (mobile/supported browsers) */}
                            {canNativeShare && (
                                <button
                                    onClick={handleNativeShare}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '0.6rem', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.25rem',
                                        background: 'var(--primary)', color: 'white', border: 'none',
                                        fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'opacity 0.2s'
                                    }}
                                    className="nav-link-hover"
                                >
                                    <Share2 size={18} />
                                    Share via…
                                </button>
                            )}

                            {/* Social grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                {shareOptions.map(option => (
                                    <button
                                        key={option.name}
                                        onClick={option.action}
                                        title={option.name}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.85rem 0', background: 'none', border: 'none', 
                                            transition: 'transform 0.2s', cursor: 'pointer'
                                        }}
                                        className="scale-hover"
                                    >
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '50%',
                                            background: option.bgColor || 'transparent',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', color: option.color, flexShrink: 0
                                        }}>
                                            <option.Icon width={24} height={24} />
                                        </div>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{option.name}</span>
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
                                    {inviteLink}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.5rem 1rem', borderRadius: '8px',
                                        background: copied ? '#22c55e' : 'var(--primary)',
                                        color: 'white', border: 'none', cursor: 'pointer',
                                        fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', flexShrink: 0
                                    }}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
