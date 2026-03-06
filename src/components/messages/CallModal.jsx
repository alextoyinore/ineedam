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
    status,
    isVideoCall,
    onToggleVideo,
    secondaryCall,
    remoteParticipants = {},
    onAddToCall,
    onRejectSecondary
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
        if (status) {
            setCallStatus(status);
        }
    }, [status]);

    const participantColors = [
        'rgba(99, 102, 241, 0.1)',   // Indigo
        'rgba(34, 197, 94, 0.1)',    // Green
        'rgba(239, 68, 68, 0.1)',    // Red
        'rgba(245, 158, 11, 0.1)',   // Amber
        'rgba(139, 92, 246, 0.1)',   // Violet
        'rgba(236, 72, 153, 0.1)'    // Pink
    ];

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
                        <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', height: '100%', gap: '2px', background: '#111' }}>
                            {Object.entries(remoteParticipants).map(([userId, p], index) => (
                                <div key={userId} style={{
                                    flex: Object.keys(remoteParticipants).length > 1 ? '1 1 calc(50% - 2px)' : '1 1 100%',
                                    position: 'relative',
                                    height: Object.keys(remoteParticipants).length > 2 ? '50%' : '100%',
                                    background: participantColors[index % participantColors.length],
                                    overflow: 'hidden'
                                }}>
                                    {p.stream ? (
                                        <video
                                            autoPlay
                                            playsInline
                                            ref={el => { if (el) el.srcObject = p.stream; }}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '80px', height: '80px', borderRadius: '50%',
                                                background: p.avatar ? `url(${p.avatar}) center/cover` : 'rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '2px solid rgba(255,255,255,0.2)'
                                            }}>
                                                {!p.avatar && <User size={40} style={{ opacity: 0.2 }} className="text-white" />}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                                                {p.name || 'Participant'}
                                            </div>
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute', bottom: '1rem', left: '1rem',
                                        background: 'rgba(0,0,0,0.6)', padding: '0.4rem 0.8rem',
                                        borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {p.avatar && <img src={p.avatar} style={{ width: '16px', height: '16px', borderRadius: '50%' }} alt="" />}
                                        {p.name || `Participant ${index + 1}`}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Secondary Call Overlay */}
                        {secondaryCall && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
                            }}>
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{
                                        background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '24px', padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center'
                                    }}
                                >
                                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            background: secondaryCall.partner.avatar ? `url(${secondaryCall.partner.avatar}) center/cover` : 'var(--primary)',
                                            border: '2px solid var(--primary)', animation: 'pulse 2s infinite'
                                        }}>
                                            {!secondaryCall.partner.avatar && <User size={40} style={{ margin: '18px' }} />}
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{secondaryCall.partner.name}</h3>
                                    <p style={{ opacity: 0.6, fontSize: '0.875rem', marginBottom: '2rem' }}>is calling you...</p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={onRejectSecondary}
                                            style={{
                                                flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600
                                            }}
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={onAddToCall}
                                            style={{
                                                flex: 1, padding: '1rem', borderRadius: '12px', background: 'var(--primary)',
                                                color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            <Plus size={18} /> Add to call
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}

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
