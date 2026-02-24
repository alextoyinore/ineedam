import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogo } from '@/components/ui/brand-logo';

export default function OnboardingScreen() {
    const router = useRouter();
    const theme = useColorScheme();
    const colors = Colors[theme];
    const { completeOnboarding } = useAuth();

    const handleSignUp = async () => {
        await completeOnboarding();
        router.replace('/(auth)/signup');
    };

    const handleSignIn = async () => {
        await completeOnboarding();
        router.replace('/(auth)/login');
    };

    const infoLinks = [
        { label: 'About', route: '/(info)/about' },
        { label: 'How to Use', route: '/(info)/how-to-use' },
        { label: 'FAQ', route: '/(info)/faq' },
        { label: 'Privacy', route: '/(info)/privacy' },
        { label: 'Terms', route: '/(info)/terms' },
        { label: 'Rules', route: '/(info)/rules' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <BrandLogo width={200} />
                </View>

                {/* Headline */}
                <View style={styles.headlineContainer}>
                    <Text style={[styles.headline, { color: colors.text }]}>
                        Stop Searching.{' '}
                    </Text>
                    <LinearGradient
                        colors={['#6366f1', '#ec4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientTextContainer}
                    >
                        <Text style={styles.gradientText}>Start Finding.</Text>
                    </LinearGradient>
                </View>

                {/* Subtitle */}
                <Text style={[styles.subtitle, { color: colors.icon }]}>
                    Post exactly what you need, set your budget and constraints, and let the providers come to you. Connecting real needs with real solutions.
                </Text>

                {/* CTA Buttons */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={styles.primaryButtonWrapper}
                        onPress={handleSignUp}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#6366f1', '#ec4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.primaryButton}
                        >
                            <Text style={styles.primaryButtonText}>Sign Up Free</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.secondaryButton,
                            {
                                borderColor: colors.tabIconDefault + '60',
                                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            },
                        ]}
                        onPress={handleSignIn}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Sign In</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Info Links */}
                <View style={styles.footerLinks}>
                    {infoLinks.map((link, i) => (
                        <TouchableOpacity
                            key={link.route}
                            onPress={() => router.push(link.route as any)}
                            style={styles.footerLink}
                        >
                            <Text style={[styles.footerLinkText, { color: colors.icon }]}>
                                {link.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
    },
    logoContainer: {
        marginBottom: 48,
    },
    headlineContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headline: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -1,
        lineHeight: 44,
    },
    gradientTextContainer: {
        borderRadius: 4,
        marginTop: 2,
    },
    gradientText: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        color: '#fff',
        letterSpacing: -1,
        lineHeight: 44,
        paddingHorizontal: 2,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 25,
        textAlign: 'center',
        maxWidth: 340,
        marginBottom: 48,
    },
    buttonsContainer: {
        width: '100%',
        gap: 14,
        marginBottom: 52,
    },
    primaryButtonWrapper: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    primaryButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    secondaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
    },
    footerLinks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        rowGap: 10,
    },
    footerLink: {
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    footerLinkText: {
        fontSize: 13,
    },
});
