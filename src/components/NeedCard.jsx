import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, MapPin, Banknote, Clock, MessageSquare, Bookmark } from 'lucide-react';
import { ReplyModal } from './ReplyModal';
import { useBookmarks } from '../context/BookmarksContext';
import { useSocial } from '../context/SocialContext';
import { useNotifications } from '../context/NotificationsContext';

export const NeedCard = ({ need, isFullDetail = false }) => {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const navigate = useNavigate();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { isFollowing, toggleFollow } = useSocial();
    const { addNotification } = useNotifications();
    const bookmarked = isBookmarked(need.id);
    const following = isFollowing(need.author); // Using author name as ID for demo

    const handleFollow = (e) => {
        e.stopPropagation();
        const willFollow = !following;
        toggleFollow(need.author);

        if (willFollow) {
            addNotification({
                type: 'follow',
                from: need.author,
                message: 'followed you back'
            });
        }
    };
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative',
        }}>
            {/* Top Header: Author info & meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white'
                    }}>
                        {need.author.charAt(0)}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{need.author}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>• {need.postedAt}</span>

                            {/* Follow Button */}
                            <button
                                onClick={handleFollow}
                                style={{
                                    fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                                    borderRadius: '9999px', border: following ? '1px solid var(--border-glass)' : '1px solid var(--primary)',
                                    background: following ? 'transparent' : 'var(--primary)',
                                    color: following ? 'var(--text-primary)' : 'white',
                                    marginLeft: '0.5rem', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {following ? 'Following' : 'Follow'}
                            </button>
                        </div>
                        <span style={{
                            fontSize: '0.75rem', fontWeight: 600, color: `var(--${need.categoryColor || 'primary'})`,
                        }}>
                            {need.category} Need
                        </span>
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div style={{ paddingLeft: '3.25rem' }}>
                <h3 className="h3" style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>{need.title}</h3>
                <p style={{
                    fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0,
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
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '-0.5rem',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <MessageSquare size={16} />
                            Reply
                        </button>

                        <button onClick={() => navigate(`/need/${need.id}`)} className="nav-link-hover" style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: 'var(--text-muted)', fontSize: '0.9rem', background: 'transparent',
                            transition: 'color 0.2s', padding: '0.25rem 0.5rem', borderRadius: '4px',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                            View Thread
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

            <ReplyModal isOpen={isReplyOpen} onClose={() => setIsReplyOpen(false)} need={need} />
        </div>
    );
};
