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

    const ControlsContent = () => (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobile ? '1.25rem' : '2rem'
        }}>
            {callStatus === 'incoming' ? (
                <>
                    <button
                        onClick={onReject}
                        style={{
                            width: isMobile ? '65px' : '75px', height: isMobile ? '65px' : '75px', borderRadius: '50%',
                            background: '#ef4444', border: 'none', color: 'white',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <PhoneOff size={isMobile ? 24 : 30} />
                    </button>
                    <button
                        onClick={onAccept}
                        style={{
                            width: isMobile ? '65px' : '75px', height: isMobile ? '65px' : '75px', borderRadius: '50%',
                            background: '#22c55e', border: 'none', color: 'white',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
                        }}
                    >
                        {isVideoCall ? <Video size={isMobile ? 24 : 30} /> : <Phone size={isMobile ? 24 : 30} />}
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={handleToggleMute}
                        style={{
                            width: isMobile ? '55px' : '60px', height: isMobile ? '55px' : '60px', borderRadius: '50%',
                            background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.15)',
                            border: 'none', color: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        {isMuted ? <MicOff size={isMobile ? 20 : 24} /> : <Mic size={isMobile ? 20 : 24} />}
                    </button>

                    {isVideoCall && (
                        <button
                            onClick={handleToggleVideo}
                            style={{
                                width: isMobile ? '55px' : '60px', height: isMobile ? '55px' : '60px', borderRadius: '50%',
                                background: isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.15)',
                                border: 'none', color: 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(5px)'
                            }}
                        >
                            {isVideoOff ? <VideoOff size={isMobile ? 20 : 24} /> : <Video size={isMobile ? 20 : 24} />}
                        </button>
                    )}

                    <button
                        onClick={onReject || onClose}
                        style={{
                            width: isMobile ? '65px' : '70px', height: isMobile ? '65px' : '70px', borderRadius: '50%',
                            background: '#ef4444', border: 'none', color: 'white',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                        }}
                    >
                        <Phone size={isMobile ? 28 : 32} style={{ transform: 'rotate(135deg)' }} />
                    </button>

                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        style={{
                            width: isMobile ? '55px' : '60px', height: isMobile ? '55px' : '60px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            border: 'none', color: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        {isFullScreen ? <Minimize2 size={isMobile ? 20 : 24} /> : <Maximize2 size={isMobile ? 20 : 24} />}
                    </button>
                </>
            )}
        </div>
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.95)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white'
                }}
            >
                <div style={{
                    width: isFullScreen || isMobile ? '100vw' : '90vw',
                    height: isFullScreen || isMobile ? '100vh' : '80vh',
                    maxWidth: isFullScreen || isMobile ? 'none' : '1000px',
                    maxHeight: isFullScreen || isMobile ? 'none' : '700px',
                    background: '#000', borderRadius: isFullScreen || isMobile ? 0 : '24px',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                }}>

                    {/* Main Content Area */}
                    <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', flexDirection: 'column' }}>
                        {/* Always have video element for audio playback, but hide if no video track */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: hasRemoteVideo ? 'block' : 'none',
                                position: hasRemoteVideo ? 'relative' : 'absolute'
                            }}
                        />

                        {!hasRemoteVideo ? (
                            <div style={{
                                flex: 1,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '3rem',
                                background: 'radial-gradient(circle at center, #2d2d2d 0%, #1a1a1a 100%)',
                                padding: '2rem'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                    <motion.div
                                        animate={callStatus !== 'connected' ? {
                                            scale: [1, 1.05, 1],
                                            boxShadow: [
                                                '0 0 20px rgba(99, 102, 241, 0.2)',
                                                '0 0 60px rgba(99, 102, 241, 0.4)',
                                                '0 0 20px rgba(99, 102, 241, 0.2)'
                                            ]
                                        } : {}}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        style={{
                                            width: isMobile ? '140px' : '180px', height: isMobile ? '140px' : '180px', borderRadius: '50%',
                                            background: callerAvatar ? `url(${callerAvatar}) center/cover` : 'var(--primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '3.5rem', fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        {!callerAvatar && callerName?.charAt(0)}
                                    </motion.div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>{callerName}</h2>
                                        <p style={{ opacity: 0.8, textTransform: 'capitalize', letterSpacing: '0.1em', fontSize: '1.1rem', fontWeight: 500 }}>
                                            {callStatus === 'incoming' ? 'Incoming call...' :
                                                callStatus === 'calling' ? 'Calling...' :
                                                    callStatus === 'connected' ? 'Connected' : 'Connecting...'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <ControlsContent />
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                padding: isMobile ? '3rem 1rem' : '3rem',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                                display: 'flex', justifyContent: 'center', zIndex: 60
                            }}>
                                <ControlsContent />
                            </div>
                        )}
                    </div>

                    {/* Local Video (PiP) */}
                    <AnimatePresence>
                        {localStream && !isVideoOff && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                style={{
                                    position: 'absolute',
                                    bottom: isMobile ? (hasRemoteVideo ? '8rem' : '2rem') : '2rem',
                                    right: isMobile ? '1.5rem' : '2.5rem',
                                    width: isMobile ? '110px' : '160px',
                                    height: isMobile ? '150px' : '220px',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    background: '#333',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
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
            </motion.div>
        </AnimatePresence>
    );
};
