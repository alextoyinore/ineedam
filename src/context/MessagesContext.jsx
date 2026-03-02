import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { fetchUserThreads, getOrCreateThread, createMessage, markThreadAsReadInDb } from '../lib/messageService';
import { soundService } from '../lib/soundService';


const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
    const { user, profile } = useAuth();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [call, setCall] = useState(null); // { status: 'idle'|'calling'|'incoming'|'connected', isVideo, partner: { id, name, avatar }, stream: null }
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const activeThreadIdRef = useRef(activeThreadId);
    const callRef = useRef(call);
    const pcRef = useRef(null);
    const streamRef = useRef(null);
    const pendingOfferRef = useRef(null);
    const callTimeoutRef = useRef(null);

    // Keep refs in sync with state for real-time listener closures
    useEffect(() => {
        activeThreadIdRef.current = activeThreadId;
    }, [activeThreadId]);

    useEffect(() => {
        callRef.current = call;
    }, [call]);

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
                        // AND we are not currently looking at this specific thread
                        if (payload.new && payload.new.sender_id !== user.id) {
                            const incomingThreadId = String(payload.new.thread_id);
                            const currentActiveId = activeThreadIdRef.current ? String(activeThreadIdRef.current) : null;

                            if (incomingThreadId !== currentActiveId) {
                                soundService.playMessageReceived();
                            }
                        }
                    }
                )
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'thread_participants', filter: `user_id=eq.${user.id}` },
                    () => loadThreads()
                )
                .subscribe();

            // Subscribe to call signals
            const callChannel = supabase.channel(`call-${user.id}`)
                .on('broadcast', { event: 'call-signal' }, async ({ payload }) => {
                    handleIncomingSignal(payload);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
                supabase.removeChannel(callChannel);
                if (pcRef.current) pcRef.current.close();
            };
        }
    }, [user]);

    const createPeerConnection = (targetUserId, isVideo) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendCallSignal(targetUserId, { candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log("Got remote track", event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                endCall();
            }
        };

        pcRef.current = pc;
        return pc;
    };

    const handleIncomingSignal = async (payload) => {
        const { from, type, offer, answer, candidate, isVideo, fromName, fromAvatar } = payload;

        if (type === 'offer') {
            if (pcRef.current && callRef.current?.status === 'connected') {
                // Re-negotiation (e.g. upgrade to video)
                try {
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pcRef.current.createAnswer();
                    await pcRef.current.setLocalDescription(answer);
                    sendCallSignal(from, { type: 'answer', answer });
                    if (isVideo) {
                        setCall(prev => ({ ...prev, isVideo: true }));
                    }
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
                partner: { id: from, name: fromName, avatar: fromAvatar }
            });
        } else if (type === 'answer') {
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
            }
            if (pcRef.current) {
                try {
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (err) {
                    console.error("Setting answer failing:", err);
                }
            }
        } else if (candidate) {
            if (pcRef.current) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } else if (type === 'hangup') {
            soundService.stopRinging();
            endCall();
        }
    };

    const initiateCall = async (targetUserId, targetName, targetAvatar, isVideo = false) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
            setLocalStream(stream);
            streamRef.current = stream;

            const pc = createPeerConnection(targetUserId, isVideo);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            setCall({
                status: 'calling',
                isVideo,
                partner: { id: targetUserId, name: targetName, avatar: targetAvatar }
            });

            sendCallSignal(targetUserId, {
                type: 'offer',
                offer,
                isVideo,
                fromName: profile?.display_name || user.email,
                fromAvatar: profile?.avatar_url
            });

            // Set a timeout for missed call (60 seconds)
            callTimeoutRef.current = setTimeout(async () => {
                const currentCall = callRef.current;
                if (currentCall?.status === 'calling') {
                    console.log("Call timed out - missed call");
                    const threadId = await getOrCreateThread(user.id, targetUserId);

                    // Create missed call message in chat
                    const missedCallText = `Missed ${isVideo ? 'video' : 'voice'} call`;
                    await createMessage(threadId, user.id, `[MISSED_CALL]${missedCallText}`, null, null);

                    const { createNotification } = await import('../lib/notificationService');
                    await createNotification(
                        targetUserId,
                        'missed_call',
                        user.id,
                        missedCallText,
                        threadId
                    );
                    endCall();
                }
            }, 60000);
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

            const pc = createPeerConnection(call.partner.id, call.isVideo);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            setCall(prev => ({ ...prev, status: 'connected' }));

            sendCallSignal(call.partner.id, {
                type: 'answer',
                answer,
                fromName: profile?.display_name || user.email,
                fromAvatar: profile?.avatar_url
            });

            pendingOfferRef.current = null;
        } catch (err) {
            console.error("Failed to accept call", err);
            endCall();
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

    const endCall = () => {
        soundService.stopRinging();
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (call?.partner) {
            sendCallSignal(call.partner.id, { type: 'hangup' });
        }
        setCall(null);
        setLocalStream(null);
        setRemoteStream(null);
    };

    const sendCallSignal = async (targetUserId, signalData) => {
        if (!user) return;
        console.log(`Sending signal to ${targetUserId}:`, signalData);
        await supabase.channel(`call-${targetUserId}`).send({
            type: 'broadcast',
            event: 'call-signal',
            payload: { from: user.id, ...signalData }
        });
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
                const { uploadFileToCloudinary } = await import('../lib/needsService');
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
            timestamp: new Date().toISOString()
        };

        // 2. Update state immediately
        setThreads(prev => prev.map(t => {
            if (t.withUserId === otherUserId) {
                return {
                    ...t,
                    lastMessage: text || (fileUrl ? '📎 Attachment' : ''),
                    timestamp: new Date().toISOString(),
                    messages: [...t.messages, optimisticMsg]
                };
            }
            return t;
        }));

        try {
            const threadId = await startChat(otherUserId);
            await createMessage(threadId, user.id, text, fileUrl, fileType);
            await markThreadAsReadInDb(threadId, user.id);
            soundService.playMessageSent();
            loadThreads();
        } catch (err) {
            console.error("Failed to send message", err);
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
            sendCallSignal
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

