import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../theme/Theme';

interface GlassPanelProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    borderRadius?: number;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
    children,
    style,
    intensity = 40,
    tint = 'dark',
    borderRadius = 16
}) => {
    return (
        <View style={[styles.container, { borderRadius }, style]}>
            {Platform.OS === 'ios' ? (
                <BlurView
                    intensity={intensity}
                    tint={tint}
                    style={[StyleSheet.absoluteFill, { borderRadius }]}
                />
            ) : (
                <View style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: Colors.dark.bgSurfaceGlass,
                        borderRadius
                    }
                ]} />
            )}
            <View style={[
                styles.content,
                {
                    borderColor: Colors.dark.borderGlass,
                    borderRadius
                }
            ]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    content: {
        borderWidth: 1,
        flex: 1,
    }
});
