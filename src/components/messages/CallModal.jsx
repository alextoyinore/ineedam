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
    isVideoCall
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(!isVideoCall);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'calling');

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isOpen]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteStream.getTracks().forEach(track => {
                console.log('Remote track:', track.kind, track.enabled);
            });
            remoteVideoRef.current.srcObject = remoteStream;
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
        if (localStream) {
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
                    width: isFullScreen ? '100vw' : '90vw',
                    height: isFullScreen ? '100vh' : '80vh',
                    maxWidth: isFullScreen ? 'none' : '1000px',
                    maxHeight: isFullScreen ? 'none' : '700px',
                    background: '#1a1a1a', borderRadius: isFullScreen ? 0 : '24px',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                }}>

                    {/* Remote Video (Main) */}
                    <div style={{ flex: 1, position: 'relative', background: '#000' }}>
                        {remoteStream ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <div style={{
                                height: '100%', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '1.5rem'
                            }}>
                                <div style={{
                                    width: '120px', height: '120px', borderRadius: '50%',
                                    background: callerAvatar ? `url(${callerAvatar}) center/cover` : 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '3rem', fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.1)'
                                }}>
                                    {!callerAvatar && callerName?.charAt(0)}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{callerName}</h2>
                                    <p style={{ opacity: 0.7, textTransform: 'capitalize' }}>
                                        {callStatus === 'incoming' ? 'Incoming call...' :
                                            callStatus === 'calling' ? 'Calling...' : 'Connecting...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Local Video (PiP) */}
                        {localStream && (
                            <div style={{
                                position: 'absolute', bottom: '2rem', right: '2rem',
                                width: '150px', height: '200px', borderRadius: '12px',
                                overflow: 'hidden', background: '#333', border: '2px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                            }}>
                                {isVideoOff ? (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                        <VideoOff size={24} />
                                    </div>
                                ) : (
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div style={{
                        padding: '1.5rem 2rem', background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', gap: '1.5rem'
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
                                        width: '60px', height: '60px', borderRadius: '30px',
                                        background: '#ef4444', border: 'none', color: 'white',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', padding: '0 1.5rem', gap: '0.5rem'
                                    }}
                                >
                                    <PhoneOff size={24} />
                                    <span style={{ fontWeight: 600 }}>End Call</span>
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
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
