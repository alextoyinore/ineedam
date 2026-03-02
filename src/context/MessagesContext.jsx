import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { fetchUserThreads, getOrCreateThread, createMessage, markThreadAsReadInDb } from '../lib/messageService';
import { soundService } from '../lib/soundService';
import { createNotification } from '../lib/notificationService';
import { uploadFileToCloudinary } from '../lib/needsService';


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
                console.log("Local ICE candidate generated");
                sendCallSignal(targetUserId, { candidate: event.candidate });
            }
        };

        pc.onicegatheringstatechange = () => {
            console.log("ICE gathering state:", pc.iceGatheringState);
        };

        pc.ontrack = (event) => {
            console.log("Got remote track:", event.track.kind, event.streams[0]?.id);
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection state changed:", pc.connectionState);
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

                    // Process queued candidates
                    if (iceCandidateQueueRef.current.length > 0) {
                        console.log(`Processing ${iceCandidateQueueRef.current.length} queued candidates`);
                        iceCandidateQueueRef.current.forEach(async (cand) => {
                            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
                        });
                        iceCandidateQueueRef.current = [];
                    }

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

                    setCall(prev => ({ ...prev, status: 'connected', startTime: Date.now() }));

                    // Process queued candidates
                    if (iceCandidateQueueRef.current.length > 0) {
                        console.log(`Processing ${iceCandidateQueueRef.current.length} queued candidates`);
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
            console.log("Received remote ICE candidate");
            if (pcRef.current && pcRef.current.remoteDescription) {
                try {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            } else {
                console.log("Queueing ICE candidate - remote description not set");
                iceCandidateQueueRef.current.push(candidate);
            }
        } else if (type === 'hangup') {
            soundService.stopRinging();
            endCall(payload.reason, true);
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

            const pc = createPeerConnection(call.partner.id, call.isVideo);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Process queued candidates
            if (iceCandidateQueueRef.current.length > 0) {
                console.log(`Processing ${iceCandidateQueueRef.current.length} queued candidates`);
                iceCandidateQueueRef.current.forEach(async (cand) => {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
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
        // We do this BEFORE closing PC to ensure it has the best chance of sending
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
        // We use a unique ID for the call if we have one, or just a timestamp
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
                    // Only log if it's not a remote hangup (which usually means a rejection or timeout)
                    // OR if it's specifically a rejection/timeout reason
                    if (reason === 'timeout') {
                        await createMessage(threadId, user.id, `[CALL_MISSED]${currentCall.isVideo ? 'video' : 'voice'} call`, null, null);
                    } else if (reason === 'rejected') {
                        await createMessage(threadId, user.id, `[CALL_REJECTED]${currentCall.isVideo ? 'video' : 'voice'} call`, null, null);
                    } else if (currentCall.status === 'calling' && !isRemote) {
                        // Caller hung up before answer
                        await createMessage(threadId, user.id, `[CALL_CANCELLED]${currentCall.isVideo ? 'video' : 'voice'} call`, null, null);
                    }
                }
                await loadThreads();
            } catch (err) {
                console.error("Failed to record call status message:", err);
            }
        } else if (!currentCall.isInitiator) {
            // Receiver side: just refresh to see the initiator's message
            setTimeout(() => loadThreads(), 2000);
        }

        // Reset the ending flag after a short delay to allow for the next call
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
                payload: { from: user.id, ...safeSignalData }
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

