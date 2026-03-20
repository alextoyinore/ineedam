import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Repeat2, Heart, Share2, Bookmark, MoreVertical, Flag, Trash2, Archive, MessageCircle, Lock, ShieldCheck, FileText, Download, ExternalLink, Send } from 'lucide-react';
import { formatTimeAgo } from '../lib/replyService';
import { formatDisplayName, formatUsername } from '../lib/profileService';
import { ProfileHoverCard } from './ProfileHoverCard';
import { useLikes } from '../context/LikesContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useBroadcasts } from '../context/BroadcastsContext';
import { ReplyModal } from './ReplyModal';
import { useAuth } from '../context/AuthContext';
import { MentionText } from './MentionText';
import { getLikeCount } from '../lib/likesService';
import { getReplyCount } from '../lib/replyService';
import { getBroadcastCount } from '../lib/broadcastService';
import { OnlineBadge } from './OnlineBadge';
import { SendNeedToChat } from './SendNeedToChat';

export const ReplyFeedCard = ({ reply, onArchive = null }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [replyCount, setReplyCount] = useState(0);
    const [broadcastCount, setBroadcastCount] = useState(0);
    const [shareCopied, setShareCopied] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSendToChatOpen, setIsSendToChatOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);

    const { isLiked, toggleLike } = useLikes();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { isBroadcasted, toggleBroadcast } = useBroadcasts();

    const liked = isLiked(reply.id, 'reply');
    const bookmarked = isBookmarked(reply.id, 'reply');
    const broadcasted = isBroadcasted(reply.id, 'reply');

    const author = reply.profiles || {};
    const hasNeed = !!reply.needs;
    const isOwner = user && user.id === reply.user_id;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const [likes, replies, broadcasts] = await Promise.all([
                    getLikeCount(null, reply.id),
                    getReplyCount(null, reply.id),
                    getBroadcastCount(reply.id, 'reply')
                ]);
                setLikeCount(likes);
                setReplyCount(replies);
                setBroadcastCount(broadcasts);
            } catch (err) {
                console.error("Error loading counts for reply card:", err);
            }
        };
        loadCounts();
    }, [reply.id]);

    const handleActionClick = async (e, actionFn) => {
        e.stopPropagation();
        if (actionFn === toggleBookmark) {
            await actionFn(reply.id, 'reply');
            return;
        }

        if (actionFn === toggleBroadcast) {
            await actionFn(reply.id, 'reply');
            setBroadcastCount(prev => broadcasted ? prev - 1 : prev + 1);
            return;
        }

        if (actionFn === toggleLike) {
            await actionFn(reply.id, 'reply');
            setLikeCount(prev => liked ? prev - 1 : prev + 1);
        }
    };

    const handleReplyClick = (e) => {
        e.stopPropagation();
        setIsReplyModalOpen(true);
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        const shareData = {
            title: `Reply from ${author.display_name || 'User'}`,
            text: reply.content,
            url: window.location.origin + `/need/${reply.need_id}` // Link to the parent thread
        };

        const fallbackCopy = async () => {
            try {
                await navigator.clipboard.writeText(shareData.url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2500);
            } catch (err) {
                console.error('Clipboard fallback failed', err);
            }
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    await fallbackCopy();
                }
            }
        } else {
            await fallbackCopy();
        }
    };

    const dummyNeedForReply = hasNeed ? {
        id: reply.need_id,
        title: reply.needs.title,
        description: "",
        authorId: author.id,
        authorName: author.display_name,
        authorUsername: author.username,
        authorAvatar: author.avatar_url
    } : null;

    return (
        <div
            onClick={() => navigate(`/need/${reply.need_id}`)}
            className="feed-item-hover"
            style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                position: 'relative',
                cursor: 'pointer',
                padding: '1rem var(--feed-item-padding)',
                borderBottom: '1px solid var(--border-glass)'
            }}>
            
            {dummyNeedForReply && (
                <ReplyModal
                    isOpen={isReplyModalOpen}
                    onClose={() => setIsReplyModalOpen(false)}
                    need={dummyNeedForReply}
                    parentId={reply.id}
                    onReply={() => setReplyCount(prev => prev + 1)}
                />
            )}

            {/* Avatar on the left */}
            <ProfileHoverCard userData={{
                id: author.id,
                author: author.display_name,
                authorUsername: author.username,
                authorAvatar: author.avatar_url,
                authorBio: author.bio,
                authorLastSeenAt: author.last_seen_at,
                kycStatus: author.kyc_status,
                location: author.location
            }}>
                <div
                    onClick={(e) => { e.stopPropagation(); navigate(`/${author.username}`); }}
                    className="avatar-md"
                    style={{
                        borderRadius: '50%', flexShrink: 0,
                        background: author.avatar_url ? `url(${author.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white', overflow: 'hidden',
                        cursor: 'pointer', position: 'relative'
                    }}>
                    {!author.avatar_url && (author.display_name || '?').charAt(0).toUpperCase()}
                    <div style={{ position: 'absolute', bottom: '0', right: '0' }}>
                        <OnlineBadge lastSeenAt={author.last_seen_at} size="12px" />
                    </div>
                </div>
            </ProfileHoverCard>

            {/* Everything else on the right */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <ProfileHoverCard userData={{
                        id: author.id,
                        author: author.display_name,
                        authorUsername: author.username,
                        authorAvatar: author.avatar_url,
                        authorBio: author.bio,
                        authorLastSeenAt: author.last_seen_at,
                        kycStatus: author.kyc_status,
                        location: author.location
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {author.kyc_status === 'verified' && (
                                <ShieldCheck size={14} color="var(--primary)" fill="var(--primary)" fillOpacity={0.1} title="Identity Verified" />
                            )}
                            <span
                                onClick={(e) => { e.stopPropagation(); navigate(`/${author.username}`); }}
                                style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                {formatDisplayName(author.display_name, isMobile)}
                            </span>
                        </div>
                    </ProfileHoverCard>
                    
                    {author.username && (
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{formatUsername(author.username, isMobile)}</span>
                    )}
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {formatTimeAgo(reply.created_at)}</span>

                    <div style={{ position: 'relative', marginLeft: 'auto' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="nav-link-hover"
                            style={{
                                padding: '0.2rem', borderRadius: '50%', color: 'var(--text-muted)',
                                background: 'transparent', transition: 'all 0.2s',
                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'
                            }}
                        >
                            <MoreVertical size={16} />
                        </button>

                    {isMenuOpen && (
                        <>
                            <div
                                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}
                            />
                            <div style={{
                                position: 'absolute', top: '100%', right: 0, width: '180px',
                                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                borderRadius: '12px', padding: '0.4rem', zIndex: 1000,
                                boxShadow: 'none', marginTop: '0.25rem', display: 'flex',
                                flexDirection: 'column', gap: '2px'
                            }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                        navigate(`/need/${reply.need_id}`);
                                    }}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '0.7rem',
                                        borderRadius: '8px', display: 'flex', alignItems: 'center',
                                        gap: '0.75rem', color: 'var(--text-primary)',
                                        fontSize: '0.9rem', fontWeight: 500
                                    }}
                                    className="nav-link-hover"
                                >
                                    <MessageCircle size={18} />
                                    View Thread
                                </button>
                                
                                {onArchive && (isOwner || (user && reply.needs?.user_id === user.id)) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMenuOpen(false);
                                            onArchive(reply.id);
                                        }}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '0.7rem',
                                            borderRadius: '8px', display: 'flex', alignItems: 'center',
                                            gap: '0.75rem', color: '#ef4444',
                                            fontSize: '0.9rem', fontWeight: 500
                                        }}
                                        className="nav-link-hover"
                                    >
                                        <Trash2 size={18} />
                                        Archive Reply
                                    </button>
                                )}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                        setIsSendToChatOpen(true);
                                    }}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '0.7rem',
                                        borderRadius: '8px', display: 'flex', alignItems: 'center',
                                        gap: '0.75rem', color: 'var(--text-primary)',
                                        fontSize: '0.9rem', fontWeight: 500
                                    }}
                                    className="nav-link-hover"
                                >
                                    <Send size={18} />
                                    Send to Chat
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                    }}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '0.7rem',
                                        borderRadius: '8px', display: 'flex', alignItems: 'center',
                                        gap: '0.75rem', color: 'var(--text-primary)',
                                        fontSize: '0.9rem', fontWeight: 500
                                    }}
                                    className="nav-link-hover"
                                >
                                    <Flag size={18} />
                                    Report
                                </button>
                            </div>
                        </>
                    )}
                    </div>
                </div>

                {hasNeed && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', marginTop: '0.1rem' }}>
                        Replying to <span 
                            onClick={(e) => { e.stopPropagation(); navigate(`/need/${reply.need_id}`); }}
                            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                            "{reply.needs.title}"
                        </span>
                    </div>
                )}

                <MentionText text={reply.content} style={{ color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }} />
                
                {reply.file_url && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <a
                            href={reply.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.6rem 1rem', background: 'var(--bg-base)',
                                border: '1px solid var(--border-glass)', borderRadius: '10px',
                                color: 'var(--text-primary)', textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}
                            className="glass-panel-hover"
                        >
                            <FileText size={18} color="var(--primary)" />
                            <span style={{ fontWeight: 500 }}>View Attachment</span>
                            <ExternalLink size={14} style={{ opacity: 0.5 }} />
                        </a>
                    </div>
                )}

                {/* Interaction Bar matching ReplyItem perfectly */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', color: 'var(--text-muted)', alignItems: 'center', width: '100%' }}>
                    <button
                        onClick={handleReplyClick}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
                        className="nav-link-hover"
                    >
                        <MessageSquare size={14} />
                        {replyCount > 0 && <span>{replyCount}</span>}
                    </button>

                    {!reply.is_private && (
                        <button
                            onClick={(e) => handleActionClick(e, toggleBroadcast)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: broadcasted ? 'var(--accent)' : 'inherit', padding: '0.2rem' }}
                            className="nav-link-hover"
                        >
                            <Repeat2 size={14} />
                            {broadcastCount > 0 && <span>{broadcastCount}</span>}
                        </button>
                    )}

                    <button
                        onClick={(e) => handleActionClick(e, toggleLike)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#ef4444' : 'inherit', padding: '0.2rem' }}
                        className="nav-link-hover"
                    >
                        <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                        {likeCount > 0 && <span>{likeCount}</span>}
                    </button>

                    <button
                        onClick={handleShare}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: shareCopied ? '#22c55e' : 'inherit', padding: '0.2rem' }}
                        className="nav-link-hover"
                    >
                        <Share2 size={14} />
                    </button>

                    <button
                        onClick={(e) => handleActionClick(e, toggleBookmark)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: bookmarked ? 'var(--primary)' : 'inherit', padding: '0.2rem' }}
                        className="nav-link-hover"
                    >
                        <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>

            <SendNeedToChat
                isOpen={isSendToChatOpen}
                onClose={() => setIsSendToChatOpen(false)}
                needId={reply.need_id}
                needTitle={reply.needs?.title}
            />
        </div>
    );
};
