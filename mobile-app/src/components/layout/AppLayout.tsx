import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';
import { Colors } from '../../theme/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useMessages } from '../../context/MessagesContext';
import { CallModal } from '../messages/CallModal';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { call, acceptCall, endCall } = useMessages();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Gradients (Mirroring Web) */}
            <View style={StyleSheet.absoluteFill}>
                <View style={[styles.bgBase, { backgroundColor: Colors.dark.bgBase }]} />
                <LinearGradient
                    colors={['rgba(99, 102, 241, 0.05)', 'transparent']}
                    style={styles.gradientTopLeft}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <LinearGradient
                    colors={['rgba(236, 72, 153, 0.05)', 'transparent']}
                    style={styles.gradientBottomRight}
                    start={{ x: 1, y: 1 }}
                    end={{ x: 0, y: 0 }}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {children}
                </View>
            </SafeAreaView>

            {call && (
                <CallModal
                    isOpen={!!call}
                    isIncoming={call.status === 'incoming'}
                    callerName={call.partner.name}
                    callerAvatar={call.partner.avatar}
                    isVideoCall={call.isVideo}
                    onAccept={acceptCall}
                    onReject={endCall}
                    onClose={endCall}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    bgBase: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    gradientTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '60%',
    },
    gradientBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '100%',
        height: '60%',
    }
});
