import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { fetchUserThreads, getOrCreateThread, createMessage, markThreadAsReadInDb } from '../lib/messageService';
import { soundService } from '../lib/soundService';


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
            // Subscribe to new messages OR new thread participations
            const channel = supabase
                .channel(`messages-refresh`)
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'messages' },
                    (payload) => {
                        loadThreads();
                        // Play received sound if we are not the sender
                        if (payload.new && payload.new.sender_id !== user.id) {
                            soundService.playMessageReceived();
                        }
                    }
                )
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'thread_participants', filter: `user_id=eq.${user.id}` },
                    () => loadThreads()
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const startChat = async (otherUserId) => {
        if (!user) return null;
        try {
            const threadId = await getOrCreateThread(user.id, otherUserId);
            await loadThreads();
            return threadId;
        } catch (err) {
            console.error("Failed to start chat", err);
            throw err;
        }
    };

    const sendMessage = async (otherUserId, text) => {
        if (!user) return;

        // 1. Create a temporary optimistic message
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            senderId: user.id,
            sender: 'Me',
            text: text,
            timestamp: new Date().toISOString()
        };

        // 2. Update state immediately
        setThreads(prev => prev.map(t => {
            if (t.withUserId === otherUserId) {
                return {
                    ...t,
                    lastMessage: text,
                    timestamp: new Date().toISOString(),
                    messages: [...t.messages, optimisticMsg]
                };
            }
            return t;
        }));

        try {
            const threadId = await startChat(otherUserId);
            await createMessage(threadId, user.id, text);
            soundService.playMessageSent();
            // Real-time listener will eventually sync, but we reload to be sure.
            // We don't await this to keep the UI snappy.
            loadThreads();
        } catch (err) {
            console.error("Failed to send message", err);
            // On error, the next loadThreads will naturally revert the UI
            loadThreads();
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
        <MessagesContext.Provider value={{
            threads,
            sendMessage,
            startChat,
            markThreadAsRead,
            unreadThreadsCount,
            refreshThreads: loadThreads,
            loadingThreads: loading
        }}>
            {children}
        </MessagesContext.Provider>
    );
};

// Export as function for better Fast Refresh / HMR support
export function useMessages() {
    const context = useContext(MessagesContext);
    if (!context) throw new Error('useMessages must be used within a MessagesProvider');
    return context;
}

