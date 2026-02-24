import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Text as SvgText } from 'react-native-svg';

interface BrandLogoProps {
    width?: number;
    height?: number;
    style?: ViewStyle;
    showText?: boolean;
}

export function BrandLogo({ width = 240, height = 64, style, showText = true }: BrandLogoProps) {
    // Scale factor based on the original SVG dimensions (240x64)
    const scale = width / 240;
    const scaledHeight = 64 * scale;

    return (
        <View style={style}>
            <Svg width={width} height={scaledHeight} viewBox="0 0 240 64" fill="none">
                <Defs>
                    <LinearGradient id="iconGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="#6366f1" />
                        <Stop offset="1" stopColor="#ec4899" />
                    </LinearGradient>
                    <LinearGradient id="textGradient" x1="60" y1="20" x2="240" y2="20" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="#6366f1" />
                        <Stop offset="0.5" stopColor="#ec4899" />
                        <Stop offset="1" stopColor="#14b8a6" />
                    </LinearGradient>
                </Defs>

                {/* Icon Mark */}
                <Rect width="48" height="48" x="0" y="8" rx="12" fill="url(#iconGradient)" />
                <Rect width="8" height="24" x="20" y="20" rx="4" fill="white" />

                {/* Gradient Text */}
                {showText && (
                    <SvgText
                        x="56"
                        y="46"
                        fill="url(#textGradient)"
                        fontSize="44"
                        fontWeight="900"
                        fontFamily="System"
                    >
                        Ineedam
                    </SvgText>
                )}
            </Svg>
        </View>
    );
}
