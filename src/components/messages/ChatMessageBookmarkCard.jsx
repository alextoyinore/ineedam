import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, FileText, Share2 } from 'lucide-react';

export const ChatMessageBookmarkCard = ({ message }) => {
    const [shareCopied, setShareCopied] = React.useState(false);
    const isAudio = message.file_type?.startsWith('audio/') || message.file_url?.toLowerCase().endsWith('.webm') || message.file_url?.toLowerCase().endsWith('.mp3');
    const isImage = message.file_type?.startsWith('image/');

    // Format timestamp
    const date = new Date(message.created_at);
    const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="glass-panel" style={{
            padding: '.75rem',
            borderBottom: '1px solid var(--border-glass)',
            position: 'relative',
            background: 'var(--bg-surface)'
        }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div className="avatar-sm" style={{
                    // borderRadius: '50%',
                    background: message.sender?.avatar_url ? `url(${message.sender.avatar_url}) center/cover` : 'var(--bg-base)',
                    border: '1px solid var(--border-glass)',
                    flexShrink: 0
                }}>
                    {!message.sender?.avatar_url && message.sender?.display_name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {message.sender?.display_name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            @{message.sender?.username}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formattedDate} {formattedTime}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                        <MessageSquare size={12} color="var(--primary)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            Chat Message
                        </span>
                    </div>

                    {/* Message Content - Now part of the same column for alignment */}
                    <div style={{ marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                        {message.text && (
                            <p style={{
                                margin: 0,
                                fontSize: '0.95rem',
                                color: 'var(--text-primary)',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-wrap'
                            }}>
                                {message.text}
                            </p>
                        )}

                        {message.file_url && (
                            <div style={{ marginTop: message.text ? '0.75rem' : 0 }}>
                                {isImage ? (
                                    <img
                                        src={message.file_url}
                                        alt="attachment"
                                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                                    />
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        background: 'var(--bg-base)',
                                        border: '1px solid var(--border-glass)'
                                    }}>
                                        {isAudio ? <FileText size={18} color="var(--primary)" /> : <FileText size={18} color="var(--primary)" />}
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {isAudio ? 'Voice Note' : 'Attachment'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Link
                            to={`/chat/${message.thread_id}`}
                            className="btn btn-glass"
                            style={{
                                fontSize: '0.75rem',
                                padding: '0.4rem 0.5rem 0.4rem 0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--primary)',
                                textDecoration: 'none'
                            }}
                        >
                            View in Conversation
                            <ArrowRight size={14} />
                        </Link>

                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const shareData = {
                                    title: `ChatMessage from ${message.sender?.display_name}`,
                                    text: message.text,
                                    url: window.location.origin + `/chat/${message.thread_id}`
                                };

                                const doCopy = () => {
                                    navigator.clipboard.writeText(shareData.url);
                                    setShareCopied(true);
                                    setTimeout(() => setShareCopied(false), 2500);
                                };

                                if (navigator.share) {
                                    try {
                                        await navigator.share(shareData);
                                    } catch (err) {
                                        if (err.name !== 'AbortError') {
                                            console.error('Share failed', err);
                                            doCopy();
                                        }
                                    }
                                } else {
                                    doCopy();
                                }
                            }}
                            className="nav-link-hover"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                color: shareCopied ? '#22c55e' : 'var(--text-muted)',
                                fontSize: '0.75rem',
                                background: 'transparent',
                                cursor: 'pointer',
                                padding: '0.4rem 0',
                                borderRadius: '8px',
                                transition: 'color 0.2s'
                            }}
                            title={shareCopied ? 'Link Copied!' : 'Share'}
                        >
                            <Share2 size={14} />
                            {shareCopied ? 'Link Copied!' : 'Share'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
