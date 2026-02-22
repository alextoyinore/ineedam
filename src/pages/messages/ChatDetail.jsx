import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Video, MoreVertical, Send } from 'lucide-react';
import { useMessages } from '../../context/MessagesContext';

export const ChatDetail = () => {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const { threads, sendMessage, markThreadAsRead, loadingThreads } = useMessages();
    const [messageText, setMessageText] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeThread = threads.find(t => String(t.id) === String(threadId));

    useEffect(() => {
        if (activeThread && activeThread.unread) {
            markThreadAsRead(activeThread.id);
        }
    }, [activeThread, markThreadAsRead]);

    if (loadingThreads && !activeThread) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--border-glass)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    if (!activeThread) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Select a message to start chatting
            </div>
        );
    }

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageText.trim()) {
            sendMessage(activeThread.withUserId, messageText);
            setMessageText('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobile ? 20 : 0 }}
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-surface)',
                height: '100%',
                width: '100%',
                maxWidth: '100vw'
            }}
        >
            <header style={{
                padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                zIndex: 30, flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/messages')}
                        style={{
                            background: 'transparent', border: 'none', color: 'var(--text-primary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem',
                            marginLeft: '-0.5rem', borderRadius: '50%'
                        }}
                        className="glass-panel-hover"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="avatar-md" style={{
                        borderRadius: '50%',
                        background: activeThread.withUserAvatar ? `url(${activeThread.withUserAvatar}) center/cover` : 'var(--bg-base)',
                        border: '1px solid var(--border-glass)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600',
                        overflow: 'hidden'
                    }}>
                        {!activeThread.withUserAvatar && activeThread.withUser.charAt(0)}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>{activeThread.withUser}</h3>
                        {activeThread.withUserUsername && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{activeThread.withUserUsername}</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                    <Phone size={20} style={{ cursor: 'pointer' }} />
                    <Video size={20} style={{ cursor: 'pointer' }} />
                    <MoreVertical size={20} style={{ cursor: 'pointer' }} />
                </div>
            </header>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1rem' : '1.5rem',
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '0.4rem',
                WebkitOverflowScrolling: 'touch',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg stroke='%236366f1' stroke-opacity='0.02' fill='none' stroke-width='1.5'%3E%3Cpath d='M40 40h60c8 0 15 7 15 15v40c0 8-7 15-15 15h-20l-15 15v-15h-25c-8 0-15-7-15-15v-40c0-8 7-15 15-15z'/%3E%3Cpath d='M160 160l30-30 15 15-30 30z M195 125l15-15 15 15-15 15z M155 165l5 25-25-5z'/%3E%3Cpath d='M160 40h30c4 0 8 4 8 8v15c0 4-4 8-8 8h-5l-10 10v-10h-15c-4 0-8-4-8-8v-15c0-4 4-8 8-8z'/%3E%3C/g%3E%3C/svg%3E\")"
            }}>
                {[...activeThread.messages].reverse().map(msg => {
                    const isMe = msg.sender === 'Me';
                    return (
                        <div
                            key={msg.id}
                            style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: isMe ? 'row' : 'row-reverse',
                                alignItems: 'flex-end',
                                gap: '0.5rem'
                            }}
                        >
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div style={{
                                padding: '0.6rem 1rem', borderRadius: '18px',
                                borderBottomRightRadius: isMe ? '4px' : '18px',
                                borderBottomLeftRadius: isMe ? '18px' : '4px',
                                background: isMe ? 'var(--primary)' : 'var(--bg-base)',
                                color: isMe ? 'white' : 'var(--text-primary)',
                                fontSize: '0.92rem',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            <footer style={{
                padding: '1rem', borderTop: '1px solid var(--border-glass)',
                background: 'var(--bg-surface)',
                zIndex: 30, flexShrink: 0
            }}>
                <form onSubmit={handleSendMessage} style={{ position: 'relative', display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Start a new message"
                        style={{
                            flex: 1, padding: '0.75rem 1.25rem', borderRadius: '9999px',
                            background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)', outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!messageText.trim()}
                        style={{
                            width: '45px', height: '45px', borderRadius: '50%',
                            background: 'var(--primary)', color: 'white', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: messageText.trim() ? 'pointer' : 'default',
                            opacity: messageText.trim() ? 1 : 0.5, transition: 'all 0.2s'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </footer>
        </motion.div>
    );
};
