import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, MapPin, Banknote, Clock, MessageSquare, Bookmark, Heart, MessageCircle, Repeat2, Award } from 'lucide-react';
import { ReplyModal } from './ReplyModal';
import { useBookmarks } from '../context/BookmarksContext';
import { useLikes } from '../context/LikesContext';
import { useBroadcasts } from '../context/BroadcastsContext';
import { getLikeCount } from '../lib/likesService';
import { getReplyCount } from '../lib/replyService';
import { getBroadcastCount } from '../lib/broadcastService';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useNotifications } from '../context/NotificationsContext';
import { ProfileHoverCard } from './ProfileHoverCard';

export const NeedCard = ({ need, isFullDetail = false }) => {
    const { user } = useAuth();
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const navigate = useNavigate();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { isLiked: checkIsLiked, toggleLike: toggleLikeInContext } = useLikes();
    const { isBroadcasted: checkIsBroadcasted, toggleBroadcast: toggleBroadcastInContext } = useBroadcasts();
    const { isFollowing: checkIsFollowing, toggleFollow } = useSocial();
    const { addNotification } = useNotifications();

    const [likeCount, setLikeCount] = useState(0);
    const [replyCount, setReplyCount] = useState(0);
    const [broadcastCount, setBroadcastCount] = useState(0);
    const [hasLoadedCount, setHasLoadedCount] = useState(false);
    const [endorsementCount, setEndorsementCount] = useState(0);

    const bookmarked = isBookmarked(need.id);
    const following = checkIsFollowing(need.authorId);
    const liked = checkIsLiked(need.id);
    const broadcasted = checkIsBroadcasted(need.id);

    React.useEffect(() => {
        const loadCounts = async () => {
            try {
                const [likes, replies, broadcasts, { count, error }] = await Promise.all([
                    getLikeCount(need.id),
                    getReplyCount(need.id),
                    getBroadcastCount(need.id),
                    import('../lib/supabase').then(({ supabase }) =>
                        supabase
                            .from('endorsements')
                            .select('*', { count: 'exact', head: true })
                            .eq('endorsed_id', need.authorId)
                    )
                ]);
                setLikeCount(likes);
                setReplyCount(replies);
                setBroadcastCount(broadcasts);
                setEndorsementCount(error ? 0 : (count || 0));
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
    return (
        <div
            onClick={() => !isFullDetail && navigate(`/need/${need.id}`)}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0 }}>
                    <ProfileHoverCard userData={{
                        id: need.authorId,
                        author: need.author,
                        authorUsername: need.authorUsername,
                        authorAvatar: need.authorAvatar,
                        authorBio: need.authorBio
                    }}>
                        <div
                            onClick={(e) => { e.stopPropagation(); navigate(`/${need.authorUsername}`); }}
                            className="avatar-md"
                            style={{
                                borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', color: 'white', overflow: 'hidden',
                                cursor: 'pointer'
                            }}>
                            {need.authorAvatar ? (
                                <img src={need.authorAvatar} alt={need.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                need.author.charAt(0).toUpperCase()
                            )}
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

                {/* Follow Button - Anchored to the right */}
                {user && need.authorId !== user.id && (
                    <button
                        onClick={handleFollow}
                        style={{
                            fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                            borderRadius: '9999px', border: following ? '1px solid var(--border-glass)' : '1px solid var(--primary)',
                            background: following ? 'transparent' : 'var(--primary)',
                            color: following ? 'var(--text-primary)' : 'white',
                            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                        }}
                    >
                        {following ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>


            {/* Post Content */}
            <div className="need-content-wrapper" style={{}}>
                <h3 className="h3" style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>{need.title}</h3>
                <p className="need-description" style={{
                    color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 1rem 0',
                    display: isFullDetail ? 'block' : '-webkit-box', WebkitLineClamp: isFullDetail ? 'none' : 3, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', whiteSpace: 'pre-wrap'
                }}>
                    {need.description}
                </p>

                {/* Rich Media */}
                {need.imageUrl && (
                    <div style={{ marginTop: '0.75rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                        <img
                            src={need.imageUrl}
                            alt={need.title}
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                )}

                {/* Constraints Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button onClick={(e) => { e.stopPropagation(); setIsReplyOpen(true); }} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '-0.5rem',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <MessageSquare size={16} />
                            <span>
                                {replyCount > 0 ? (
                                    replyCount
                                ) : (
                                    <span className="btn-label-text">Reply</span>
                                )}
                            </span>
                        </button>

                        <button onClick={() => navigate(`/need/${need.id}`)} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <MessageCircle size={16} />
                            <span className="btn-label-text">View Thread</span>
                        </button>

                        {/* Broadcast Button */}
                        <button onClick={handleBroadcast} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: broadcasted ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = broadcasted ? 'var(--accent)' : '#0d9488'} onMouseLeave={(e) => e.currentTarget.style.color = broadcasted ? 'var(--accent)' : 'var(--text-muted)'}>
                            <Repeat2 size={16} />
                            <span>
                                {broadcastCount > 0 ? (
                                    broadcastCount
                                ) : (
                                    <span className="btn-label-text">Broadcast</span>
                                )}
                            </span>
                        </button>

                        <button onClick={handleLike} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: liked ? '#ef4444' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'all 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = liked ? '#f87171' : '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = liked ? '#ef4444' : 'var(--text-muted)'}>
                            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                            <span>
                                {likeCount > 0 ? (
                                    likeCount
                                ) : (
                                    <span className="btn-label-text">Like</span>
                                )}
                            </span>
                        </button>
                    </div>

                    {/* Bookmark Action right-aligned */}
                    <button onClick={(e) => { e.stopPropagation(); toggleBookmark(need.id); }} className="nav-link-hover" style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: bookmarked ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                        transition: 'color 0.2s, transform 0.1s', padding: '0.25rem', borderRadius: '50%',
                        cursor: 'pointer', transform: bookmarked ? 'scale(1.1)' : 'scale(1)'
                    }} title={bookmarked ? "Remove Bookmark" : "Bookmark Need"}>
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
