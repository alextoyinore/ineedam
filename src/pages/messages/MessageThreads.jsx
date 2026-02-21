import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../context/MessagesContext';

export const MessageThreads = () => {
    const { threads } = useMessages();
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', height: '100%', width: '100%' }}>
            <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <h2 className="h2" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0' }}>Messages</h2>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search messages"
                        style={{
                            width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '9999px',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)', fontSize: '0.9rem'
                        }}
                    />
                </div>
            </header>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {threads.map(thread => (
                    <div
                        key={thread.id}
                        onClick={() => navigate(`/messages/${thread.id}`)}
                        style={{
                            padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center',
                            cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative'
                        }}
                        className="nav-link-hover"
                    >
                        {thread.unread && (
                            <div style={{ position: 'absolute', right: '1.5rem', top: '50%', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                        )}
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white'
                        }}>
                            {thread.withUser.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{thread.withUser}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p style={{
                                margin: 0, fontSize: '0.85rem', color: thread.unread ? 'var(--text-primary)' : 'var(--text-muted)',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                fontWeight: thread.unread ? 600 : 400
                            }}>
                                {thread.lastMessage}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
