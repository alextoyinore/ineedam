import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, UserPlus, MessageCircle, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';

export const NotificationsPage = () => {
    const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

    useEffect(() => {
        // Option: mark all as read when page is opened
        // markAllAsRead();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'follow': return <UserPlus size={18} color="#3b82f6" />;
            case 'reply': return <MessageCircle size={18} color="#10b981" />;
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
                            onClick={() => markAsRead(notif.id)}
                            style={{
                                padding: '1.25rem 1rem',
                                borderBottom: '1px solid var(--border-glass)',
                                display: 'flex', gap: '0.75rem',
                                background: notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                cursor: 'pointer', position: 'relative',
                                width: '100%'
                            }}
                            className="nav-link-hover"
                        >
                            {!notif.read && (
                                <div style={{
                                    position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)',
                                    width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6'
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
                                    <strong style={{ fontWeight: 700 }}>{notif.from}</strong> {notif.message}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {new Date(notif.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
        </div>
    );
};
