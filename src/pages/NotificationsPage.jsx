import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, UserPlus, MessageCircle, Info, Heart, PhoneOff, Loader } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';
import { OnlineBadge } from '../components/OnlineBadge';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const InViewMarker = ({ onInView }) => {
    const ref = React.useRef(null);
    const onInViewRef = React.useRef(onInView);
    
    // Keep ref updated to avoid stale closures
    React.useEffect(() => {
        onInViewRef.current = onInView;
    }, [onInView]);

    React.useEffect(() => {
        let hasFired = false;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasFired) {
                hasFired = true;
                onInViewRef.current();
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    // Return invisible element stretching full height to catch visibility anywhere in the item
    return <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '1px', pointerEvents: 'none' }} />;
};

export const NotificationsPage = () => {
    const { notifications, markAsRead } = useNotifications();
    const navigate = useNavigate();
    
    // UI Pagination State
    const [visibleCount, setVisibleCount] = useState(20);
    const [loadingMore, setLoadingMore] = useState(false);
    const visibleNotifications = notifications.slice(0, visibleCount);

    const loadMore = useCallback(() => {
        if (loadingMore) return;
        setLoadingMore(true);
        setTimeout(() => {
            setVisibleCount((prev) => prev + 20);
            setLoadingMore(false);
        }, 400);
    }, [loadingMore]);

    const hasMore = visibleCount < notifications.length;
    const lastElementRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

    useEffect(() => {
        // Option: mark all as read when page is opened
        // markAllAsRead();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'follow': return <UserPlus size={18} color="var(--primary)" />;
            case 'reply':
            case 'reply_message': return <MessageCircle size={18} color="#10b981" />;
            case 'like': return <Heart size={18} color="#ef4444" />;
            case 'missed_call': return <PhoneOff size={18} color="#ef4444" />;
            case 'incoming_call': return <Bell size={18} color="var(--primary)" />;
            case 'mention': return <motion.span style={{ color: 'var(--primary)', fontWeight: 800 }}>@</motion.span>;
            default: return <Info size={18} color="var(--text-muted)" />;
        }
    };

    const formatNotificationMessage = (notif) => {
        if (!notif.message) return '';
        if (notif.type === 'message' || notif.type === 'reply_message') {
            if (notif.message.includes('[CALL_')) {
                return notif.message.replace(/\[CALL_(SUCCESS|MISSED|REJECTED|CANCELLED)\]/, '');
            }
            return 'sent you a message';
        }
        return notif.message.replace(/\[CALL_(SUCCESS|MISSED|REJECTED|CANCELLED)\]/, '');
    };

    const getNotificationLink = (notif) => {
        if ((notif.type === 'follow' || notif.type === 'incoming_call') && notif.actorProfile?.username) {
            return `/${notif.actorProfile.username}`;
        } else if ((notif.type === 'reply' || notif.type === 'like' || notif.type === 'mention' || notif.type === 'reply_message') && notif.reference_id) {
            return `/need/${notif.reference_id}`;
        } else if (notif.type === 'missed_call' && notif.reference_id) {
            return `/chat/${notif.reference_id}`;
        }
        return null;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <header className="sticky-header" style={{
                padding: '0.6rem var(--feed-item-padding)',
                height: 'var(--mobile-header-height)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Notifications</h2>
            </header>

            {/* Notifications List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                    <>
                        {visibleNotifications.map((notif, index) => {
                            const mainLink = getNotificationLink(notif);
                        
                        return (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (index % 20) * 0.05 }}
                                className="feed-item-hover"
                                onClick={() => markAsRead(notif.id)}
                                style={{
                                    borderBottom: '1px solid var(--border-glass)',
                                    background: notif.read ? 'transparent' : 'color-mix(in srgb, var(--primary) 12%, transparent)',
                                    position: 'relative',
                                    width: '100%'
                                }}
                            >
                                {!notif.read && (
                                    <>
                                        <InViewMarker onInView={() => {
                                            setTimeout(() => markAsRead(notif.id), 2500);
                                        }} />
                                        <div style={{
                                            position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)',
                                            width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)',
                                            zIndex: 2
                                        }} />
                                    </>
                                )}

                                <div style={{ position: 'relative', display: 'flex', gap: '0.75rem', padding: '0.75rem var(--feed-item-padding)' }}>
                                    {/* Link overlay for the whole card area */}
                                    {mainLink && (
                                        <Link 
                                            to={mainLink} 
                                            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                                            aria-label="View notification details"
                                        />
                                    )}

                                    {notif.actors && notif.actors.length > 0 ? (
                                        <>
                                            <div style={{ position: 'relative', flexShrink: 0, width: '44px', display: 'flex', justifyContent: 'flex-end', paddingTop: '4px', zIndex: 2 }}>
                                                <div style={{ paddingRight: '8px' }}>
                                                    {React.cloneElement(getIcon(notif.type), { size: 28 })}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0, zIndex: 2 }}>
                                                {/* Stacked Avatars Row */}
                                                <div style={{ display: 'flex', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                    {notif.actors.slice(0, 10).map((actor, i) => (
                                                        <Link 
                                                            key={i} 
                                                            to={`/${actor?.username}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{ 
                                                                width: '32px', height: '32px', borderRadius: '50%',
                                                                marginLeft: i > 0 ? '-8px' : '0',
                                                                border: '2px solid var(--bg-surface)',
                                                                background: actor?.avatar_url ? `url(${actor.avatar_url}) center/cover` : 'var(--bg-base)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                zIndex: 10 - i, position: 'relative', overflow: 'hidden', flexShrink: 0
                                                            }}
                                                        >
                                                            {!actor?.avatar_url && actor?.display_name && (
                                                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                                    {actor.display_name.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    ))}
                                                </div>
                                                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                                    <strong style={{ fontWeight: 700 }}>
                                                        {notif.actors.length > 2 
                                                            ? `${notif.actors[0]?.display_name || notif.actors[0]?.username}, ${notif.actors[1]?.display_name || notif.actors[1]?.username} and ${notif.actors.length - 2} others`
                                                            : notif.actors.length === 2
                                                                ? `${notif.actors[0]?.display_name || notif.actors[0]?.username} and ${notif.actors[1]?.display_name || notif.actors[1]?.username}`
                                                                : notif.actors[0]?.display_name || notif.actors[0]?.username || 'System'
                                                        }
                                                    </strong>
                                                    {' '}
                                                    {formatNotificationMessage(notif)}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    {new Date(notif.created_at || notif.timestamp || Date.now()).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ position: 'relative', flexShrink: 0, zIndex: 2 }}>
                                                <Link 
                                                    to={`/${notif.actorProfile?.username}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                                        background: notif.actorProfile?.avatar_url ? `url(${notif.actorProfile.avatar_url}) center/cover` : 'var(--bg-surface)',
                                                        border: '1px solid var(--border-glass)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        position: 'relative', overflow: 'visible'
                                                    }}
                                                >
                                                    {!notif.actorProfile?.avatar_url && !notif.actorProfile?.display_name && getIcon(notif.type)}
                                                    {!notif.actorProfile?.avatar_url && notif.actorProfile?.display_name && notif.actorProfile.display_name.charAt(0).toUpperCase()}
                                                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px' }}>
                                                        <OnlineBadge lastSeenAt={notif.actorProfile?.last_seen_at} size="10px" />
                                                    </div>
                                                    {/* Small icon overlay for notification type */}
                                                    {notif.actorProfile?.avatar_url && (
                                                        <div style={{
                                                            position: 'absolute', top: '-4px', right: '-4px',
                                                            background: 'var(--bg-base)', borderRadius: '50%',
                                                            padding: '2px', border: '1px solid var(--border-glass)',
                                                            lineHeight: 0
                                                        }}>
                                                            {React.cloneElement(getIcon(notif.type), { size: 10 })}
                                                        </div>
                                                    )}
                                                </Link>
                                            </div>
                                            <div style={{ flex: 1, zIndex: 2 }}>
                                                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                                    {/* Fallback to actor_id UUID */}
                                                    <strong style={{ fontWeight: 700 }}>{notif.actorProfile?.display_name || notif.actor_id?.substring(0, 6) || 'System'}</strong> {formatNotificationMessage(notif)}
                                                    {notif.group_count > 1 && (
                                                        <span style={{ marginLeft: '0.5rem', padding: '0.1rem 0.4rem', borderRadius: '10px', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                                                            {notif.group_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    {new Date(notif.created_at || notif.timestamp || Date.now()).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                    
                    {/* Sentinel for infinite scroll */}
                    {hasMore && (
                        <div ref={lastElementRef} style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', color: 'var(--primary)' }}>
                            {loadingMore && <Loader className="animate-spin" size={24} />}
                        </div>
                    )}
                    </>
                ) : (
                    <div style={{
                        height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', textAlign: 'center', padding: '2rem'
                    }}>
                        <Bell size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                        <h3 className="h3" style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No notifications yet</h3>
                        <p style={{ maxWidth: '300px' }}>When people follow you or reply to your needs, you'll see them here.</p>
                    </div>
                )}
            </div>
        </div >
    );
};
