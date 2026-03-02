import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft, Phone, Video, MoreVertical,
    Send, Paperclip, Mic, Image as ImageIcon, X, FileText
} from 'lucide-react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H3, Body, Muted, BodyBold } from '@/src/components/ui/Typography';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { useMessages } from '@/src/context/MessagesContext';
import { supabase } from '@/src/lib/supabase';
import { AudioBubble } from '@/src/components/messages/AudioBubble';
import { VoiceRecorder } from '@/src/components/messages/VoiceRecorder';
import { MessagePinOverlay } from '@/src/components/messages/MessagePinOverlay';

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { threads, sendMessage, setActiveThreadId } = useMessages();
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [selectedFile, setSelectedFile] = useState<any>(null);

    const activeThread = threads.find(t => t.id === id);

    useEffect(() => {
        setActiveThreadId(id as string);
        return () => setActiveThreadId(null);
    }, [id]);

    const handleSend = async () => {
        if (!message.trim() && !selectedFile) return;
        const text = message;
        const file = selectedFile;
        setMessage('');
        setSelectedFile(null);
        await sendMessage(activeThread!.withUserId, text, file);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });
        if (!result.canceled) {
            setSelectedFile(result.assets[0]);
        }
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({});
        if (!result.canceled) {
            setSelectedFile(result.assets[0]);
        }
    };

    if (!activeThread) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={20} color={Colors.dark.textPrimary} />
                    </TouchableOpacity>
                    <Image source={{ uri: activeThread.withUserAvatar }} style={styles.avatar} contentFit="cover" />
                    <View>
                        <BodyBold>{activeThread.withUser}</BodyBold>
                        <Muted style={{ fontSize: 10 }}>Online</Muted>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerAction}><Phone size={20} color={Colors.dark.textMuted} /></TouchableOpacity>
                    <TouchableOpacity style={styles.headerAction}><Video size={20} color={Colors.dark.textMuted} /></TouchableOpacity>
                    <TouchableOpacity style={styles.headerAction}><MoreVertical size={20} color={Colors.dark.textMuted} /></TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                data={[...activeThread.messages].reverse()}
                keyExtractor={item => item.id}
                inverted
                contentContainerStyle={styles.messagesList}
                renderItem={({ item }) => {
                    const isMe = item.senderId !== activeThread.withUserId;
                    const isAudio = item.fileType?.startsWith('audio/');

                    return (
                        <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
                            <View style={[
                                styles.bubble,
                                isMe ? styles.myBubble : styles.theirBubble
                            ]}>
                                {item.fileUrl && (
                                    isAudio ? (
                                        <AudioBubble url={item.fileUrl} isMe={isMe} />
                                    ) : (
                                        <Image source={{ uri: item.fileUrl as any }} style={styles.messageImage} contentFit="cover" />
                                    )
                                )}
                                {item.text && (
                                    <Body style={{ color: isMe ? '#fff' : Colors.dark.textPrimary }}>{item.text}</Body>
                                )}
                                <Muted style={[styles.timestamp, { color: isMe ? 'rgba(255,255,255,0.6)' : Colors.dark.textMuted }] as any}>
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Muted>
                            </View>
                        </View>
                    );
                }}
            />

            {/* Input */}
            <View style={styles.footer}>
                {selectedFile && (
                    <View style={styles.previewContainer}>
                        <GlassPanel intensity={20} style={styles.preview}>
                            {selectedFile.uri?.includes('image') ? (
                                <Image source={{ uri: selectedFile.uri as any }} style={styles.previewThumb} />
                            ) : (
                                <FileText size={20} color={Colors.dark.primary} />
                            )}
                            <Muted numberOfLines={1} style={{ flex: 1 }}>{selectedFile.name || 'Attachment'}</Muted>
                            <TouchableOpacity onPress={() => setSelectedFile(null)}><X size={16} color={Colors.dark.textMuted} /></TouchableOpacity>
                        </GlassPanel>
                    </View>
                )}

                {isRecording ? (
                    <VoiceRecorder
                        onSend={(uri, dur) => {
                            sendMessage(activeThread!.withUserId, '', { uri, type: 'audio/webm', name: 'voice-note.webm' });
                            setIsRecording(false);
                        }}
                        onCancel={() => setIsRecording(false)}
                    />
                ) : (
                    <View style={styles.inputBar}>
                        <TouchableOpacity onPress={pickDocument} style={styles.attachBtn}>
                            <Paperclip size={20} color={Colors.dark.textMuted} />
                        </TouchableOpacity>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Message..."
                                placeholderTextColor={Colors.dark.textMuted}
                                value={message}
                                onChangeText={setMessage}
                                multiline
                            />
                            <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
                                <ImageIcon size={20} color={Colors.dark.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {message.trim() || selectedFile ? (
                            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                                <Send size={20} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setIsRecording(true)} style={styles.micBtn}>
                                <Mic size={20} color={Colors.dark.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
            <MessagePinOverlay />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.bgBase,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        paddingTop: 60,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backBtn: {
        padding: 4,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.dark.bgSurface,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    headerAction: {
        padding: 4,
    },
    messagesList: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    messageRow: {
        marginBottom: 8,
        flexDirection: 'row',
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    theirMessageRow: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: Colors.dark.primary,
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: Colors.dark.bgSurfaceGlass,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    timestamp: {
        fontSize: 9,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 6,
    },
    footer: {
        padding: Spacing.md,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.md,
        borderTopWidth: 1,
        borderColor: Colors.dark.borderGlass,
        backgroundColor: Colors.dark.bgBase,
    },
    previewContainer: {
        marginBottom: 10,
    },
    preview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        gap: 10,
        borderRadius: 12,
    },
    previewThumb: {
        width: 40,
        height: 40,
        borderRadius: 6,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    attachBtn: {
        padding: 8,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.bgSurfaceGlass,
        borderRadius: 24,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    input: {
        flex: 1,
        color: '#fff',
        paddingVertical: 8,
        maxHeight: 100,
    },
    imageBtn: {
        padding: 8,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.dark.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    micBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    micBtnActive: {
        backgroundColor: Colors.dark.primary,
    }
});
