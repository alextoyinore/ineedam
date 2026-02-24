import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { fetchUserThreads, getOrCreateThread, createMessage, markThreadAsReadInDb } from '../lib/messageService';
import { mobileSoundService } from '../lib/soundService';

interface Thread {
    id: string;
    withUserId: string;
    withUser: string;
    withUserUsername: string;
    withUserAvatar?: string;
    lastMessage: string;
    timestamp: string;
    unread: boolean;
    messages: any[];
}

interface MessagesContextType {
    threads: Thread[];
    loadingThreads: boolean;
    unreadThreadsCount: number;
    activeThreadId: string | null;
    setActiveThreadId: (id: string | null) => void;
    startChat: (otherUserId: string) => Promise<string | null>;
    sendMessage: (otherUserId: string, text: string) => Promise<void>;
    markThreadAsRead: (threadId: string) => Promise<void>;
    refreshThreads: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const activeThreadIdRef = useRef<string | null>(null);

    useEffect(() => {
        activeThreadIdRef.current = activeThreadId;
    }, [activeThreadId]);

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
            console.error("Failed to load threads:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadThreads();

        if (user) {
            const channel = supabase
                .channel(`messages-refresh`)
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'messages' },
                    (payload: any) => {
                        loadThreads();
                        if (payload.new && payload.new.sender_id !== user.id) {
                            const incomingThreadId = String(payload.new.thread_id);
                            const currentActiveId = activeThreadIdRef.current ? String(activeThreadIdRef.current) : null;

                            if (incomingThreadId !== currentActiveId) {
                                mobileSoundService.playMessageReceived();
                            }
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

    const startChat = async (otherUserId: string) => {
        if (!user) return null;
        try {
            const threadId = await getOrCreateThread(user.id, otherUserId);
            await loadThreads();
            return threadId;
        } catch (err) {
            console.error("Failed to start chat:", err);
            throw err;
        }
    };

    const sendMessage = async (otherUserId: string, text: string) => {
        if (!user) return;

        // Optimistic update
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            senderId: user.id,
            sender: 'Me',
            text: text,
            timestamp: new Date().toISOString()
        };

        setThreads(prev => prev.map(t => {
            if (t.withUserId === otherUserId) {
                return {
                    ...t,
                    lastMessage: text,
                    timestamp: new Date().toISOString(),
                    messages: [...(t.messages || []), optimisticMsg]
                };
            }
            return t;
        }));

        try {
            const threadId = await startChat(otherUserId);
            if (threadId) {
                await createMessage(threadId, user.id, text);
                mobileSoundService.playMessageSent();
                loadThreads();
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            loadThreads();
        }
    };

    const markThreadAsRead = async (threadId: string) => {
        if (!user) return;
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unread: false } : t));
        try {
            await markThreadAsReadInDb(threadId, user.id);
        } catch (err) {
            console.error("Failed to mark thread read:", err);
        }
    };

    const unreadThreadsCount = threads.filter(t => t.unread).length;

    return (
        <MessagesContext.Provider value={{
            threads,
            loadingThreads: loading,
            unreadThreadsCount,
            activeThreadId,
            setActiveThreadId,
            startChat,
            sendMessage,
            markThreadAsRead,
            refreshThreads: loadThreads
        }}>
            {children}
        </MessagesContext.Provider>
    );
};

export function useMessages() {
    const context = useContext(MessagesContext);
    if (!context) throw new Error('useMessages must be used within a MessagesProvider');
    return context;
}
