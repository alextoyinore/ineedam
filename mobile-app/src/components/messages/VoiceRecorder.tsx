import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Mic, X, Send, Trash2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Colors, Spacing } from '../../theme/Theme';
import { Body, Muted } from '../ui/Typography';
import { GlassPanel } from '../ui/GlassPanel';

interface VoiceRecorderProps {
    onSend: (uri: string, duration: number) => void;
    onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [duration, setDuration] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                ])
            ).start();
        } else {
            clearInterval(interval);
            pulseAnim.setValue(1);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
                setIsRecording(true);
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
            onSend(uri, duration);
        }
        setRecording(null);
        setDuration(0);
    };

    const cancelRecording = async () => {
        if (recording) {
            await recording.stopAndUnloadAsync();
            setRecording(null);
        }
        setIsRecording(false);
        setDuration(0);
        onCancel();
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        startRecording();
        return () => {
            if (recording) recording.stopAndUnloadAsync();
        };
    }, []);

    return (
        <GlassPanel intensity={30} style={styles.container}>
            <View style={styles.recorderContent}>
                <TouchableOpacity onPress={cancelRecording} style={styles.cancelBtn}>
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>

                <View style={styles.info}>
                    <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
                    <Body style={styles.timer}>{formatTime(duration)}</Body>
                    <Muted>Recording...</Muted>
                </View>

                <TouchableOpacity onPress={stopRecording} style={styles.sendBtn}>
                    <View style={styles.sendIconBg}>
                        <Send size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>
        </GlassPanel>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
        borderRadius: 24,
        height: 60,
    },
    recorderContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    cancelBtn: {
        padding: 10,
    },
    info: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    pulseCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ef4444',
    },
    timer: {
        fontWeight: '700',
        fontSize: 16,
    },
    sendBtn: {
        padding: 2,
    },
    sendIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.dark.primary,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
