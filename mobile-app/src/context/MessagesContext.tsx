import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { fetchUserThreads, Thread, Message } from '../services/messageService';
// Note: WebRTC implementation for mobile would require react-native-webrtc
// and specific permission handling for Android/iOS.
// For this reconstruction, we'll implement the signaling logic as in the web version.

interface MessagesContextType {
    threads: Thread[];
    loadingThreads: boolean;
    activeThreadId: string | null;
    setActiveThreadId: (id: string | null) => void;
    sendMessage: (otherUserId: string, text: string, file?: any) => Promise<void>;
    refreshThreads: () => Promise<void>;
    unreadThreadsCount: number;
    call: any; // { status, isVideo, partner: { id, name, avatar } }
    initiateCall: (targetUserId: string, name: string, avatar?: string, isVideo?: boolean) => void;
    acceptCall: () => void;
    endCall: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [call, setCall] = useState<any>(null);

    const loadThreads = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            setThreads([]);
            setLoading(false);
            return;
        }
        setUser(authUser);
        setLoading(true);
        try {
            const data = await fetchUserThreads(authUser.id);
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
            // Subscribe to new messages
            const channel = supabase
                .channel(`messages-${user.id}`)
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'messages' },
                    () => loadThreads()
                )
                .subscribe();

            // Subscribe to call signals
            const callChannel = supabase.channel(`call-${user.id}`)
                .on('broadcast', { event: 'call-signal' }, ({ payload }) => {
                    handleIncomingSignal(payload);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
                supabase.removeChannel(callChannel);
            };
        }
    }, [user]);

    const handleIncomingSignal = (payload: any) => {
        const { type, from, fromName, fromAvatar, isVideo } = payload;
        if (type === 'offer') {
            setCall({
                status: 'incoming',
                isVideo,
                partner: { id: from, name: fromName, avatar: fromAvatar }
            });
        } else if (type === 'hangup') {
            setCall(null);
        }
    };

    const initiateCall = (targetUserId: string, name: string, avatar?: string, isVideo: boolean = false) => {
        setCall({
            status: 'calling',
            isVideo,
            partner: { id: targetUserId, name, avatar }
        });

        sendCallSignal(targetUserId, {
            type: 'offer',
            isVideo,
            fromName: 'Me', // Should be profile display_name
            fromAvatar: ''
        });
    };

    const acceptCall = () => {
        setCall((prev: any) => ({ ...prev, status: 'connected' }));
    };

    const endCall = () => {
        if (call?.partner) {
            sendCallSignal(call.partner.id, { type: 'hangup' });
        }
        setCall(null);
    };

    const sendCallSignal = async (targetUserId: string, signalData: any) => {
        if (!user) return;
        await supabase.channel(`call-${targetUserId}`).send({
            type: 'broadcast',
            event: 'call-signal',
            payload: { from: user.id, ...signalData }
        });
    };

    const sendMessage = async (otherUserId: string, text: string, file?: any) => {
        if (!user) return;

        // Implementation would include Cloudinary upload if file exists
        // and createMessage call as in web version.
        console.log(`Sending message to ${otherUserId}: ${text}`);
        // For now, we'll trigger a refresh after sending
        // Optimistic update logic and supabase insert omitted for brevity in this step
        // setTimeout(loadThreads, 1000); // Removed as postgres_changes subscription handles refresh
    };

    const unreadThreadsCount = threads.filter(t => t.unread).length;

    return (
        <MessagesContext.Provider value={{
            threads,
            loadingThreads: loading,
            activeThreadId,
            setActiveThreadId,
            sendMessage,
            refreshThreads: loadThreads,
            unreadThreadsCount,
            call,
            initiateCall,
            acceptCall,
            endCall
        }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessagesContext);
    if (!context) throw new Error('useMessages must be used within a MessagesProvider');
    return context;
};
