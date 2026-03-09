import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, UserPlus, MessageCircle, Info, Heart, PhoneOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';

export const NotificationsPage = () => {
    const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const navigate = useNavigate();

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <header className="sticky-header" style={{
                padding: '0 1rem',
                height: 'var(--mobile-header-height)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Notifications</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={markAllAsRead}
                        className="glass-panel-hover"
                        style={{ padding: '0.4rem', borderRadius: '50%', color: 'var(--text-primary)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        title="Mark all as read"
                    >
                        <Check size={20} />
                    </button>
                    <button
                        onClick={clearNotifications}
                        className="glass-panel-hover"
                        style={{ padding: '0.4rem', borderRadius: '50%', color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        title="Clear all"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </header>

            {/* Notifications List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="feed-item-hover"
                            onClick={() => {
                                markAsRead(notif.id);
                                if ((notif.type === 'follow' || notif.type === 'incoming_call') && notif.actorProfile?.username) {
                                    navigate(`/${notif.actorProfile.username}`);
                                } else if ((notif.type === 'reply' || notif.type === 'like' || notif.type === 'mention' || notif.type === 'reply_message') && notif.reference_id) {
                                    navigate(`/need/${notif.reference_id}`);
                                } else if (notif.type === 'missed_call' && notif.reference_id) {
                                    navigate(`/messages/${notif.reference_id}`);
                                }
                            }}
                            style={{
                                padding: '1.25rem 1rem',
                                borderBottom: '1px solid var(--border-glass)',
                                display: 'flex', gap: '0.75rem',
                                background: notif.read ? 'transparent' : 'color-mix(in srgb, var(--primary), transparent 95%)',
                                cursor: 'pointer', position: 'relative',
                                width: '100%'
                            }}
                        >
                            {!notif.read && (
                                <div style={{
                                    position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)',
                                    width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)'
                                }} />
                            )}
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {getIcon(notif.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                    {/* Fallback to actor_id UUID */}
                                    <strong style={{ fontWeight: 700 }}>{notif.actorProfile?.display_name || notif.actor_id?.substring(0, 6) || 'System'}</strong> {notif.message}
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
                        </motion.div>
                    ))
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
