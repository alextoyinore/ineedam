import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

export const CallModal = ({
    isOpen,
    onClose,
    isIncoming,
    callerName,
    callerAvatar,
    onAccept,
    onReject,
    remoteStream,
    localStream,
    isVideoCall,
    onToggleVideo
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(!isVideoCall);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'calling');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isOpen]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            console.log("Setting remote stream to video element");
            remoteVideoRef.current.srcObject = remoteStream;

            const updateTrackStatus = () => {
                const videoTrack = remoteStream.getVideoTracks()[0];
                setHasRemoteVideo(!!videoTrack && videoTrack.enabled && videoTrack.readyState === 'live');
                console.log("Remote video track status:", videoTrack?.enabled, videoTrack?.readyState);
            };

            updateTrackStatus();
            remoteStream.onaddtrack = updateTrackStatus;
            remoteStream.onremovetrack = updateTrackStatus;

            setCallStatus('connected');
        }
    }, [remoteStream]);

    const handleToggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const handleToggleVideo = () => {
        if (onToggleVideo) {
            onToggleVideo();
        } else if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white'
                }}
            >
                <div style={{
                    width: isFullScreen || isMobile ? '100vw' : '90vw',
                    height: isFullScreen || isMobile ? '100vh' : '80vh',
                    maxWidth: isFullScreen || isMobile ? 'none' : '1000px',
                    maxHeight: isFullScreen || isMobile ? 'none' : '700px',
                    background: '#1a1a1a', borderRadius: isFullScreen ? 0 : '24px',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                }}>

                    {/* Remote Video (Main) */}
                    <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Always have video element for audio playback, but hide if no video track */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: hasRemoteVideo ? 'block' : 'none'
                            }}
                        />

                        {!hasRemoteVideo && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
                                background: 'radial-gradient(circle at center, #2d2d2d 0%, #1a1a1a 100%)'
                            }}>
                                <motion.div
                                    animate={callStatus !== 'connected' ? {
                                        scale: [1, 1.1, 1],
                                        opacity: [0.5, 1, 0.5]
                                    } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    style={{
                                        width: '120px', height: '120px', borderRadius: '50%',
                                        background: callerAvatar ? `url(${callerAvatar}) center/cover` : 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '3rem', fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 0 40px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {!callerAvatar && callerName?.charAt(0)}
                                </motion.div>
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>{callerName}</h2>
                                    <p style={{ opacity: 0.7, textTransform: 'capitalize', letterSpacing: '0.05em', fontSize: '0.9rem' }}>
                                        {callStatus === 'incoming' ? 'Incoming call...' :
                                            callStatus === 'calling' ? 'Calling...' :
                                                callStatus === 'connected' ? 'Connected' : 'Connecting...'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Local Video (PiP) - Only show if video is ON */}
                    <AnimatePresence>
                        {localStream && !isVideoOff && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                style={{
                                    position: 'absolute',
                                    bottom: isMobile ? '1rem' : '2rem',
                                    right: isMobile ? '1rem' : '2rem',
                                    width: isMobile ? '100px' : '150px',
                                    height: isMobile ? '140px' : '200px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    background: '#333',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                    zIndex: 50
                                }}
                            >
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div style={{
                    padding: isMobile ? '1rem' : '1.5rem 2rem',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center',
                    gap: isMobile ? '1rem' : '1.5rem'
                }}>
                    {callStatus === 'incoming' ? (
                        <>
                            <button
                                onClick={onReject}
                                style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: '#ef4444', border: 'none', color: 'white',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <PhoneOff size={24} />
                            </button>
                            <button
                                onClick={onAccept}
                                style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: '#22c55e', border: 'none', color: 'white',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {isVideoCall ? <Video size={24} /> : <Phone size={24} />}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleToggleMute}
                                style={{
                                    width: '50px', height: '50px', borderRadius: '50%',
                                    background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                    border: 'none', color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            {isVideoCall && (
                                <button
                                    onClick={handleToggleVideo}
                                    style={{
                                        width: '50px', height: '50px', borderRadius: '50%',
                                        background: isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                        border: 'none', color: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                                </button>
                            )}

                            <button
                                onClick={onReject || onClose}
                                style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: '#ef4444', border: 'none', color: 'white',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Phone size={28} style={{ transform: 'rotate(135deg)' }} />
                            </button>

                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                style={{
                                    width: '50px', height: '50px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none', color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
