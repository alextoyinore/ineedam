import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import needsData from '../data/needs.json';

export const NeedDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [replyText, setReplyText] = useState('');

    const need = needsData.find(n => n.id === id);

    // Scroll to top on mount (like navigating into a thread)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!need) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h2 className="h2" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Need Not Found</h2>
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '2rem' }}>
                    <ArrowLeft size={18} /> Back
                </button>
            </div>
        );
    }

    // Mock replies for the thread
    const replies = [
        { id: '1', author: 'Sarah J.', content: 'Hi there! I saw your post. I am a full-stack dev with 5 years of React/Node experience. Is the budget firm?', time: '2h ago', isMe: false },
        { id: '2', author: 'Alex T.', content: 'If you write tests, I can bump it entirely up to $5,000.', time: '1h ago', isMe: true }
    ];

    const handleSubmitReply = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        alert(`Reply posted: ${replyText}`);
        setReplyText('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Thread Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)' }} className="glass-panel-hover">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Thread</h2>
            </header>

            {/* Original Post (Unconstrained width) */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <NeedCard need={need} isFullDetail={true} />

                {/* Specific Detail Additions (e.g. Meta Stats) */}
                <div style={{ paddingLeft: '3.25rem', marginTop: '1rem', display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                    <span><strong>124</strong> Views</span>
                    <span><strong>4</strong> Providers Reached Out</span>
                </div>
            </div>

            {/* Reply Input Box */}
            <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', color: 'var(--text-primary)'
                }}>
                    A
                </div>
                <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }} onSubmit={handleSubmitReply}>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Post your reply or proposal..."
                        style={{
                            width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)',
                            fontSize: '1.1rem', outline: 'none', resize: 'vertical', minHeight: '60px'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
                        <button type="submit" disabled={!replyText.trim()} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', opacity: replyText.trim() ? 1 : 0.5 }}>
                            Reply
                        </button>
                    </div>
                </form>
            </div>

            {/* Thread Replies */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {replies.map(reply => (
                    <div
                        key={reply.id}
                        style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid var(--border-glass)',
                            display: 'flex', gap: '1rem', alignItems: 'flex-start',
                        }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                            background: reply.isMe ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-surface)',
                            border: reply.isMe ? 'none' : '1px solid var(--border-glass)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: reply.isMe ? 'white' : 'var(--text-primary)'
                        }}>
                            {reply.author.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{reply.author}</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {reply.time}</span>
                            </div>
                            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                                {reply.content}
                            </p>

                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }} className="nav-link-hover">
                                    <Send size={14} /> Reply
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom spacer mimicking end of thread */}
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                End of thread
            </div>

        </div>
    );
}
