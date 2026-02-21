import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Video, MoreVertical, Send } from 'lucide-react';
import { useMessages } from '../../context/MessagesContext';

export const ChatDetail = () => {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const { threads, sendMessage, markThreadAsRead } = useMessages();
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
            sendMessage(activeThread.id, messageText);
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
                padding: isMobile ? '0.5rem 1rem' : '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                position: isMobile ? 'sticky' : 'static', top: isMobile ? 'var(--mobile-header-height)' : 0, zIndex: 30
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
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600'
                    }}>
                        {activeThread.withUser.charAt(0)}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>{activeThread.withUser}</h3>
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>● Online</span>
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
                flexDirection: 'column',
                gap: '1rem',
                WebkitOverflowScrolling: 'touch'
            }}>
                {activeThread.messages.map(msg => (
                    <div
                        key={msg.id}
                        style={{
                            alignSelf: msg.sender === 'Me' ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            display: 'flex', flexDirection: 'column',
                            alignItems: msg.sender === 'Me' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div style={{
                            padding: '0.75rem 1rem', borderRadius: '18px',
                            borderBottomRightRadius: msg.sender === 'Me' ? '4px' : '18px',
                            borderBottomLeftRadius: msg.sender === 'Me' ? '18px' : '4px',
                            background: msg.sender === 'Me' ? 'var(--primary)' : 'var(--bg-base)',
                            color: msg.sender === 'Me' ? 'white' : 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}>
                            {msg.text}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', padding: '0 0.5rem' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>

            <footer style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-surface)' }}>
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
