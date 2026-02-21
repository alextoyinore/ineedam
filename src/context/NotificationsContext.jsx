import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('user_notifications');
        return saved ? JSON.parse(saved) : [
            {
                id: '1',
                type: 'follow',
                from: 'Sarah J.',
                message: 'started following you',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                read: false
            },
            {
                id: '2',
                type: 'reply',
                from: 'Miguel R.',
                message: 'replied to your post "Language Tutor"',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                read: true
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('user_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (notif) => {
        const newNotif = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notif
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
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
