import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export const AudioBubble = ({ id, url, isMe, currentlyPlayingId, onTogglePlay }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(new Audio(url));

    useEffect(() => {
        const audio = audioRef.current;

        // Update source if URL changed (e.g. from blob to final)
        if (audio.src !== url) {
            audio.src = url;
            audio.load();
            setIsPlaying(false);
            setCurrentTime(0);
        }

        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        const handleError = (e) => console.error("Audio playback error:", e);

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.pause();
        };
    }, [url]);

    // Cleanup: pause if someone else starts playing
    useEffect(() => {
        if (currentlyPlayingId && currentlyPlayingId !== id && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [currentlyPlayingId, id, isPlaying]);

    const togglePlay = (e) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play();
            setIsPlaying(true);
        }
        if (onTogglePlay) onTogglePlay();
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (currentTime / duration) * 100 || 0;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            minWidth: '200px', padding: '0.25rem 0'
        }}>
            <button
                onClick={togglePlay}
                style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                    color: isMe ? 'white' : 'white',
                    border: 'none', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                }}
            >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = x / rect.width;
                        const newTime = percentage * duration;
                        audioRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                    }}
                    style={{
                        height: '6px', background: isMe ? 'rgba(255,255,255,0.3)' : 'rgba(99,102,241,0.1)',
                        borderRadius: '3px', position: 'relative', overflow: 'hidden', cursor: 'pointer',
                        marginTop: '4px'
                    }}
                >
                    <div style={{
                        height: '100%', background: isMe ? 'white' : 'var(--primary)',
                        width: `${progress}%`, transition: 'width 0.1s linear'
                    }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.8 }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <Volume2 size={14} style={{ opacity: 0.6 }} />
        </div>
    );
};
