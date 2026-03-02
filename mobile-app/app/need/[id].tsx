import React, { useState, useEffect, useRef } from 'react';
import {
    View, StyleSheet, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Image
} from 'react-native';
import { ArrowLeft, MessageSquare, Send, Lock, Globe } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H3, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { NeedCard } from '@/src/components/feed/NeedCard';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/src/lib/supabase';
import { fetchRepliesForNeed } from '@/src/services/bookmarkService';
import { createReply } from '@/src/services/replyService';
import { shapeNeed } from '@/src/services/needsService';
import { timeAgo } from '@/src/services/needsService';
import { useAuth } from '@/src/context/AuthContext';

export default function NeedDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [need, setNeed] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [{ data: needData }, repliesData] = await Promise.all([
                supabase
                    .from('needs')
                    .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
                    .eq('id', id)
                    .single(),
                fetchRepliesForNeed(id!)
            ]);

            if (needData) setNeed(shapeNeed(needData));
            setReplies(repliesData);
        } catch (err) {
            console.error('Error loading need detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id]);

    const handleSendReply = async () => {
        if (!replyText.trim() || !user || !id) return;
        setSubmitting(true);
        try {
            const newReply = await createReply(id!, user.id, replyText.trim(), isPrivate);
            setReplies(prev => [...prev, newReply]);
            setReplyText('');
            scrollRef.current?.scrollToEnd({ animated: true });
        } catch (err) {
            console.error('Error sending reply:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={22} color={Colors.dark.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <MessageSquare size={18} color={Colors.dark.primary} />
                    <H3 style={styles.headerTitle}>Thread</H3>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    ref={scrollRef}
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Original Need */}
                    {need && <NeedCard need={need} isFullDetail />}

                    {/* Replies count */}
                    <View style={styles.repliesHeader}>
                        <BodyBold style={styles.repliesCount}>
                            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                        </BodyBold>
                    </View>

                    {/* Replies */}
                    {replies.length === 0 ? (
                        <View style={styles.emptyReplies}>
                            <Muted>No replies yet. Be the first to reply!</Muted>
                        </View>
                    ) : (
                        replies.map((reply) => (
                            <View key={reply.id} style={styles.replyItem}>
                                {/* Author row */}
                                <View style={styles.replyHeader}>
                                    <View style={styles.replyAvatar}>
                                        {reply.profiles?.avatar_url ? (
                                            <Image source={{ uri: reply.profiles.avatar_url }} style={styles.replyAvatarImg} />
                                        ) : (
                                            <View style={styles.replyAvatarPlaceholder}>
                                                <BodyBold style={{ color: '#fff' }}>
                                                    {reply.profiles?.display_name?.charAt(0) || '?'}
                                                </BodyBold>
                                            </View>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <BodyBold style={{ fontSize: 14 }}>{reply.profiles?.display_name || 'Anonymous'}</BodyBold>
                                        <Muted style={{ fontSize: 12 }}>@{reply.profiles?.username} · {timeAgo(reply.created_at)}</Muted>
                                    </View>
                                    {reply.is_private && (
                                        <View style={styles.privateBadge}>
                                            <Lock size={12} color={Colors.dark.textMuted} />
                                            <Muted style={{ fontSize: 10 }}>Private</Muted>
                                        </View>
                                    )}
                                </View>
                                <Body style={styles.replyContent}>{reply.content}</Body>
                            </View>
                        ))
                    )}

                    <View style={{ height: 20 }} />
                </ScrollView>

                {/* Reply Input */}
                {user && (
                    <GlassPanel intensity={20} style={styles.replyBar}>
                        <TouchableOpacity
                            onPress={() => setIsPrivate(!isPrivate)}
                            style={styles.privacyBtn}
                        >
                            {isPrivate
                                ? <Lock size={18} color={Colors.dark.primary} />
                                : <Globe size={18} color={Colors.dark.textMuted} />
                            }
                        </TouchableOpacity>
                        <TextInput
                            style={styles.replyInput}
                            placeholder={isPrivate ? 'Private reply...' : 'Add a reply...'}
                            placeholderTextColor={Colors.dark.textMuted}
                            value={replyText}
                            onChangeText={setReplyText}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleSendReply}
                            disabled={!replyText.trim() || submitting}
                            style={[styles.sendBtn, { opacity: (!replyText.trim() || submitting) ? 0.4 : 1 }]}
                        >
                            <LinearGradient
                                colors={Colors.gradients.primary as [string, string, ...string[]]}
                                style={styles.sendBtnGradient}
                            >
                                {submitting
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Send size={16} color="#fff" />
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </GlassPanel>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.bgBase },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        borderBottomWidth: 1, borderColor: Colors.dark.borderGlass, gap: 12,
    },
    backBtn: { padding: 4 },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 20 },
    repliesHeader: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    repliesCount: { fontSize: 15, color: Colors.dark.textMuted },
    emptyReplies: { padding: Spacing.xl, alignItems: 'center' },
    replyItem: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    replyAvatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
    replyAvatarImg: { width: '100%', height: '100%' },
    replyAvatarPlaceholder: {
        width: '100%', height: '100%',
        backgroundColor: Colors.dark.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    privateBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.dark.bgSurfaceGlass, borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 4,
    },
    replyContent: { fontSize: 15, lineHeight: 22, paddingLeft: 46 },
    replyBar: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.md, gap: 10,
        borderTopWidth: 1, borderColor: Colors.dark.borderGlass,
    },
    privacyBtn: { padding: 6 },
    replyInput: {
        flex: 1, color: Colors.dark.textPrimary, fontSize: 14,
        maxHeight: 80, paddingVertical: 8,
    },
    sendBtn: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden' },
    sendBtnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
