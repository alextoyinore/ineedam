import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2, Plus, User } from 'lucide-react';
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
    localStream,
    remoteStream,
    status,
    isVideoCall,
    onToggleVideo,
    localName,
    localAvatar
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(!isVideoCall);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'calling');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const isConnected = callStatus === 'connected';

    useEffect(() => {
        setIsVideoOff(!isVideoCall);
    }, [isVideoCall]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Track state to ensure refs are updated when UI components mount/unmount during mode switches
    const isVideoViewActive = isConnected && isVideoCall && !isVideoOff;

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isOpen, isVideoViewActive]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, isVideoViewActive]);

    useEffect(() => {
        if (status) {
            setCallStatus(status);
        }
    }, [status]);

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

                    <button
                        onClick={handleToggleVideo}
                        style={{
                            width: isMobile ? '55px' : '60px', height: isMobile ? '55px' : '60px', borderRadius: '50%',
                            background: (isVideoOff || !isVideoCall) ? '#ef4444' : 'rgba(255,255,255,0.15)',
                            border: 'none', color: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        {(isVideoOff || !isVideoCall) ? <VideoOff size={isMobile ? 20 : 24} /> : <Video size={isMobile ? 20 : 24} />}
                    </button>

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
                    {/* Persistent Remote Audio Element (Hidden) to ensure audio plays when video is hidden/unmounted */}
                    {remoteStream && (
                        <audio
                            autoPlay
                            playsInline
                            ref={el => { if (el) el.srcObject = remoteStream; }}
                            style={{ display: 'none' }}
                        />
                    )}

                    {/* Main Content Area */}
                    <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', flexDirection: 'column' }}>

                        {(!isVideoCall || (isConnected && isVideoOff)) ? (
                            /* Pulsating Avatar UI (Incoming, Calling, or Audio-Only Connected) */
                            <div style={{
                                flex: 1,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '3rem',
                                background: 'radial-gradient(circle at center, #2d2d2d 0%, #1a1a1a 100%)',
                                padding: '2rem'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                    <motion.div
                                        animate={isConnected || callStatus === 'calling' || callStatus === 'incoming' ? {
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
                                        {!callerAvatar && (typeof callerName === 'string' ? callerName.charAt(0) : '?')}
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
                            </div>
                        ) : isConnected ? (
                            /* Connected Video Screen (PIP Layout) */
                            <div style={{ position: 'relative', width: '100%', height: '100%', background: '#111', overflow: 'hidden' }}>
                                {/* Main Remote View */}
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    {remoteStream ? (
                                        <video
                                            autoPlay
                                            playsInline
                                            ref={remoteVideoRef}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'rgba(99, 102, 241, 0.1)' }}>
                                            <div style={{
                                                width: '120px', height: '120px', borderRadius: '50%',
                                                background: callerAvatar ? `url(${callerAvatar}) center/cover` : 'rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '2px solid rgba(255,255,255,0.2)'
                                            }}>
                                                {!callerAvatar && <User size={60} style={{ opacity: 0.2 }} className="text-white" />}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
                                                {callerName}
                                            </div>
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute', bottom: '1.5rem', left: '1.5rem',
                                        background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem',
                                        borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {callerAvatar && <img src={callerAvatar} style={{ width: '20px', height: '20px', borderRadius: '50%' }} alt="" />}
                                        {callerName}
                                    </div>
                                </div>

                                {/* Local PIP View */}
                                <motion.div
                                    drag
                                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                    style={{
                                        position: 'absolute', top: '1.5rem', right: '1.5rem',
                                        width: isMobile ? '100px' : '180px', height: isMobile ? '140px' : '240px',
                                        borderRadius: '16px', overflow: 'hidden', background: '#222',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                                        zIndex: 10
                                    }}
                                >
                                    {localStream ? (
                                        <video
                                            autoPlay
                                            playsInline
                                            muted
                                            ref={localVideoRef}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34, 197, 94, 0.1)' }}>
                                            {localAvatar ? (
                                                <img src={localAvatar} style={{ width: '50px', height: '50px', borderRadius: '50%' }} alt="" />
                                            ) : (
                                                <User size={30} style={{ opacity: 0.2 }} />
                                            )}
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', fontSize: '0.7rem', color: 'white', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '10px' }}>
                                        You
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            /* Video Call - Not Yet Connected Screen */
                            <div style={{
                                flex: 1,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '3rem',
                                background: 'radial-gradient(circle at center, #2d2d2d 0%, #1a1a1a 100%)',
                                padding: '2rem'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            boxShadow: [
                                                '0 0 20px rgba(99, 102, 241, 0.2)',
                                                '0 0 60px rgba(99, 102, 241, 0.4)',
                                                '0 0 20px rgba(99, 102, 241, 0.2)'
                                            ]
                                        }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        style={{
                                            width: isMobile ? '140px' : '180px', height: isMobile ? '140px' : '180px', borderRadius: '50%',
                                            background: callerAvatar ? `url(${callerAvatar}) center/cover` : 'var(--primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '3.5rem', fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        {!callerAvatar && (typeof callerName === 'string' ? callerName.charAt(0) : '?')}
                                    </motion.div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>{callerName}</h2>
                                        <p style={{ opacity: 0.8, textTransform: 'capitalize', letterSpacing: '0.1em', fontSize: '1.1rem', fontWeight: 500 }}>
                                            {callStatus === 'incoming' ? 'Incoming video call...' :
                                                callStatus === 'calling' ? 'Calling...' : 'Connecting...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Floated Actions - ALWAYS Absolutely Positioned at bottom */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: isMobile ? '2rem 1rem' : '3rem',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                            display: 'flex', justifyContent: 'center', zIndex: 110,
                            pointerEvents: 'none'
                        }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <ControlsContent />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
