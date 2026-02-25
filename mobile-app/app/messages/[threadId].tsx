import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMessages } from '@/src/context/MessagesContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/src/context/AuthContext';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react-native';

export default function ChatDetailScreen() {
    const { threadId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { threads, sendMessage, setActiveThreadId } = useMessages();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const [messageText, setMessageText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const activeThread = threads.find(t => String(t.id) === String(threadId));

    useEffect(() => {
        if (threadId) {
            setActiveThreadId(threadId as string);
        }
        return () => setActiveThreadId(null);
    }, [threadId]);

    const handleSend = () => {
        if (messageText.trim() && activeThread) {
            sendMessage(activeThread.withUserId, messageText);
            setMessageText('');
        }
    };

    if (!activeThread) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.tint} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Custom Header */}
            <View style={[styles.header, { borderBottomColor: colors.tabIconDefault + '20' }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                        {activeThread.withUserAvatar ? (
                            <Image source={{ uri: activeThread.withUserAvatar }} style={styles.avatarImage} />
                        ) : (
                            <ThemedText style={styles.avatarText}>{activeThread.withUser[0].toUpperCase()}</ThemedText>
                        )}
                    </View>
                    <View>
                        <ThemedText type="defaultSemiBold">{activeThread.withUser}</ThemedText>
                        {activeThread.withUserUsername && (
                            <ThemedText style={styles.muted}>@{activeThread.withUserUsername}</ThemedText>
                        )}
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Phone size={20} color={colors.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Video size={20} color={colors.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={[...activeThread.messages].reverse()}
                keyExtractor={(item) => item.id}
                inverted
                renderItem={({ item }) => {
                    const isMe = item.senderId === user?.id;
                    return (
                        <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
                            <View style={[
                                styles.bubble,
                                isMe ?
                                    { backgroundColor: colors.tint, borderBottomRightRadius: 4 } :
                                    { backgroundColor: colors.tabIconDefault + '15', borderBottomLeftRadius: 4 }
                            ]}>
                                <ThemedText style={[styles.messageText, isMe && { color: '#fff' }]}>
                                    {item.text}
                                </ThemedText>
                            </View>
                            <ThemedText style={styles.timestamp}>
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </ThemedText>
                        </View>
                    );
                }}
                contentContainerStyle={styles.listContent}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputArea, { borderTopColor: colors.tabIconDefault + '20' }]}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.tabIconDefault + '10' }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Message..."
                            placeholderTextColor={colors.icon + '80'}
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!messageText.trim()}
                            style={[styles.sendButton, { opacity: messageText.trim() ? 1 : 0.5 }]}
                        >
                            <Send size={20} color={colors.tint} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    backButton: { padding: 4 },
    avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    avatarImage: { width: 36, height: 36, borderRadius: 18 },
    avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    muted: { fontSize: 11, opacity: 0.5 },
    headerRight: { flexDirection: 'row', gap: 16 },
    headerIcon: { padding: 4 },
    listContent: { padding: 16 },
    messageRow: { marginBottom: 12, maxWidth: '80%' },
    myMessageRow: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    theirMessageRow: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    messageText: { fontSize: 15, lineHeight: 20 },
    timestamp: { fontSize: 10, opacity: 0.4, marginTop: 4 },
    inputArea: { padding: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    input: {
        flex: 1,
        maxHeight: 100,
        paddingVertical: 8,
        fontSize: 16,
    },
    sendButton: { padding: 8 },
});
