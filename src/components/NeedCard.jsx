import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, MapPin, Banknote, Clock, MessageSquare, Bookmark, Heart, MessageCircle, Repeat2, Award, Trash2, MoreVertical, Archive, Flag, UserPlus, UserMinus, VolumeX, Share2, FileText, Download, Edit3, CheckCircle, Hand } from 'lucide-react';
import { ReplyModal } from './ReplyModal';
import { supabase } from '../lib/supabase';
import { useBookmarks } from '../context/BookmarksContext';
import { useLikes } from '../context/LikesContext';
import { useBroadcasts } from '../context/BroadcastsContext';
import { getLikeCount } from '../lib/likesService';
import { getReplyCount, getFirstReplyTime, formatResponseTime } from '../lib/replyService';
import { getBroadcastCount } from '../lib/broadcastService';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useNotifications } from '../context/NotificationsContext';
import { ProfileHoverCard } from './ProfileHoverCard';
import { updateNeedStatus } from '../lib/needsService';
import { MentionText } from './MentionText';
import { OnlineBadge } from './OnlineBadge';
import { useInterest } from '../context/InterestContext';
import { getInterestCount } from '../lib/interestService';

export const NeedCard = ({ need, isFullDetail = false, broadcastedBy = null, onEdit = null, onMarkMet = null }) => {
    const { user } = useAuth();
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const navigate = useNavigate();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { isLiked: checkIsLiked, toggleLike: toggleLikeInContext } = useLikes();
    const { isBroadcasted: checkIsBroadcasted, toggleBroadcast: toggleBroadcastInContext } = useBroadcasts();
    const { isFollowing: checkIsFollowing, toggleFollow } = useSocial();
    const { addNotification } = useNotifications();
    const { isInterested: checkIsInterested, toggleInterest: toggleInterestInContext } = useInterest();

    const [likeCount, setLikeCount] = useState(0);
    const [replyCount, setReplyCount] = useState(0);
    const [broadcastCount, setBroadcastCount] = useState(0);
    const [interestCount, setInterestCount] = useState(0);
    const [hasLoadedCount, setHasLoadedCount] = useState(false);
    const [endorsementCount, setEndorsementCount] = useState(0);
    const [isArchived, setIsArchived] = useState(false);
    const [firstResponseTime, setFirstResponseTime] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    const isBroadcast = broadcastedBy || need.type === 'broadcast';
    const targetId = isBroadcast ? (need.broadcast_id || need.id) : need.id;
    const targetType = isBroadcast ? 'broadcast' : 'need';

    const bookmarked = isBookmarked(targetId, targetType);
    const following = checkIsFollowing(need.authorId);
    const liked = checkIsLiked(need.id);
    const broadcasted = checkIsBroadcasted(need.id);
    const interested = checkIsInterested(need.id);

    React.useEffect(() => {
        const loadCounts = async () => {
            try {
                const [likes, replies, broadcasts, { count, error }, interests, firstReplyTs] = await Promise.all([
                    getLikeCount(need.id),
                    getReplyCount(need.id),
                    getBroadcastCount(need.id),
                    supabase
                        .from('endorsements')
                        .select('*', { count: 'exact', head: true })
                        .eq('endorsed_id', need.authorId),
                    getInterestCount(need.id),
                    getFirstReplyTime(need.id, need.authorId)
                ]);
                setLikeCount(likes);
                setReplyCount(replies);
                setBroadcastCount(broadcasts);
                setEndorsementCount(error ? 0 : (count || 0));
                setInterestCount(interests);
                setFirstResponseTime(firstReplyTs ? formatResponseTime(need.created_at, firstReplyTs) : null);
                setHasLoadedCount(true);
            } catch (err) {
                console.error("Error loading counts for needcard", err);
            }
        };
        loadCounts();
    }, [need.id, need.authorId]);

    const handleLike = async (e) => {
        e.stopPropagation();
        const prevLiked = liked;
        // The context handles the user_id/need_id like record
        await toggleLikeInContext(need.id);

        // Optimistically update the count locally
        setLikeCount(prev => prevLiked ? prev - 1 : prev + 1);
    };

    const handleBroadcast = async (e) => {
        e.stopPropagation();
        const prevBroadcasted = broadcasted;
        await toggleBroadcastInContext(need.id);

        // Optimistically update the count locally
        setBroadcastCount(prev => prevBroadcasted ? prev - 1 : prev + 1);
    };

    const handleFollow = (e) => {
        e.stopPropagation();
        toggleFollow(need.authorId);
    };

    const handleInterest = async (e) => {
        e.stopPropagation();
        const wasInterested = interested;
        await toggleInterestInContext(need.id);
        setInterestCount(prev => wasInterested ? prev - 1 : prev + 1);

        // Notify the need owner the first time someone expresses interest
        if (!wasInterested && user && need.authorId && need.authorId !== user.id) {
            try {
                await addNotification(
                    need.authorId,
                    'interest',
                    user.id,
                    `expressed interest in helping with your need`,
                    need.id
                );
            } catch (_) { /* silent */ }
        }
    };

    const handleArchive = async (e) => {
        e.stopPropagation();
        if (!window.confirm("Archive this post? It will be hidden from the feed.")) return;
        try {
            await updateNeedStatus(need.id, 'archived');
            setIsArchived(true);
        } catch (err) {
            console.error("Failed to archive need", err);
        }
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        const shareData = {
            title: need.title,
            text: need.description,
            url: window.location.origin + `/need/${need.id}`
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
                // If canShare exists and returns false, skip to fallback
                if (navigator.canShare && !navigator.canShare(shareData)) {
                    await fallbackCopy();
                    return;
                }
                await navigator.share(shareData);
            } catch (err) {
                // AbortError means the user cancelled the share sheet manually.
                // Any other error means the share failed (e.g. desktop OS block), so we fallback.
                if (err.name !== 'AbortError') {
                    console.error('Native share failed, falling back', err);
                    await fallbackCopy();
                }
            }
        } else {
            await fallbackCopy();
        }
    };

    const isUnavailable = isArchived || !need || !need.id || need.status === 'archived' || need.status === 'deleted';

    if (isUnavailable) return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
        }}>
            {broadcastedBy && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 600, marginRight: '0.5rem' }}>
                    <Repeat2 size={14} />
                    <span>{broadcastedBy.display_name} broadcasted</span>
                </div>
            )}
            <Archive size={16} style={{ flexShrink: 0, opacity: 0.5 }} />
            <span style={{ fontStyle: 'italic' }}>This need is no longer available</span>
        </div>
    );
    return (
        <div
            onClick={() => !isFullDetail && navigate(`/need/${need.id}`)}
            className="feed-item-hover"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                position: 'relative',
                cursor: !isFullDetail ? 'pointer' : 'default',
                borderBottom: isFullDetail ? 'none' : '1px solid var(--border-glass)',
                margin: '0',
                padding: '1.5rem'
            }}>
            {/* Broadcast Header */}
            {broadcastedBy && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    marginLeft: '3.25rem' // Align with content, after avatar space
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
                        {broadcastedBy.display_name} broadcasted
                    </span>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0 }}>
                    <ProfileHoverCard userData={{
                        id: need.authorId,
                        author: need.author,
                        authorUsername: need.authorUsername,
                        authorAvatar: need.authorAvatar,
                        authorBio: need.authorBio,
                        authorLastSeenAt: need.authorLastSeenAt
                    }}>
                        <div
                            onClick={(e) => { e.stopPropagation(); navigate(`/${need.authorUsername}`); }}
                            className="avatar-md"
                            style={{
                                borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', color: 'white', overflow: 'hidden',
                                cursor: 'pointer', position: 'relative'
                            }}>
                            {need.authorAvatar ? (
                                <img src={need.authorAvatar} alt={need.author || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                (need.author || '?').charAt(0).toUpperCase()
                            )}
                            <div style={{ position: 'absolute', bottom: '0', right: '0' }}>
                                <OnlineBadge lastSeenAt={need.author_last_seen_at || need.authorLastSeenAt} size="12px" />
                            </div>
                        </div>
                    </ProfileHoverCard>
                    <div style={{ minWidth: 0 }}>
                        <div className="need-meta-container" style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <ProfileHoverCard userData={{
                                id: need.authorId,
                                author: need.author,
                                authorUsername: need.authorUsername,
                                authorAvatar: need.authorAvatar,
                                authorBio: need.authorBio
                            }}>
                                <span
                                    onClick={(e) => { e.stopPropagation(); navigate(`/${need.authorUsername}`); }}
                                    style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                    {need.author}
                                </span>
                            </ProfileHoverCard>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {need.authorUsername && (
                                    <span>@{need.authorUsername}</span>
                                )}
                                <span>• {need.postedAt}</span>
                                {firstResponseTime && (
                                    <>
                                        <span>•</span>
                                        <span style={{ color: 'var(--text-secondary)' }} title="Time to first response">{firstResponseTime}</span>
                                    </>
                                )}
                                {endorsementCount > 0 && (
                                    <>
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'var(--primary)' }} title={`${endorsementCount} Endorsement${endorsementCount !== 1 ? 's' : ''}`}>
                                            <Award size={12} />
                                            <span style={{ fontWeight: 600 }}>{endorsementCount}</span>
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 600, color: `var(--${need.categoryColor || 'primary'})`,
                            }}>
                                {need.category} Need
                            </span>
                            {need.status && need.status !== 'open' && (
                                <span style={{
                                    padding: '0.1rem 0.5rem', borderRadius: '4px',
                                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                                    background: need.status === 'met' ? 'var(--primary)' : 'var(--bg-surface)',
                                    color: need.status === 'met' ? 'white' : 'var(--text-muted)',
                                    border: '1px solid var(--border-glass)'
                                }}>
                                    {need.status === 'met' ? 'MET' : need.status}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Follow & Menu Buttons - Anchored to the right */}
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', position: 'relative' }}>
                    {user && need.authorId !== user.id && (
                        <button
                            onClick={handleFollow}
                            style={{
                                fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                                borderRadius: '9999px', border: following ? '1px solid var(--border-glass)' : '1px solid var(--primary)',
                                background: following ? 'transparent' : 'var(--primary)',
                                color: following ? 'var(--text-primary)' : 'white',
                                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                                marginRight: '0.5rem'
                            }}
                        >
                            {following ? 'Following' : 'Follow'}
                        </button>
                    )}

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="nav-link-hover"
                            style={{
                                padding: '0.4rem', borderRadius: '50%', color: 'var(--text-muted)',
                                background: 'transparent', transition: 'all 0.2s'
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
                                    {/* Follow/Unfollow Action */}
                                    {user && need.authorId !== user.id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMenuOpen(false);
                                                handleFollow(e);
                                            }}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '0.7rem',
                                                borderRadius: '8px', display: 'flex', alignItems: 'center',
                                                gap: '0.75rem', color: 'var(--text-primary)',
                                                fontSize: '0.9rem', fontWeight: 500
                                            }}
                                            className="nav-link-hover"
                                        >
                                            {following ? <UserMinus size={18} /> : <UserPlus size={18} />}
                                            {following ? 'Unfollow' : 'Follow'} @{need.authorUsername}
                                        </button>
                                    )}

                                    {/* Mute Action */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMenuOpen(false);
                                            // Handle mute logic later
                                        }}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '0.7rem',
                                            borderRadius: '8px', display: 'flex', alignItems: 'center',
                                            gap: '0.75rem', color: 'var(--text-primary)',
                                            fontSize: '0.9rem', fontWeight: 500
                                        }}
                                        className="nav-link-hover"
                                    >
                                        <VolumeX size={18} />
                                        Mute @{need.authorUsername}
                                    </button>

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
                                        {shareCopied ? 'Link Copied!' : 'Share Post'}
                                    </button>

                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>


            {/* Post Content */}
            <div className="need-content-wrapper" style={{}}>
                <h3 className="h3" style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>{need.title}</h3>
                <MentionText
                    text={need.description}
                    style={{
                        color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 1rem 0',
                        display: isFullDetail ? 'block' : '-webkit-box', WebkitLineClamp: isFullDetail ? 'none' : 3, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                />

                {/* Rich Media */}
                {need.imageUrl && (
                    <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                        <img
                            src={need.imageUrl}
                            alt={need.title}
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                )}

                {/* File Attachment */}
                {need.fileUrl && (
                    <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                        <a
                            href={need.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem', background: 'var(--bg-base)',
                                border: '1px solid var(--border-glass)', borderRadius: '12px',
                                color: 'var(--text-primary)', textDecoration: 'none'
                            }}
                            className="glass-panel-hover"
                            onClick={(e) => e.stopPropagation()} // Prevent navigating to detail page if clicking attachment
                        >
                            <FileText size={20} color="var(--primary)" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>View Attachment</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{need.fileType || 'Document'}</span>
                            </div>
                            <Download size={16} style={{ marginLeft: '0.5rem', opacity: 0.5 }} />
                        </a>
                    </div>
                )}

                {/* Constraints Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '.5rem', marginTop: '.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        <Banknote size={14} color="var(--accent)" />
                        <span style={{ fontWeight: 600 }}>{need.budget}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} />
                        <span>{need.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <Clock size={14} />
                        <span>{need.flexibility}</span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={(e) => { e.stopPropagation(); setIsReplyOpen(true); }} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '-0.5rem',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <MessageSquare size={16} />
                            {replyCount > 0 && (
                                <span>{replyCount}</span>
                            )}
                        </button>

                        <button onClick={() => navigate(`/need/${need.id}`)} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <MessageCircle size={16} />
                        </button>

                        {/* Broadcast Button */}
                        <button onClick={handleBroadcast} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: broadcasted ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = broadcasted ? 'var(--accent)' : '#0d9488'} onMouseLeave={(e) => e.currentTarget.style.color = broadcasted ? 'var(--accent)' : 'var(--text-muted)'}>
                            <Repeat2 size={16} />
                            {broadcastCount > 0 && (
                                <span>{broadcastCount}</span>
                            )}
                        </button>

                        {/* Interested Button — only for non-owners on open needs */}
                        {user && need.authorId !== user.id && need.status !== 'archived' && need.status !== 'met' && (
                            <button
                                onClick={handleInterest}
                                className="nav-link-hover"
                                title={interested ? 'Remove interest signal' : 'Signal you can help'}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    color: interested ? 'var(--primary)' : 'var(--text-muted)',
                                    fontSize: '0.9rem', background: 'transparent',
                                    transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                    cursor: 'pointer', fontWeight: interested ? 600 : 400
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = interested ? 'var(--primary)' : 'var(--text-muted)'}
                            >
                                <Hand size={16} />
                                {interestCount > 0 && <span>{interestCount}</span>}
                            </button>
                        )}

                        <button onClick={handleLike} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: liked ? '#ef4444' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = liked ? '#f87171' : '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = liked ? '#ef4444' : 'var(--text-muted)'}>
                            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                            {likeCount > 0 && (
                                <span>{likeCount}</span>
                            )}
                        </button>

                        {/* Owner Actions */}
                        {user && need.authorId === user.id && (
                            <>
                                {need.status !== 'met' && onEdit && (
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(need); }} className="nav-link-hover" style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                        transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                        cursor: 'pointer'
                                    }} title="Edit Need" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                        <Edit3 size={16} />
                                    </button>
                                )}
                                {need.status === 'open' && onMarkMet && (
                                    <button onClick={(e) => { e.stopPropagation(); onMarkMet(need); }} className="nav-link-hover" style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                        transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                        cursor: 'pointer'
                                    }} title="Mark as Met" onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                        <CheckCircle size={16} />
                                    </button>
                                )}
                                {need.status === 'open' && (
                                    <button onClick={handleArchive} className="nav-link-hover" style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                                        transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                        cursor: 'pointer'
                                    }} title="Archive Need" onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                        <Archive size={16} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Bookmark Action right-aligned */}
                    <button onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(targetId, targetType);
                    }} className="nav-link-hover" style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: bookmarked ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                        transition: 'color 0.2s, transform 0.1s', padding: '0.25rem', borderRadius: '50%',
                        cursor: 'pointer', transform: bookmarked ? 'scale(1.1)' : 'scale(1)'
                    }} title={bookmarked ? `Remove ${targetType === 'broadcast' ? 'Broadcast ' : ''}Bookmark` : `Bookmark ${targetType === 'broadcast' ? 'Broadcast' : 'Need'}`}>
                        <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>

            <ReplyModal
                isOpen={isReplyOpen}
                onClose={() => setIsReplyOpen(false)}
                need={need}
                onReply={() => setReplyCount(prev => prev + 1)}
            />
        </div>
    );
};
