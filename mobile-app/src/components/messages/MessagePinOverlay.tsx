import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { Lock, KeyRound, ShieldAlert, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H2, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { useMessageSecurity } from '@/src/context/MessageSecurityContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export const MessagePinOverlay: React.FC = () => {
    const { isLocked, isPinSetup, unlock, setupPin } = useMessageSecurity();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'verify' | 'setup-initial' | 'setup-confirm'>(
        isPinSetup ? 'verify' : 'setup-initial'
    );
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setStep(isPinSetup ? 'verify' : 'setup-initial');
        setPin('');
        setConfirmPin('');
        setError('');
    }, [isPinSetup, isLocked]);

    const handleSubmit = async () => {
        setError('');
        const currentPin = step === 'setup-confirm' ? confirmPin : pin;

        if (currentPin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        setIsLoading(true);
        try {
            if (step === 'verify') {
                const success = await unlock(pin);
                if (!success) {
                    setError('Invalid PIN');
                    setPin('');
                }
            } else if (step === 'setup-initial') {
                setStep('setup-confirm');
                setConfirmPin('');
            } else if (step === 'setup-confirm') {
                if (pin !== confirmPin) {
                    setError('PINs do not match');
                    setStep('setup-initial');
                    setPin('');
                    setConfirmPin('');
                    return;
                }
                const success = await setupPin(pin);
                if (!success) setError('Failed to save PIN');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLocked && isPinSetup) return null;
    if (isPinSetup === false && step === 'verify') return null;

    return (
        <Modal transparent visible={isLocked || !isPinSetup} animationType="fade">
            <View style={styles.root}>
                <BlurView intensity={80} tint="dark" style={styles.container}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.inner}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.05)', 'transparent']}
                            style={styles.card}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: step.startsWith('setup') ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)' }]}>
                                {step.startsWith('setup')
                                    ? <KeyRound size={36} color="#10b981" />
                                    : <Lock size={36} color={Colors.dark.primary} />}
                            </View>

                            <H2 style={styles.title}>
                                {step === 'verify' ? 'Enter PIN' :
                                    step === 'setup-initial' ? 'Setup Message PIN' : 'Confirm PIN'}
                            </H2>

                            <Muted style={styles.subtitle}>
                                {step === 'verify' ? 'Your messages are protected.' :
                                    'Secure your private conversations with a PIN.'}
                            </Muted>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={step === 'setup-confirm' ? confirmPin : pin}
                                    onChangeText={step === 'setup-confirm' ? setConfirmPin : setPin}
                                    placeholder="****"
                                    placeholderTextColor={Colors.dark.textMuted}
                                    keyboardType="number-pad"
                                    secureTextEntry
                                    maxLength={6}
                                    autoFocus
                                />
                            </View>

                            {error ? (
                                <View style={styles.errorBox}>
                                    <ShieldAlert size={14} color="#ef4444" />
                                    <Body style={styles.error}>{error}</Body>
                                </View>
                            ) : null}

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={Colors.gradients.primary as [string, string, ...string[]]}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <BodyBold style={styles.buttonText}>
                                                {step === 'setup-initial' ? 'Continue' :
                                                    step === 'verify' ? 'Unlock' : 'Complete Setup'}
                                            </BodyBold>
                                            <ArrowRight size={20} color="white" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {step === 'setup-confirm' && (
                                <TouchableOpacity
                                    style={styles.backLink}
                                    onPress={() => setStep('setup-initial')}
                                >
                                    <Muted>Back to initial PIN</Muted>
                                </TouchableOpacity>
                            )}
                        </LinearGradient>
                    </KeyboardAvoidingView>
                </BlurView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    inner: {
        alignItems: 'center',
    },
    card: {
        width: '100%',
        padding: Spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        backgroundColor: 'rgba(20,20,30,0.8)',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    inputContainer: {
        width: '100%',
        marginBottom: Spacing.lg,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        height: 60,
        textAlign: 'center',
        fontSize: 32,
        color: 'white',
        letterSpacing: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: Spacing.md,
    },
    error: {
        color: '#ef4444',
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    backLink: {
        marginTop: 16,
        padding: 8,
    }
});
