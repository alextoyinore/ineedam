import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceRecorder = ({ onSend, onCancel, onStartRecording }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [previewTime, setPreviewTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioPlayerRef = useRef(new Audio());

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                audioPlayerRef.current.src = url;
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            if (onStartRecording) onStartRecording();
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTogglePlayback = () => {
        if (isPlaying) {
            audioPlayerRef.current.pause();
            setIsPlaying(false);
        } else {
            // Signal to others to pause
            if (onStartRecording) onStartRecording();
            audioPlayerRef.current.play();
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        const player = audioPlayerRef.current;
        const handleEnded = () => setIsPlaying(false);
        const handleTimeUpdate = () => setPreviewTime(player.currentTime);

        player.addEventListener('ended', handleEnded);
        player.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            player.removeEventListener('ended', handleEnded);
            player.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

    const handleSend = () => {
        if (audioBlob) {
            onSend(audioBlob, recordingTime);
            reset();
        }
    };

    const reset = () => {
        setAudioBlob(null);
        setRecordingTime(0);
        setPreviewTime(0);
        setIsRecording(false);
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 1.25rem', borderRadius: '9999px',
                background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                width: '100%', marginBottom: '0.5rem'
            }}
        >
            {!audioBlob ? (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: '#ef4444',
                            animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                        }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', minWidth: '40px' }}>
                            {formatTime(recordingTime)}
                        </span>
                        {isRecording && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Recording...
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                        >
                            <Trash2 size={18} />
                        </button>

                        {!isRecording ? (
                            <button
                                type="button"
                                onClick={startRecording}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'var(--primary)', color: 'white', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <Mic size={18} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={stopRecording}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: '#ef4444', color: 'white', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <Square size={16} fill="white" />
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={handleTogglePlayback}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </button>

                    <div
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percentage = x / rect.width;
                            const player = audioPlayerRef.current;
                            if (player.duration) {
                                player.currentTime = percentage * player.duration;
                                setPreviewTime(player.currentTime);
                            }
                        }}
                        style={{ flex: 1, height: '6px', background: 'rgba(99,102,241,0.1)', borderRadius: '3px', position: 'relative', cursor: 'pointer' }}
                    >
                        <div
                            style={{
                                height: '100%', background: 'var(--primary)', borderRadius: '3px',
                                width: `${(previewTime / (audioPlayerRef.current.duration || recordingTime)) * 100}%`
                            }}
                        />
                    </div>

                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatTime(previewTime || recordingTime)}</span>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={reset}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                        >
                            <Trash2 size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={handleSend}
                            style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'var(--primary)', color: 'white', border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </>
            )}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </motion.div>
    );
};
