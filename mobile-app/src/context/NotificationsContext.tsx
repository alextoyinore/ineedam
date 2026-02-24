import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
} from '../lib/notificationService';
import { mobileSoundService } from '../lib/soundService';

interface Notification {
    id: string;
    user_id: string;
    type: string;
    message: string;
    read: boolean;
    created_at: string;
    actor_id?: string;
    actorProfile?: {
        display_name: string;
        username: string;
        avatar_url?: string;
    };
    reference_id?: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    loading: boolean;
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        try {
            const data = await fetchNotifications(user.id);
            setNotifications(data || []);
        } catch (err) {
            console.error("Failed to load notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();

        if (!user) return;

        // Subscribe to real-time insertions for our user
        const channel = supabase
            .channel(`public:notifications:user_id=eq.${user.id}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    loadNotifications(); // Re-fetch to get profile joins
                    mobileSoundService.playNotification();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await markNotificationAsRead(id);
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
            console.error("Failed to mark all as read:", err);
        }
    };

    const clearNotifications = async () => {
        if (!user) return;
        setNotifications([]);
        try {
            await clearAllNotifications(user.id);
        } catch (err) {
            console.error("Failed to clear notifications:", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationsContext.Provider value={{
            notifications,
            loading,
            unreadCount,
            markAsRead,
            markAllAsRead,
            clearNotifications
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
