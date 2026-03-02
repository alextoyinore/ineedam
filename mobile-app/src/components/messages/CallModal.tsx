import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Modal,
    Dimensions,
    Platform
} from 'react-native';
import {
    Phone, PhoneOff, Video, VideoOff,
    Mic, MicOff, Maximize2, Minimize2, X
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Muted, H2, Body } from '../ui/Typography';
import { Colors, Spacing } from '../../theme/Theme';
import { LinearGradient } from 'expo-linear-gradient';

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    isIncoming: boolean;
    callerName: string;
    callerAvatar?: string;
    isVideoCall: boolean;
    onAccept: () => void;
    onReject: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
    isOpen,
    onClose,
    isIncoming,
    callerName,
    callerAvatar,
    isVideoCall,
    onAccept,
    onReject
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(!isVideoCall);

    if (!isOpen) return null;

    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Background / Video Placeholder */}
                <View style={styles.videoContainer}>
                    <LinearGradient
                        colors={['#1a1a2e', '#16213e']}
                        style={StyleSheet.absoluteFill}
                    />

                    <View style={styles.callerInfo}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: callerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400' }}
                                style={styles.avatar}
                            />
                        </View>
                        <H2 style={styles.callerName}>{callerName}</H2>
                        <Muted style={styles.callStatus}>
                            {isIncoming ? 'Incoming Call...' : 'Calling...'}
                        </Muted>
                    </View>
                </View>

                {/* Controls */}
                <BlurView intensity={80} tint="dark" style={styles.controls}>
                    {isIncoming ? (
                        <View style={styles.incomingControls}>
                            <TouchableOpacity onPress={onReject} style={[styles.controlBtn, styles.declineBtn]}>
                                <PhoneOff size={28} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onAccept} style={[styles.controlBtn, styles.acceptBtn]}>
                                {isVideoCall ? <Video size={28} color="#fff" /> : <Phone size={28} color="#fff" />}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.activeControls}>
                            <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.actionBtn}>
                                {isMuted ? <MicOff size={24} color="#fff" /> : <Mic size={24} color="#fff" />}
                            </TouchableOpacity>

                            {isVideoCall && (
                                <TouchableOpacity onPress={() => setIsVideoOff(!isVideoOff)} style={styles.actionBtn}>
                                    {isVideoOff ? <VideoOff size={24} color="#fff" /> : <Video size={24} color="#fff" />}
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity onPress={onReject} style={[styles.controlBtn, styles.declineBtn]}>
                                <PhoneOff size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </BlurView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    callerInfo: {
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    callerName: {
        fontSize: 28,
        color: '#fff',
    },
    callStatus: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
    },
    controls: {
        paddingBottom: Platform.OS === 'ios' ? 60 : 40,
        paddingTop: 30,
        paddingHorizontal: 40,
    },
    incomingControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    activeControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    controlBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptBtn: {
        backgroundColor: '#22c55e',
    },
    declineBtn: {
        backgroundColor: '#ef4444',
    },
    actionBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
