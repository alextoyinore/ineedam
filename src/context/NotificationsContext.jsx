import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    createNotification
} from '../lib/notificationService';
import { soundService } from '../lib/soundService';


const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial fetch and real-time subscription setup
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        const loadContent = async () => {
            setLoading(true);
            try {
                const data = await fetchNotifications(user.id);

                // Grouping logic: group by type, reference_id, and day
                const grouped = [];
                const groups = {}; // key for grouped notifications

                (data || []).forEach(notif => {
                    const shouldGroup = true; // Group all notification types including replies and mentions
                    const currentActor = notif.actorProfile || { display_name: notif.actor_id?.substring(0, 6), username: notif.actor_id?.substring(0, 6) };

                    if (shouldGroup) {
                        const day = new Date(notif.created_at || notif.timestamp || Date.now()).toISOString().split('T')[0];
                        const key = `${notif.type}-${notif.reference_id || 'noref'}-${day}`;

                        if (!groups[key]) {
                            groups[key] = { 
                                ...notif, 
                                group_count: 1, 
                                grouped_ids: [notif.id],
                                actors: [currentActor]
                            };
                            grouped.push(groups[key]);
                        } else {
                            groups[key].group_count++;
                            groups[key].grouped_ids.push(notif.id);
                            
                            // Add unique actor
                            if (!groups[key].actors.find(a => (a?.username === currentActor.username) || (a?.display_name === currentActor.display_name))) {
                                groups[key].actors.push(currentActor);
                            }
                            
                            // Keep the most recent unread status if any is unread
                            if (!notif.read) groups[key].read = false;
                        }
                    } else {
                        grouped.push({ ...notif, group_count: 1, grouped_ids: [notif.id], actors: [currentActor] });
                    }
                });

                setNotifications(grouped);
            } catch (err) {
                console.error("Failed to load notifications context", err);
            } finally {
                setLoading(false);
            }
        };

        loadContent();

        // Subscribe to real-time insertions for our user
        const channel = supabase
            .channel(`public:notifications:user_id=eq.${user.id}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    loadContent(); // Re-fetch to get profile joins
                    soundService.playNotification();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Optionally still exposed if client needs to proactively post a notification, 
    // though usually handled by backend triggers or service components directly
    const addNotification = async (notif) => {
        if (!user) return;
        try {
            // Note: from_user_id and specific types usually need to map to the DB correctly.
            // Simplified fallback for now:
            await createNotification(user.id, notif.type || 'system', notif.from || 'System', notif.message, null);
            // It will come back instantly via the realtime channel
        } catch (err) {
            console.error("Error artificially adding notification:", err);
        }
    };

    const markAsRead = async (id) => {
        const notif = notifications.find(n => n.id === id);
        const idsToMark = notif?.grouped_ids || [id];

        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            // Mark all underlying notifications as read
            await Promise.all(idsToMark.map(notifId => markNotificationAsRead(notifId)));
        } catch (err) {
            // Revert on failure
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            await markAllNotificationsAsRead(user.id);
        } catch (err) {
            console.error("Failed to mark all as read in DB", err);
        }
    };

    const clearNotifications = async () => {
        if (!user) return;
        setNotifications([]);
        try {
            await clearAllNotifications(user.id);
        } catch (err) {
            console.error("Failed to clear notifications in DB", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationsContext.Provider value={{
            notifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotifications,
            unreadCount
        }}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationsProvider');
    return context;
};
