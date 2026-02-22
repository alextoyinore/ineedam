import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader, Lock, Globe, MessageSquare } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import { getNeedById, shapeNeed } from '../lib/needsService';
import { fetchRepliesForNeed, createReply, formatTimeAgo } from '../lib/replyService';
import { useAuth } from '../context/AuthContext';
import { ProfileHoverCard } from '../components/ProfileHoverCard';
import { ReplyModal } from '../components/ReplyModal';

const ReplyItem = ({ reply, need, depth = 0, onReply }) => {
    const { user } = useAuth();
    const isMe = user && reply.user_id === user.id;
    const authorName = reply.profiles?.display_name || 'Anonymous';
    const authorUsername = reply.profiles?.username;
    const authorAvatar = reply.profiles?.avatar_url;

    return (
        <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0, borderLeft: depth > 0 ? '2px solid var(--border-glass)' : 'none' }}>
            <div
                style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border-glass)',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                }}
            >
                <ProfileHoverCard userData={{
                    id: reply.user_id,
                    author: authorName,
                    authorUsername: authorUsername,
                    authorAvatar: authorAvatar,
                    authorBio: reply.profiles?.bio
                }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        background: authorAvatar ? `url(${authorAvatar}) center / cover` : (isMe ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-surface)'),
                        border: (isMe || authorAvatar) ? 'none' : '1px solid var(--border-glass)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: isMe ? 'white' : 'var(--text-primary)',
                        overflow: 'hidden', cursor: 'pointer'
                    }}>
                        {!authorAvatar && authorName.charAt(0).toUpperCase()}
                    </div>
                </ProfileHoverCard>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                        <ProfileHoverCard userData={{
                            id: reply.user_id,
                            author: authorName,
                            authorUsername: authorUsername,
                            authorAvatar: authorAvatar,
                            authorBio: reply.profiles?.bio
                        }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>{authorName}</span>
                        </ProfileHoverCard>
                        {authorUsername && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{authorUsername}</span>}
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {formatTimeAgo(reply.created_at)}</span>

                        {reply.is_private && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                                padding: '0.1rem 0.5rem', borderRadius: '12px', marginLeft: 'auto'
                            }}>
                                <Lock size={12} />
                                Private
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {reply.content}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                        <button
                            onClick={() => onReply(reply)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                            className="nav-link-hover"
                        >
                            <MessageSquare size={14} /> Reply
                        </button>
                    </div>
                </div>
            </div>
            {reply.children && reply.children.map(child => (
                <ReplyItem key={child.id} reply={child} need={need} depth={depth + 1} onReply={onReply} />
            ))}
        </div>
    );
};

export const NeedDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const [replyText, setReplyText] = useState('');
    const [isPrivateReply, setIsPrivateReply] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);

    const [need, setNeed] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);

    // For nested replies via modal
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [activeParentReply, setActiveParentReply] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const load = async () => {
            setLoading(true);
            try {
                const needData = await getNeedById(id);
                setNeed(shapeNeed(needData));

                const repliesData = await fetchRepliesForNeed(id);
                setReplies(repliesData || []);
            } catch (err) {
                console.error("Failed to load need or replies:", err);
                setNeed(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const replyTree = useMemo(() => {
        const map = {};
        const roots = [];
        replies.forEach(r => {
            map[r.id] = { ...r, children: [] };
        });
        replies.forEach(r => {
            if (r.parent_id && map[r.parent_id]) {
                map[r.parent_id].children.push(map[r.id]);
            } else {
                roots.push(map[r.id]);
            }
        });
        return roots;
    }, [replies]);

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !user) return;

        setSubmittingReply(true);
        try {
            const newReply = await createReply(need.id, user.id, replyText, isPrivateReply);
            // Re-fetch to get profile joins and proper order since RT might be complex here
            const repliesData = await fetchRepliesForNeed(id);
            setReplies(repliesData || []);
            setReplyText('');
            setIsPrivateReply(false);
        } catch (err) {
            console.error("Failed to post reply", err);
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleOpenReplyToReply = (parentReply) => {
        setActiveParentReply(parentReply);
        setIsReplyModalOpen(true);
    };

    const handleModalClose = () => {
        setIsReplyModalOpen(false);
        setActiveParentReply(null);
        // Refresh replies
        fetchRepliesForNeed(id).then(data => setReplies(data || []));
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}>
                <Loader size={32} className="animate-spin" />
            </div>
        );
    }

    if (!need) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ReplyModal
                isOpen={isReplyModalOpen}
                onClose={handleModalClose}
                need={need}
                parentId={activeParentReply?.id}
                replyingTo={activeParentReply ? {
                    author: activeParentReply.profiles?.display_name,
                    authorUsername: activeParentReply.profiles?.username,
                    authorAvatar: activeParentReply.profiles?.avatar_url,
                    postedAt: formatTimeAgo(activeParentReply.created_at)
                } : null}
            />

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

            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <NeedCard need={need} isFullDetail={true} />
            </div>

            {/* Main Reply Box */}
            <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}>
                <div style={{ flexShrink: 0 }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white', overflow: 'hidden'
                    }}>
                        {!profile?.avatar_url && (profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A')}
                    </div>
                </div>
                <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }} onSubmit={handleSubmitReply}>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Replying to @${need.authorUsername || 'author'}...`}
                        disabled={!user || submittingReply}
                        style={{
                            width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)',
                            fontSize: '1.1rem', outline: 'none', resize: 'vertical', minHeight: '60px'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsPrivateReply(!isPrivateReply)}
                            className="btn btn-secondary"
                            style={{
                                padding: '0.4rem 0.8rem', borderRadius: '9999px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                color: isPrivateReply ? 'var(--primary)' : 'var(--text-muted)',
                                border: isPrivateReply ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                                background: isPrivateReply ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                            }}
                        >
                            {isPrivateReply ? <Lock size={14} /> : <Globe size={14} />}
                            {isPrivateReply ? 'Private Reply' : 'Public Reply'}
                        </button>

                        <button type="submit" disabled={!replyText.trim() || submittingReply || !user} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px' }}>
                            Reply
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {replyTree.map(reply => (
                    <ReplyItem key={reply.id} reply={reply} need={need} onReply={handleOpenReplyToReply} />
                ))}
            </div>

            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                End of thread
            </div>
        </div>
    );
};
