import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { fetchUserThreads, getOrCreateThread, createMessage, markThreadAsReadInDb, toggleMessageBookmark, toggleMessageReaction, editChatMessage, deleteChatMessage } from '../lib/chatService';
import { soundService } from '../lib/soundService';
import { createNotification } from '../lib/notificationService';
import { uploadFileToCloudinary } from '../lib/needsService';


const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user, profile } = useAuth();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [call, setCall] = useState(null); // { status: 'idle'|'calling'|'incoming'|'connected', isVideo, partner: { id, name, avatar }, stream: null }
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null); // { id, text, sender }
    const [typingUsers, setTypingUsers] = useState({}); // { [threadId]: timestamp }

    const activeThreadIdRef = useRef(activeThreadId);
    const callRef = useRef(call);
    const pcRef = useRef(null);
    const streamRef = useRef(null);
    const pendingOfferRef = useRef(null);
    const iceCandidateQueueRef = useRef([]);
    const callTimeoutRef = useRef(null);
    const isEndingCallRef = useRef(false);
    const lastProcessedCallIdRef = useRef(null);

    // Keep refs in sync with state for real-time listener closures
    useEffect(() => {
        activeThreadIdRef.current = activeThreadId;
    }, [activeThreadId]);

    useEffect(() => {
        callRef.current = call;
    }, [call]);

    const loadThreads = async (silent = false) => {
        if (!user) {
            setThreads([]);
            if (!silent) setLoading(false);
            return;
        }
        if (!silent) setLoading(true);
        try {
            const data = await fetchUserThreads(user.id);
            setThreads(data || []);
        } catch (err) {
            console.error("Failed to load threads", err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadThreads();

        if (user) {
            // Subscribe to new messages OR new thread participations
            const channel = supabase
                .channel(`chat-updates-${user.id}`)
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'messages' },
                    (payload) => {
                        console.log("Real-time message event:", payload.eventType, payload);

                        // If it's an UPDATE or DELETE, or if we are the sender of an INSERT, just refresh silently
                        if (payload.eventType !== 'INSERT' || (payload.new && payload.new.sender_id === user.id)) {
                            loadThreads(true);
                            return;
                        }

                        if (payload.new) {
                            const incomingThreadId = String(payload.new.thread_id).toLowerCase();

                            // 1. Manually append the message for instant feedback
                            setThreads(prev => {
                                const threadIdx = prev.findIndex(t => String(t.id).toLowerCase() === incomingThreadId);
                                if (threadIdx === -1) {
                                    console.log("Thread not found locally, relying on background refresh");
                                    return prev;
                                }

                                const thread = prev[threadIdx];
                                // Avoid duplicates
                                if (thread.messages.some(m => String(m.id).toLowerCase() === String(payload.new.id).toLowerCase())) {
                                    return prev;
                                }

                                const newMessage = {
                                    id: payload.new.id,
                                    senderId: payload.new.sender_id,
                                    sender: thread.withUser || 'Them',
                                    text: payload.new.text || payload.new.content || '',
                                    fileUrl: payload.new.file_url,
                                    fileType: payload.new.file_type,
                                    timestamp: payload.new.created_at,
                                    replyTo: payload.new.reply_to,
                                    reactions: [],
                                    isBookmarked: false
                                };

                                const updatedThread = {
                                    ...thread,
                                    lastChat: newMessage.text || (newMessage.fileUrl ? '📎 Attachment' : ''),
                                    timestamp: newMessage.timestamp,
                                    messages: [...thread.messages, newMessage]
                                };

                                // Move updated thread to top of list
                                const newThreads = [...prev];
                                newThreads.splice(threadIdx, 1);
                                return [updatedThread, ...newThreads];
                            });

                            // 2. Play received sound if we are taking a break from this specific thread
                            const currentActiveId = activeThreadIdRef.current ? String(activeThreadIdRef.current).toLowerCase() : null;
                            if (incomingThreadId !== currentActiveId) {
                                soundService.playMessageReceived();
                            }
                        }

                        // 3. Background refresh to ensure full consistency (profiles, reactions, etc.)
                        loadThreads(true);
                    }
                )
                .on('postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'thread_participants' },
                    () => {
                        // Recipient read the chat — refresh so recipientLastReadAt updates (turns ticks blue)
                        loadThreads(true);
                    }
                )
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'thread_participants', filter: `user_id=eq.${user.id}` },
                    () => {
                        console.log("Thread participation change detected");
                        loadThreads(true);
                    }
                )
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'message_reactions' },
                    () => loadThreads(true)
                )
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'message_bookmarks' },
                    () => loadThreads(true)
                )
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'replies' },
                    () => {
                        console.log("Real-time reply change detected");
                        loadThreads(true);
                    }
                )
                .subscribe();

            // Subscribe to call signals
            const callChannel = supabase.channel(`call-${user.id}`)
                .on('broadcast', { event: 'call-signal' }, async ({ payload }) => {
                    handleIncomingSignal(payload);
                })
                .subscribe();

            // Subscribe to typing signals
            const typingChannel = supabase.channel(`typing-${user.id}`)
                .on('broadcast', { event: 'typing' }, ({ payload }) => {
                    if (payload.threadId) {
                        setTypingUsers(prev => ({ ...prev, [payload.threadId]: Date.now() }));
                    }
                })
                .subscribe();

            // 4. Heartbeat silent refresh (safety net for liquid feel)
            const heartbeat = setInterval(() => {
                loadThreads(true);
            }, 10000);

            return () => {
                supabase.removeChannel(channel);
                supabase.removeChannel(callChannel);
                supabase.removeChannel(typingChannel);
                clearInterval(heartbeat);
                if (pcRef.current) pcRef.current.close();
            };
        }
    }, [user]);

    // Cleanup stale typing indicators
    useEffect(() => {
        const interval = setInterval(() => {
            setTypingUsers(prev => {
                const now = Date.now();
                let changed = false;
                const next = { ...prev };
                for (const threadId in next) {
                    if (now - next[threadId] > 3000) {
                        delete next[threadId];
                        changed = true;
                    }
                }
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const createPeerConnection = (isVideo) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && callRef.current?.partner) {
                sendCallSignal(callRef.current.partner.id, { candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.onconnectionstatechange = () => {
            if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
                endCall();
            }
        };

        pcRef.current = pc;
        return pc;
    };

    const handleIncomingSignal = async (payload) => {
        const { from, type, offer, answer, candidate, isVideo, fromName, fromAvatar } = payload;

        if (type === 'offer') {
            const currentCall = callRef.current;
            // If already in a call with SOMEONE ELSE
            if (currentCall && currentCall.status !== 'idle' && from !== currentCall.partner.id) {
                console.log("Busy - rejecting call from", from);
                sendCallSignal(from, { type: 'hangup', reason: 'busy' });
                return;
            }

            if (currentCall?.status === 'connected') {
                // Re-negotiation (e.g. upgrade to video)
                try {
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pcRef.current.createAnswer();
                    await pcRef.current.setLocalDescription(answer);
                    sendCallSignal(from, { type: 'answer', answer });

                    // Process queued candidates
                    if (iceCandidateQueueRef.current.length > 0) {
                        iceCandidateQueueRef.current.forEach(async (cand) => {
                            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
                        });
                        iceCandidateQueueRef.current = [];
                    }

                    if (isVideo) setCall(prev => ({ ...prev, isVideo: true }));
                } catch (err) {
                    console.error("Re-negotiation failed:", err);
                }
                return;
            }

            soundService.startRinging();
            pendingOfferRef.current = offer;
            setCall({
                status: 'incoming',
                isVideo,
                partner: { id: from, name: fromName, avatar: fromAvatar },
                isInitiator: false
            });
        } else if (type === 'answer') {
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
            }
            if (pcRef.current) {
                try {
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                    setCall(prev => ({
                        ...prev,
                        status: 'connected',
                        startTime: Date.now(),
                        partner: {
                            ...prev.partner,
                            name: fromName || prev.partner?.name,
                            avatar: fromAvatar || prev.partner?.avatar
                        }
                    }));

                    if (iceCandidateQueueRef.current.length > 0) {
                        iceCandidateQueueRef.current.forEach(async (cand) => {
                            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
                        });
                        iceCandidateQueueRef.current = [];
                    }
                } catch (err) {
                    console.error("Setting answer failing:", err);
                }
            }
        } else if (candidate) {
            if (pcRef.current && pcRef.current.remoteDescription) {
                try {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            } else {
                iceCandidateQueueRef.current.push(candidate);
            }
        } else if (type === 'hangup') {
            soundService.stopRinging();
            if (from === callRef.current?.partner?.id) {
                endCall(payload.reason, true);
            }
        }
    };

    const initiateCall = async (targetUserId, targetName, targetAvatar, isVideo = false) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
            setLocalStream(stream);
            streamRef.current = stream;

            const pc = createPeerConnection(isVideo);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            setCall({
                status: 'calling',
                isVideo,
                partner: { id: targetUserId, name: targetName, avatar: targetAvatar },
                isInitiator: true
            });

            sendCallSignal(targetUserId, {
                type: 'offer',
                offer,
                isVideo,
                fromName: profile?.display_name || user.email,
                fromAvatar: profile?.avatar_url
            });

            // Create an in-app notification for the incoming call (triggers push)
            try {
                await createNotification(
                    targetUserId,
                    'incoming_call',
                    user.id,
                    `is calling you...`,
                    null // referenceId not strictly needed for the call itself
                );
            } catch (err) {
                console.error("Failed to create incoming call notification:", err);
            }

            // Set a timeout for missed call (30 seconds)
            callTimeoutRef.current = setTimeout(async () => {
                const currentCall = callRef.current;
                if (currentCall?.status === 'calling') {
                    console.log("Call timeout - calling endCall");
                    const threadId = await getOrCreateThread(user.id, targetUserId);
                    const missedCallText = `Missed ${isVideo ? 'video' : 'voice'} call`;

                    await createNotification(
                        targetUserId,
                        'missed_call',
                        user.id,
                        missedCallText,
                        threadId
                    );
                    endCall('timeout');
                }
            }, 30000);
        } catch (err) {
            console.error("Failed to initiate call", err);
            alert("Could not start call: " + err.message);
        }
    };

    const acceptCall = async () => {
        if (!call || !call.partner || !pendingOfferRef.current) return;

        soundService.stopRinging();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: call.isVideo });
            setLocalStream(stream);
            streamRef.current = stream;

            const pc = createPeerConnection(call.isVideo);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Process queued candidates
            if (iceCandidateQueueRef.current.length > 0) {
                iceCandidateQueueRef.current.forEach(async (cand) => {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                });
                iceCandidateQueueRef.current = [];
            }

            setCall(prev => ({ ...prev, status: 'connected', startTime: Date.now(), isInitiator: false }));

            sendCallSignal(call.partner.id, {
                type: 'answer',
                answer,
                fromName: profile?.display_name || user.email,
                fromAvatar: profile?.avatar_url
            });

            pendingOfferRef.current = null;
        } catch (err) {
            console.error("Failed to accept call", err);
            endCall('failed');
        }
    };

    const toggleVideo = async () => {
        if (!call || call.status !== 'connected') return;

        const videoTrack = streamRef.current?.getVideoTracks()[0];

        if (videoTrack) {
            // Video already exists, just toggle it
            videoTrack.enabled = !videoTrack.enabled;
            setCall(prev => ({ ...prev, isVideo: videoTrack.enabled }));
        } else {
            // Need to upgrade to video
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const newVideoTrack = newStream.getVideoTracks()[0];

                if (streamRef.current && pcRef.current) {
                    streamRef.current.addTrack(newVideoTrack);
                    pcRef.current.addTrack(newVideoTrack, streamRef.current);

                    // Re-negotiate
                    const offer = await pcRef.current.createOffer();
                    await pcRef.current.setLocalDescription(offer);

                    sendCallSignal(call.partner.id, {
                        type: 'offer',
                        offer,
                        isVideo: true
                    });

                    setCall(prev => ({ ...prev, isVideo: true }));
                }
            } catch (err) {
                console.error("Failed to upgrade to video", err);
                alert("Could not enable video: " + err.message);
            }
        }
    };

    const endCall = async (reason = null, isRemote = false) => {
        const currentCall = callRef.current;
        if (!currentCall || isEndingCallRef.current) return;

        isEndingCallRef.current = true;
        soundService.stopRinging();
        console.log("Ending call. Reason:", reason, "Remote:", isRemote);

        // 1. SIGNAL OTHER PARTY FIRST (Fire and forget)
        if (currentCall.partner && !isRemote) {
            sendCallSignal(currentCall.partner.id, { type: 'hangup', reason });
        }

        // 2. CLOSE UI & PC immediately for responsiveness
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
        }

        if (pcRef.current) {
            try { pcRef.current.close(); } catch (e) { }
            pcRef.current = null;
        }

        if (streamRef.current) {
            try { streamRef.current.getTracks().forEach(track => track.stop()); } catch (e) { }
            streamRef.current = null;
        }

        setCall(null);
        setLocalStream(null);
        setRemoteStream(null);
        iceCandidateQueueRef.current = [];

        // 3. DB LOGGING (Only for initiator, and only once per call session)
        const callSessionId = currentCall.startTime || Date.now();
        if (currentCall.isInitiator && lastProcessedCallIdRef.current !== callSessionId) {
            lastProcessedCallIdRef.current = callSessionId;
            try {
                const threadId = await getOrCreateThread(user.id, currentCall.partner.id);

                if (currentCall.status === 'connected' && currentCall.startTime) {
                    const duration = Math.floor((Date.now() - currentCall.startTime) / 1000);
                    const minutes = Math.floor(duration / 60);
                    const seconds = duration % 60;
                    const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    await createMessage(threadId, user.id, `[CALL_SUCCESS]${currentCall.isVideo ? 'Video' : 'Voice'} call • ${durationText}`, null, null);
                } else {
                    if (reason === 'timeout') {
                        await createMessage(threadId, user.id, `[CALL_MISSED]${currentCall.isVideo ? 'video' : 'voice'} call`, null, null);
                    } else if (reason === 'rejected') {
                        await createMessage(threadId, user.id, `[CALL_REJECTED]${currentCall.isVideo ? 'video' : 'voice'} call`, null, null);
                    } else if (currentCall.status === 'calling' && !isRemote) {
                        await createMessage(threadId, user.id, `[CALL_CANCELLED]${currentCall.isVideo ? 'video' : 'voice'} call`, null, null);
                    }
                }
                await loadThreads();
            } catch (err) {
                console.error("Failed to record call status message:", err);
            }
        } else if (!currentCall.isInitiator) {
            setTimeout(() => loadThreads(), 2000);
        }

        setTimeout(() => {
            isEndingCallRef.current = false;
        }, 1000);
    };

    const sendCallSignal = async (targetUserId, signalData) => {
        if (!user) return;

        try {
            // Safety: Ensure reason/payload doesn't contain circular objects (like DOM events)
            const safeSignalData = { ...signalData };
            if (safeSignalData.reason && typeof safeSignalData.reason !== 'string') {
                safeSignalData.reason = 'terminated';
            }

            console.log(`Sending signal to ${targetUserId}:`, safeSignalData.type || 'candidate');
            const channel = supabase.channel(`call-${targetUserId}`);
            await channel.send({
                type: 'broadcast',
                event: 'call-signal',
                payload: {
                    from: user.id,
                    fromName: profile?.display_name || user.email,
                    fromAvatar: profile?.avatar_url,
                    ...safeSignalData
                }
            });
        } catch (err) {
            console.error("Signal send failed:", err);
        }
    };

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
    const sendMessage = async (otherUserId, text, file = null) => {
        if (!user) return;

        let fileUrl = null;
        let fileType = null;

        // If a file or audio blob was provided, upload it first
        if (file) {
            try {
                const result = await uploadFileToCloudinary(file);
                fileUrl = result.url;
                fileType = result.fileType;
            } catch (err) {
                console.error("File upload failed:", err);
                return;
            }
        }

        // 1. Create a temporary optimistic message
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            senderId: user.id,
            sender: 'Me',
            text: text,
            fileUrl,
            fileType,
            timestamp: new Date().toISOString(),
            replyTo: replyingTo?.id
        };

        // 2. Update state immediately
        setThreads(prev => prev.map(t => {
            if (t.withUserId === otherUserId) {
                return {
                    ...t,
                    lastChat: text || (fileUrl ? '📎 Attachment' : ''),
                    timestamp: new Date().toISOString(),
                    messages: [...t.messages, optimisticMsg]
                };
            }
            return t;
        }));

        try {
            const threadId = await startChat(otherUserId);
            soundService.playChatSent(); // Play sound immediately for responsiveness

            const newMessageData = await createMessage(threadId, user.id, text, fileUrl, fileType, replyingTo?.id);

            // Reconcile optimistic message with the real message from DB
            setThreads(prev => prev.map(t => {
                if (t.id === threadId) {
                    return {
                        ...t,
                        messages: t.messages.map(m =>
                            m.id === optimisticMsg.id
                                ? { ...m, id: newMessageData.id, timestamp: newMessageData.created_at }
                                : m
                        )
                    };
                }
                return t;
            }));

            setReplyingTo(null); // Clear reply context
            await markThreadAsReadInDb(threadId, user.id);
            loadThreads(true); // Silent refresh to sync everything else
        } catch (err) {
            console.error("Failed to send message", err);
            loadThreads(true); // Ensure state is synced even on error
        }
    };

    const toggleBookmark = async (messageId) => {
        if (!user) return;
        try {
            await toggleMessageBookmark(messageId, user.id);
            // Re-fetch to update isBookmarked status on messages
            loadThreads();
        } catch (err) {
            console.error("Failed to toggle bookmark", err);
        }
    };

    const toggleReaction = async (messageId, emoji) => {
        if (!user) return;
        try {
            await toggleMessageReaction(messageId, user.id, emoji);
            // Real-time will trigger loadThreads via 'message_reactions' listener
        } catch (err) {
            console.error("Failed to toggle reaction", err);
        }
    };

    const editMessage = async (messageId, newText) => {
        if (!user) return;

        // Optimistic UI update
        setThreads(prev => prev.map(thread => ({
            ...thread,
            messages: thread.messages.map(m => m.id === messageId ? { ...m, text: newText } : m),
            lastChat: thread.messages[thread.messages.length - 1]?.id === messageId
                ? newText
                : thread.lastChat
        })));

        try {
            await editChatMessage(messageId, user.id, newText);
        } catch (err) {
            console.error("Failed to edit message", err);
            loadThreads(true); // Revert on failure
            throw err;
        }
    };

    const deleteMessage = async (messageId) => {
        if (!user) return;

        // Optimistic UI update
        setThreads(prev => prev.map(thread => {
            const hasMessage = thread.messages.some(m => m.id === messageId);
            if (!hasMessage) return thread;

            const newMessages = thread.messages.filter(m => m.id !== messageId);
            return {
                ...thread,
                messages: newMessages,
                lastChat: newMessages.length > 0
                    ? (newMessages[newMessages.length - 1].text || (newMessages[newMessages.length - 1].fileUrl ? '📎 Attachment' : ''))
                    : ''
            };
        }));

        try {
            await deleteChatMessage(messageId, user.id);
        } catch (err) {
            console.error("Failed to delete message", err);
            loadThreads(true); // Revert on failure
            throw err;
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

    const sendTypingSignal = async (targetUserId, threadId) => {
        if (!user || !targetUserId || !threadId) return;
        try {
            const channel = supabase.channel(`typing-${targetUserId}`);
            await channel.send({
                type: 'broadcast',
                event: 'typing',
                payload: { threadId, fromUserId: user.id }
            });
        } catch (err) {
            // Ignore errors for typing signals as they are ephemeral
        }
    };

    const unreadThreadsCount = threads.filter(t => t.unread).length;

    return (
        <ChatContext.Provider value={{
            threads,
            sendMessage,
            startChat,
            markThreadAsRead,
            unreadThreadsCount,
            setActiveThreadId,
            activeThreadId,
            refreshThreads: loadThreads,
            loadingThreads: loading,
            call,
            localStream,
            remoteStream,
            initiateCall,
            acceptCall,
            endCall,
            toggleVideo,
            sendCallSignal,
            replyingTo,
            setReplyingTo,
            toggleReaction,
            toggleBookmark,
            editMessage,
            deleteMessage,
            sendTypingSignal,
            typingUsers
        }}>
            {children}
        </ChatContext.Provider>
    );
};

// Export as function for better Fast Refresh / HMR support
export function useChat() {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatProvider');
    return context;
}

