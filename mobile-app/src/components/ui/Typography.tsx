import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps, StyleProp } from 'react-native';
import { Colors, Typography as TypographyStyles } from '../../theme/Theme';

interface CustomTextProps extends TextProps {
    style?: StyleProp<TextStyle>;
    children: React.ReactNode;
}

export const H1: React.FC<CustomTextProps> = ({ children, style, ...props }) => (
    <Text style={[styles.base, TypographyStyles.h1, style]} {...props}>{children}</Text>
);

export const H2: React.FC<CustomTextProps> = ({ children, style, ...props }) => (
    <Text style={[styles.base, TypographyStyles.h2, style]} {...props}>{children}</Text>
);

export const H3: React.FC<CustomTextProps> = ({ children, style, ...props }) => (
    <Text style={[styles.base, TypographyStyles.h3, style]} {...props}>{children}</Text>
);

export const Body: React.FC<CustomTextProps> = ({ children, style, ...props }) => (
    <Text style={[styles.base, TypographyStyles.body, style]} {...props}>{children}</Text>
);

export const BodyBold: React.FC<CustomTextProps> = ({ children, style, ...props }) => (
    <Text style={[styles.base, TypographyStyles.bodyBold, style]} {...props}>{children}</Text>
);

export const Muted: React.FC<CustomTextProps> = ({ children, style, ...props }) => (
    <Text style={[styles.base, TypographyStyles.muted, style]} {...props}>{children}</Text>
);

const styles = StyleSheet.create({
    base: {
        color: Colors.dark.textPrimary,
    }
});
