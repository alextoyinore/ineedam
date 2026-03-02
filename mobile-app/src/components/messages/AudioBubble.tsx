import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, Volume2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Colors, Spacing } from '../../theme/Theme';
import { Muted, BodyBold } from '../ui/Typography';

interface AudioBubbleProps {
    url: string;
    isMe: boolean;
    duration?: string;
}

export const AudioBubble: React.FC<AudioBubbleProps> = ({ url, isMe, duration }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [durationMillis, setDurationMillis] = useState(0);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: false },
            onPlaybackStatusUpdate
        );
        setSound(sound);
        return sound;
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDurationMillis(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
            }
        }
    };

    const handlePlayPause = async () => {
        if (isPlaying) {
            await sound?.pauseAsync();
        } else {
            if (!sound) {
                const s = await loadSound();
                await s.playAsync();
            } else {
                await sound.playAsync();
            }
        }
    };

    const progress = durationMillis > 0 ? (position / durationMillis) * 100 : 0;

    return (
        <View style={[
            styles.container,
            { backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)' }
        ]}>
            <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn}>
                {isPlaying ? (
                    <Pause size={18} color={isMe ? '#fff' : Colors.dark.primary} fill={isMe ? '#fff' : Colors.dark.primary} />
                ) : (
                    <Play size={18} color={isMe ? '#fff' : Colors.dark.primary} fill={isMe ? '#fff' : Colors.dark.primary} />
                )}
            </TouchableOpacity>

            <View style={styles.trackContainer}>
                <View style={styles.track}>
                    <View style={[styles.progress, { width: `${progress}%`, backgroundColor: isMe ? '#fff' : Colors.dark.primary }]} />
                </View>
                <View style={styles.meta}>
                    <Volume2 size={12} color={isMe ? 'rgba(255,255,255,0.6)' : Colors.dark.textMuted} />
                    <Muted style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.6)' : Colors.dark.textMuted }}>
                        {duration || 'Voice Note'}
                    </Muted>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 16,
        width: 200,
        gap: 12,
    },
    playBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackContainer: {
        flex: 1,
        gap: 4,
    },
    track: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    }
});
