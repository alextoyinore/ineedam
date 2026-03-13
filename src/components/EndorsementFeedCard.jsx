import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, Heart, Repeat2, Bookmark, MessageSquare, MessageCircle, Share2, MoreVertical, Flag, Ban, Archive, Trash2, Edit3, VolumeX } from 'lucide-react';
import { formatTimeAgo } from './../lib/replyService';
import { formatDisplayName, formatUsername } from '../lib/profileService';
import { ProfileHoverCard } from './ProfileHoverCard';
import { useLikes } from '../context/LikesContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useBroadcasts } from '../context/BroadcastsContext';
import { ReplyModal } from './ReplyModal';
import { getLikeCount } from '../lib/likesService';
import { getReplyCount } from '../lib/replyService';
import { getBroadcastCount } from '../lib/broadcastService';

export const EndorsementFeedCard = ({ endorsement, broadcastedBy = null }) => {
    const navigate = useNavigate();
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

    // The person who received the endorsement (e.g. they met the need)
    const endorsedUser = endorsement.endorsed;

    // The person who wrote the endorsement (the original need author)
    const endorser = endorsement.endorser;

    const need = endorsement.needs;
    const hasNeed = !!need;

    const { isLiked, toggleLike } = useLikes();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { isBroadcasted, toggleBroadcast } = useBroadcasts();

    const isBroadcast = broadcastedBy || endorsement.type === 'broadcast_endorsement';
    const targetId = isBroadcast ? (endorsement.broadcast_id || endorsement.id) : endorsement.id;
    const targetType = isBroadcast ? 'broadcast' : 'endorsement';

    const liked = hasNeed ? isLiked(need.id) : false;
    const bookmarked = isBookmarked(targetId, targetType);
    const broadcasted = isBroadcasted(endorsement.id, 'endorsement');

    const [likeCount, setLikeCount] = useState(0);
    const [replyCount, setReplyCount] = useState(0);
    const [broadcastCount, setBroadcastCount] = useState(0);
    const [shareCopied, setShareCopied] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const [likes, replies, broadcasts] = await Promise.all([
                    hasNeed ? getLikeCount(need.id) : 0,
                    hasNeed ? getReplyCount(need.id) : 0,
                    getBroadcastCount(endorsement.id, 'endorsement')
                ]);
                setLikeCount(likes);
                setReplyCount(replies);
                setBroadcastCount(broadcasts);
            } catch (err) {
                console.error("Error loading counts for endorsement card:", err);
            }
        };
        loadCounts();
    }, [need?.id, endorsement.id, hasNeed]);

    const handleActionClick = async (e, actionFn) => {
        e.stopPropagation();
        if (actionFn === toggleBookmark) {
            await actionFn(targetId, targetType);
            return;
        }

        if (actionFn === toggleBroadcast) {
            await actionFn(endorsement.id, 'endorsement');
            setBroadcastCount(prev => broadcasted ? prev - 1 : prev + 1);
            return;
        }

        if (hasNeed) {
            await actionFn(need.id);
            // Optimistic count updates
            if (actionFn === toggleLike) {
                setLikeCount(prev => liked ? prev - 1 : prev + 1);
            }
        }
    };

    const handleReplyClick = (e) => {
        e.stopPropagation();
        if (hasNeed) setIsReplyModalOpen(true);
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        const shareData = {
            title: `Endorsement for ${endorsedUser?.display_name || 'User'}`,
            text: endorsement.message,
            url: window.location.origin + `/endorsement/${endorsement.id}`
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
                if (navigator.canShare && !navigator.canShare(shareData)) {
                    await fallbackCopy();
                    return;
                }
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Native share failed, falling back', err);
                    await fallbackCopy();
                }
            }
        } else {
            await fallbackCopy();
        }
    };

    const handleThreadClick = (e) => {
        e.stopPropagation();
        if (hasNeed) navigate(`/need/${need.id}`);
    };

    const dummyNeed = hasNeed ? {
        id: need.id,
        title: need.title,
        description: need.description,
        authorId: endorser?.id,
        authorName: endorser?.display_name,
        authorUsername: endorser?.username,
        authorAvatar: endorser?.avatar_url
    } : null;

    return (
        <div
            onClick={() => navigate(`/endorsement/${endorsement.id}`)}
            className="feed-item-hover"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                cursor: 'pointer',
                padding: 'var(--feed-item-padding)',
                borderBottom: '1px solid var(--border-glass)'
            }}>
            {/* Broadcast Header */}
            {broadcastedBy && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.1rem'
                }}>
                    <Repeat2 size={16} />
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${broadcastedBy.username}`);
                        }}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {formatDisplayName(broadcastedBy.display_name, isMobile)} broadcasted
                    </span>
                </div>
            )}
            {dummyNeed && (
                <ReplyModal
                    isOpen={isReplyModalOpen}
                    onClose={() => setIsReplyModalOpen(false)}
                    need={dummyNeed}
                    onReply={() => setReplyCount(prev => prev + 1)}
                />
            )}

            {!endorsedUser ? (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Endorsement data unavailable
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <Award size={16} />
                        <span>Endorsement Received</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        {/* The Endorsed User Details (Main Focus) */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0 }}>
                            <ProfileHoverCard userData={{
                                id: endorsedUser.id,
                                author: endorsedUser.display_name,
                                authorUsername: endorsedUser.username,
                                authorAvatar: endorsedUser.avatar_url,
                                authorBio: endorsedUser.bio
                            }}>
                                <div
                                    onClick={(e) => { e.stopPropagation(); navigate(`/${endorsedUser.username}`); }}
                                    className="avatar-md"
                                    style={{
                                        borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', color: 'white', overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}>
                                    {endorsedUser.avatar_url ? (
                                        <img src={endorsedUser.avatar_url} alt={endorsedUser.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (endorsedUser.display_name || '?').charAt(0).toUpperCase()
                                    )}
                                </div>
                            </ProfileHoverCard>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <ProfileHoverCard userData={{
                                        id: endorsedUser.id,
                                        author: endorsedUser.display_name,
                                        authorUsername: endorsedUser.username,
                                        authorAvatar: endorsedUser.avatar_url,
                                        authorBio: endorsedUser.bio
                                    }}>
                                        <span
                                            onClick={(e) => { e.stopPropagation(); navigate(`/${endorsedUser.username}`); }}
                                            style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                            {formatDisplayName(endorsedUser.display_name, isMobile)}
                                        </span>
                                    </ProfileHoverCard>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {endorsedUser.username && (
                                            <span>@{formatUsername(endorsedUser.username, isMobile)}</span>
                                        )}
                                        <span>• {formatTimeAgo(endorsement.created_at)}</span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span>Verified Match Helper</span>
                                </div>
                            </div>
                        </div>

                        {/* Menu Actions */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                                className="nav-link-hover"
                                style={{
                                    padding: '0.4rem', borderRadius: '50%', color: 'var(--text-muted)',
                                    background: 'transparent', transition: 'all 0.2s',
                                    marginRight: '-0.5rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <MoreVertical size={20} />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        width: '180px',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '12px',
                                        padding: '0.4rem',
                                        zIndex: 1000,
                                        boxShadow: 'none',
                                        marginTop: '0.25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px'
                                    }}>
                                        {/* View Thread Action */}
                                        {hasNeed && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsMenuOpen(false);
                                                    navigate(`/need/${need.id}`);
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
                                        )}

                                        {/* Share Action */}
                                        <button
                                            onClick={handleShare}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '0.7rem',
                                                borderRadius: '8px', display: 'flex', alignItems: 'center',
                                                gap: '0.75rem', color: shareCopied ? '#22c55e' : 'var(--text-primary)',
                                                fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s'
                                            }}
                                            className="nav-link-hover"
                                        >
                                            <Share2 size={18} />
                                            {shareCopied ? 'Link Copied!' : 'Share Endorsement'}
                                        </button>

                                        {/* report action */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMenuOpen(false);
                                                // Report logic would go here
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
                                            Report Endorsement
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Endorsement Message Content */}
            <div className="need-content-wrapper" style={{}}>
                <div style={{
                    padding: '1.25rem',
                    background: 'var(--bg-base)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-glass)',
                    position: 'relative'
                }}>
                    <p className="need-description" style={{
                        color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 1rem 0',
                        fontSize: '1.05rem', fontStyle: 'italic', position: 'relative', zIndex: 1
                    }}>
                        "{endorsement.message}"
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                            background: endorser.avatar_url ? `url(${endorser.avatar_url}) center/cover` : 'var(--bg-surface)',
                            border: '1px solid var(--border-glass)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.7rem'
                        }}>
                            {!endorser.avatar_url && endorser.display_name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Written by <strong onClick={(e) => { e.stopPropagation(); navigate(`/${endorser?.username || ''}`); }} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>{endorser?.display_name || 'Anonymous'}</strong> for helping with {hasNeed ? (<strong onClick={(e) => { e.stopPropagation(); navigate(`/need/${endorsement.need_id}`); }} style={{ color: 'var(--primary)', cursor: 'pointer' }}>{endorsement.needs?.title}</strong>) : (<span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>a need no longer available</span>)}
                        </span>
                    </div>
                    {/* Decorative quote mark */}
                    <div style={{
                        position: 'absolute', top: '0.25rem', left: '0.5rem',
                        fontSize: '4rem', color: 'var(--primary)', opacity: 0.1,
                        fontFamily: 'serif', lineHeight: 1, zIndex: 0, pointerEvents: 'none'
                    }}>
                        "
                    </div>
                </div>

                {/* Interaction Bar (Matches NeedCard layout exactly) */}
                {hasNeed && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button onClick={handleReplyClick} className="nav-link-hover" style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '-0.5rem',
                                cursor: 'pointer', border: 'none'
                            }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <MessageSquare size={16} />
                                {replyCount > 0 && (
                                    <span>{replyCount}</span>
                                )}
                            </button>

                            <button onClick={handleThreadClick} className="nav-link-hover" style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                cursor: 'pointer', border: 'none'
                            }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <MessageCircle size={16} />
                            </button>

                            {/* Broadcast Button */}
                            <button onClick={(e) => handleActionClick(e, toggleBroadcast)} className="nav-link-hover" style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                color: broadcasted ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                cursor: 'pointer', border: 'none'
                            }} onMouseEnter={(e) => e.currentTarget.style.color = broadcasted ? 'var(--accent)' : '#0d9488'} onMouseLeave={(e) => e.currentTarget.style.color = broadcasted ? 'var(--accent)' : 'var(--text-muted)'}>
                                <Repeat2 size={16} />
                                {broadcastCount > 0 && (
                                    <span>{broadcastCount}</span>
                                )}
                            </button>

                            <button onClick={(e) => handleActionClick(e, toggleLike)} className="nav-link-hover" style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                color: liked ? '#ef4444' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                cursor: 'pointer', border: 'none'
                            }} onMouseEnter={(e) => e.currentTarget.style.color = liked ? '#f87171' : '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = liked ? '#ef4444' : 'var(--text-muted)'}>
                                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                                {likeCount > 0 && (
                                    <span>{likeCount}</span>
                                )}
                            </button>
                        </div>

                        {/* Share & Bookmark Actions right-aligned */}
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <button onClick={handleShare} className="nav-link-hover" style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: shareCopied ? '#22c55e' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'color 0.2s', padding: '0.25rem', borderRadius: '50%',
                                cursor: 'pointer', border: 'none'
                            }} title={shareCopied ? 'Link Copied!' : 'Share Endorsement'}>
                                <Share2 size={18} />
                            </button>

                            <button onClick={(e) => handleActionClick(e, toggleBookmark)} className="nav-link-hover" style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: bookmarked ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'color 0.2s, transform 0.1s', padding: '0.25rem', borderRadius: '50%', border: 'none',
                                cursor: 'pointer', transform: bookmarked ? 'scale(1.1)' : 'scale(1)'
                            }} title={bookmarked ? "Remove Bookmark" : "Bookmark Need"}>
                                <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
