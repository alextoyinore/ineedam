import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

import { BrandLogo } from '@/components/ui/brand-logo';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();
    const theme = useColorScheme();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await signIn(email, password);
            if (error) {
                Alert.alert('Login Failed', error.message);
            } else {
                router.replace('/(tabs)');
            }
        } catch (err) {
            console.error('Login error:', err);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar style="auto" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <BrandLogo width={180} style={styles.logo} />
                        <ThemedText style={styles.subtitle}>Sign in to continue to iNeedAm</ThemedText>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Email Address</ThemedText>
                            <TextInput
                                style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].tabIconDefault + '40' }]}
                                placeholder="email@example.com"
                                placeholderTextColor={Colors[theme].tabIconDefault}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Password</ThemedText>
                            <TextInput
                                style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].tabIconDefault + '40' }]}
                                placeholder="••••••••"
                                placeholderTextColor={Colors[theme].tabIconDefault}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <ThemedText style={[styles.linkText, { color: Colors[theme].tint }]}>Forgot Password?</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.submitButtonWrapper}
                            onPress={handleLogin}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[Colors[theme].tint, Colors[theme].secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.submitButton}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <ThemedText style={styles.submitButtonText}>Sign In</ThemedText>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <ThemedText>Don't have an account? </ThemedText>
                        <Link href="/(auth)/signup" asChild>
                            <TouchableOpacity>
                                <ThemedText style={[styles.linkText, { color: Colors[theme].tint, fontWeight: '700' }]}>Sign Up</ThemedText>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        marginBottom: 24,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.6,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    submitButtonWrapper: {
        width: '100%',
        marginTop: 12,
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    linkText: {
        fontSize: 14,
    },
});
