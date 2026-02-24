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

export default function SignUpScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();
    const theme = useColorScheme();

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await signUp(email, password);

            if (error) {
                Alert.alert('Sign Up Failed', error.message);
            } else {
                Alert.alert(
                    'Account Created',
                    'A verification link has been sent to your email. Please verify your account to continue.',
                    [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
                );
            }
        } catch (err) {
            console.error('Sign up error:', err);
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
                        <ThemedText style={styles.subtitle}>Join the iNeedAm community today</ThemedText>
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

                        <TouchableOpacity
                            style={styles.submitButtonWrapper}
                            onPress={handleSignUp}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[Colors[theme].secondary, Colors[theme].tint]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.submitButton}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <ThemedText style={styles.submitButtonText}>Create Account</ThemedText>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <ThemedText>Already have an account? </ThemedText>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <ThemedText style={[styles.linkText, { color: Colors[theme].secondary, fontWeight: '700' }]}>Sign In</ThemedText>
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
        paddingBottom: 40,
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
        marginTop: 32,
    },
    linkText: {
        fontSize: 14,
    },
});
