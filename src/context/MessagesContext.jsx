import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { fetchUserThreads, getOrCreateThread, createMessage, markThreadAsReadInDb } from '../lib/messageService';

const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
    const { user } = useAuth();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadThreads = async () => {
        if (!user) {
            setThreads([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await fetchUserThreads(user.id);
            setThreads(data || []);
        } catch (err) {
            console.error("Failed to load threads", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadThreads();

        if (user) {
            // Subscribe to new messages that might affect our threads
            const channel = supabase
                .channel(`public:messages`)
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages' },
                    () => {
                        // When a new message comes in, simply reload threads to get the latest preview and unread status.
                        // For a larger app, you'd want to inject the message directly into the state to save DB calls,
                        // but reloading is perfectly reliable for this scale.
                        loadThreads();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const sendMessage = async (otherUserId, text) => {
        if (!user) return;
        try {
            // 1. Ensure thread exists
            const threadId = await getOrCreateThread(user.id, otherUserId);

            // 2. Insert message
            await createMessage(threadId, user.id, text);

            // 3. Instead of manually updating state, the realtime listener will pick it up
            // or we can manually reload to ensure immediate UI update
            await loadThreads();
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const markThreadAsRead = async (threadId) => {
        if (!user) return;

        // Optimistic UI update
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unread: false } : t));

        try {
            await markThreadAsReadInDb(threadId, user.id);
        } catch (err) {
            console.error("Failed to mark thread read in DB", err);
            // Could revert UI here if needed
        }
    };

    const unreadThreadsCount = threads.filter(t => t.unread).length;

    return (
        <MessagesContext.Provider value={{ threads, sendMessage, markThreadAsRead, unreadThreadsCount, loadingThreads: loading }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessagesContext);
    if (!context) throw new Error('useMessages must be used within a MessagesProvider');
    return context;
};
