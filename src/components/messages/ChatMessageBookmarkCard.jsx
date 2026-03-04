import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, FileText } from 'lucide-react';

export const ChatMessageBookmarkCard = ({ message }) => {
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
                </div>
            </div>

            {/* Message Content */}
            <div style={{ marginLeft: '3.25rem', position: 'relative' }}>
                <div style={{
                    padding: '0.5rem .75rem',
                    borderRadius: '12px',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-glass)',
                    fontSize: '0.92rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    position: 'relative'
                }}>
                    {message.text && <p style={{ margin: 0 }}>{message.text}</p>}

                    {message.file_url && (
                        <div style={{ marginTop: message.text ? '0.5rem' : 0 }}>
                            {isImage ? (
                                <img
                                    src={message.file_url}
                                    alt="attachment"
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    background: 'rgba(99,102,241,0.05)',
                                    border: '1px solid var(--border-glass)'
                                }}>
                                    {isAudio ? <FileText size={18} color="var(--primary)" /> : <FileText size={18} color="var(--primary)" />}
                                    <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {isAudio ? 'Voice Note' : 'Attachment'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Link */}
                <Link
                    to={`/messages/${message.thread_id}`}
                    className="btn btn-glass"
                    style={{
                        fontSize: '0.75rem',
                        padding: '0.4rem 0.75rem',
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
            </div>
        </div>
    );
};
