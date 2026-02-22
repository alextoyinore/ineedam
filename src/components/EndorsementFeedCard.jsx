import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, Heart, Repeat2, Bookmark, MessageSquare, MessageCircle } from 'lucide-react';
import { formatTimeAgo } from './../lib/replyService';
import { ProfileHoverCard } from './ProfileHoverCard';
import { useLikes } from '../context/LikesContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useBroadcasts } from '../context/BroadcastsContext';
import { ReplyModal } from './ReplyModal';

export const EndorsementFeedCard = ({ endorsement }) => {
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

    const liked = hasNeed ? isLiked(need.id) : false;
    const bookmarked = hasNeed ? isBookmarked(need.id) : false;
    const broadcasted = hasNeed ? isBroadcasted(need.id) : false;

    const handleActionClick = (e, actionFn) => {
        e.stopPropagation();
        if (hasNeed) actionFn(need.id);
    };

    const handleReplyClick = (e) => {
        e.stopPropagation();
        if (hasNeed) setIsReplyModalOpen(true);
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            position: 'relative',
        }}>
            {dummyNeed && (
                <ReplyModal
                    isOpen={isReplyModalOpen}
                    onClose={() => setIsReplyModalOpen(false)}
                    need={dummyNeed}
                />
            )}

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
                        <div className="need-meta-container" style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
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
                                    {endorsedUser.display_name}
                                </span>
                            </ProfileHoverCard>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {endorsedUser.username && (
                                    <span>@{endorsedUser.username}</span>
                                )}
                                <span>• {formatTimeAgo(endorsement.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                            Written by <strong onClick={(e) => { e.stopPropagation(); navigate(`/${endorser.username}`); }} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>{endorser.display_name}</strong> for helping with <strong onClick={(e) => { e.stopPropagation(); navigate(`/need/${endorsement.need_id}`); }} style={{ color: 'var(--primary)', cursor: 'pointer' }}>{endorsement.needs?.title}</strong>
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
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '-0.5rem',
                                cursor: 'pointer', border: 'none'
                            }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <MessageSquare size={16} />
                                <span className="btn-label-text">Reply</span>
                            </button>

                            <button onClick={handleThreadClick} className="nav-link-hover" style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                cursor: 'pointer', border: 'none'
                            }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <MessageCircle size={16} />
                                <span className="btn-label-text">View Thread</span>
                            </button>

                            {/* Broadcast Button */}
                            <button onClick={(e) => handleActionClick(e, toggleBroadcast)} className="nav-link-hover" style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                color: broadcasted ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                cursor: 'pointer', border: 'none'
                            }} onMouseEnter={(e) => e.currentTarget.style.color = broadcasted ? 'var(--accent)' : '#0d9488'} onMouseLeave={(e) => e.currentTarget.style.color = broadcasted ? 'var(--accent)' : 'var(--text-muted)'}>
                                <Repeat2 size={16} />
                                <span className="btn-label-text">{broadcasted ? 'Broadcasted' : 'Broadcast'}</span>
                            </button>

                            <button onClick={(e) => handleActionClick(e, toggleLike)} className="nav-link-hover" style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                color: liked ? '#ef4444' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                cursor: 'pointer', border: 'none'
                            }} onMouseEnter={(e) => e.currentTarget.style.color = liked ? '#f87171' : '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = liked ? '#ef4444' : 'var(--text-muted)'}>
                                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                                <span>
                                    <span className="btn-label-text">Like</span>
                                </span>
                            </button>
                        </div>

                        {/* Bookmark Action right-aligned */}
                        <button onClick={(e) => handleActionClick(e, toggleBookmark)} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: bookmarked ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'color 0.2s, transform 0.1s', padding: '0.25rem', borderRadius: '50%', border: 'none',
                            cursor: 'pointer', transform: bookmarked ? 'scale(1.1)' : 'scale(1)'
                        }} title={bookmarked ? "Remove Bookmark" : "Bookmark Need"}>
                            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
