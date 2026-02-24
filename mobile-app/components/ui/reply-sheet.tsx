import React, { useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Switch,
    Alert,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createReply } from '@/src/lib/replyService';

interface ReplySheetProps {
    visible: boolean;
    onClose: () => void;
    need: { id: string; title: string };
    userId: string;
    onReplyPosted: () => void;
}

export function ReplySheet({ visible, onClose, need, userId, onReplyPosted }: ReplySheetProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!content.trim()) {
            Alert.alert('Empty reply', 'Please type something before submitting.');
            return;
        }
        setSubmitting(true);
        try {
            await createReply(need.id, userId, content.trim(), isPrivate);
            onReplyPosted();
            setContent('');
            setIsPrivate(false);
            onClose();
        } catch (err: any) {
            Alert.alert('Error', err?.message || 'Could not post reply. Try again.');
        } finally {
            setSubmitting(false);
        }
    }, [content, isPrivate, need.id, userId]);

    const bg = theme === 'dark' ? '#1a1c23' : '#ffffff';
    const border = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const inputBg = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.sheetWrapper}
            >
                <View style={[styles.sheet, { backgroundColor: bg, borderColor: border }]}>
                    {/* Handle */}
                    <View style={[styles.handle, { backgroundColor: colors.tabIconDefault }]} />

                    {/* Header */}
                    <Text style={[styles.heading, { color: colors.text }]}>Reply to Need</Text>
                    <Text style={[styles.needTitle, { color: colors.icon }]} numberOfLines={2}>
                        {need.title}
                    </Text>

                    {/* Input */}
                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: inputBg, borderColor: border }]}
                        placeholder="Write your reply..."
                        placeholderTextColor={colors.icon}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        autoFocus
                        maxLength={1000}
                    />

                    {/* Private toggle */}
                    <View style={styles.toggleRow}>
                        <Text style={[styles.toggleLabel, { color: colors.text }]}>
                            🔒 Private proposal
                        </Text>
                        <Switch
                            value={isPrivate}
                            onValueChange={setIsPrivate}
                            trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
                            thumbColor="#fff"
                        />
                    </View>
                    {isPrivate && (
                        <Text style={[styles.privateHint, { color: colors.icon }]}>
                            Only visible to the need's author
                        </Text>
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: colors.tint, opacity: submitting ? 0.7 : 1 }]}
                        onPress={handleSubmit}
                        disabled={submitting}
                        activeOpacity={0.8}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>Post Reply</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheetWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        padding: 24,
        paddingBottom: 40,
        gap: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 4,
    },
    heading: {
        fontSize: 18,
        fontWeight: '700',
    },
    needTitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    input: {
        minHeight: 100,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        fontSize: 15,
        lineHeight: 22,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    privateHint: {
        fontSize: 12,
        marginTop: -6,
    },
    submitBtn: {
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
