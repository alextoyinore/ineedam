import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme/Theme';
import { GlassPanel } from './GlassPanel';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'glass' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle
}) => {
    const isDisabled = disabled || loading;

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[styles.container, style]}
            >
                <LinearGradient
                    colors={Colors.gradients.primary as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={[styles.text, styles.primaryText, textStyle]}>{title}</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (variant === 'glass') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.7}
                style={[styles.container, style]}
            >
                <GlassPanel intensity={20} borderRadius={999} style={styles.glassInner}>
                    {loading ? (
                        <ActivityIndicator color={Colors.dark.textPrimary} size="small" />
                    ) : (
                        <Text style={[styles.text, textStyle]}>{title}</Text>
                    )}
                </GlassPanel>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
                styles.container,
                variant === 'secondary' && styles.secondary,
                isDisabled && styles.disabled,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={Colors.dark.textPrimary} size="small" />
            ) : (
                <Text style={[
                    styles.text,
                    variant === 'ghost' && styles.ghostText,
                    textStyle
                ]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        borderRadius: 999,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradient: {
        paddingHorizontal: Spacing.xl,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        ...Typography.bodyBold,
        color: Colors.dark.textPrimary,
    },
    primaryText: {
        color: '#fff',
    },
    secondary: {
        backgroundColor: Colors.dark.bgSurface,
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    glassInner: {
        paddingHorizontal: Spacing.xl,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ghostText: {
        color: Colors.dark.textMuted,
    },
    disabled: {
        opacity: 0.5,
    }
});
