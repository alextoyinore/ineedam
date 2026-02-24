import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Text, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ArrowLeft, Send, Lock, Globe, MessageSquare } from 'lucide-react-native';
import { getNeedById, shapeNeed } from '@/src/lib/needsService';
import { fetchRepliesForNeed, createReply } from '@/src/lib/replyService';
import { fetchUserLikes } from '@/src/lib/likesService';
import { fetchUserBroadcasts } from '@/src/lib/broadcastService';
import { fetchBookmarks } from '@/src/lib/bookmarkService';
import { useAuth } from '@/src/context/AuthContext';
import { NeedCard } from '@/components/ui/need-card';

const ReplyItem = ({ reply, depth = 0, colors, onReplyPress }: any) => {
    const authorName = reply.profiles?.display_name || 'Anonymous';
    const authorUsername = reply.profiles?.username;

    return (
        <View style={[styles.replyItemContainer, { marginLeft: depth * 16, borderLeftWidth: depth > 0 ? 2 : 0, borderLeftColor: colors.tabIconDefault + '30', borderBottomColor: colors.tabIconDefault + '20' }]}>
            <View style={styles.replyInner}>
                {/* Left Column (Avatar) */}
                <View style={styles.replyLeftColumn}>
                    {reply.profiles?.avatar_url ? (
                        <Image source={{ uri: reply.profiles.avatar_url }} style={styles.replyAvatar} />
                    ) : (
                        <View style={[styles.replyAvatarFallback, { backgroundColor: colors.tint }]}>
                            <Text style={styles.replyAvatarText}>{authorName.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                </View>

                {/* Right Column (Content) */}
                <View style={styles.replyRightColumn}>
                    <View style={styles.replyHeader}>
                        <View style={styles.replyAuthorInfo}>
                            <ThemedText style={styles.replyAuthor}>{authorName}</ThemedText>
                            {authorUsername && <ThemedText style={styles.replyUsername}>@{authorUsername}</ThemedText>}
                        </View>
                        {reply.is_private && (
                            <View style={styles.privateBadge}>
                                <Lock size={10} color="#6366f1" />
                                <Text style={styles.privateBadgeText}>Private</Text>
                            </View>
                        )}
                    </View>

                    <ThemedText style={styles.replyContent}>{reply.content}</ThemedText>

                    <TouchableOpacity style={styles.replyAction} onPress={() => onReplyPress(reply)}>
                        <MessageSquare size={14} color={colors.icon} />
                        <ThemedText style={[styles.replyActionText, { color: colors.icon }]}>Reply</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            {reply.children && reply.children.map((child: any) => (
                <ReplyItem key={child.id} reply={child} depth={depth + 1} colors={colors} onReplyPress={onReplyPress} />
            ))}
        </View>
    );
};

export default function NeedDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const { user } = useAuth();

    const [need, setNeed] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [broadcastedIds, setBroadcastedIds] = useState<Set<string>>(new Set());
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

    // Reply Box State
    const [replyText, setReplyText] = useState('');
    const [isPrivateReply, setIsPrivateReply] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);
    const [activeParentReply, setActiveParentReply] = useState<any>(null);

    const loadUserState = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [likes, broadcasts, bookmarks] = await Promise.all([
                fetchUserLikes(user.id),
                fetchUserBroadcasts(user.id),
                fetchBookmarks(user.id),
            ]);
            setLikedIds(new Set(likes));
            setBroadcastedIds(new Set(broadcasts));
            setBookmarkedIds(new Set(bookmarks.map((b: any) => b.id)));
        } catch (err) {
            console.error('Error loading user social state:', err);
        }
    }, [user?.id]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const needData = await getNeedById(id as string);
                if (needData) setNeed({ ...shapeNeed(needData), type: 'need' });
                const repliesData = await fetchRepliesForNeed(id as string);
                setReplies(repliesData || []);
                await loadUserState();
            } catch (error) {
                console.error("Error loading need details", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id, loadUserState]);

    const replyTree = useMemo(() => {
        const map: any = {};
        const roots: any[] = [];
        replies.forEach(r => {
            map[r.id] = { ...r, children: [] };
        });
        replies.forEach(r => {
            if (r.parent_id && map[r.parent_id]) {
                map[r.parent_id].children.push(map[r.id]);
            } else {
                roots.push(map[r.id]);
            }
        });
        return roots;
    }, [replies]);

    const handleReplyPress = (parentReply: any) => {
        setActiveParentReply(parentReply);
        // We could focus the input here or open a modal
    };

    const submitReply = async () => {
        if (!replyText.trim() || !user || !need) return;
        setSubmittingReply(true);
        try {
            await createReply(need.id, user.id, replyText, isPrivateReply);
            const repliesData = await fetchRepliesForNeed(id as string);
            setReplies(repliesData || []);
            setReplyText('');
            setIsPrivateReply(false);
            setActiveParentReply(null);
        } catch (err) {
            console.error("Failed to submit reply:", err);
        } finally {
            setSubmittingReply(false);
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.tint} />
            </ThemedView>
        );
    }

    if (!need) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText>Need not found.</ThemedText>
            </ThemedView>
        );
    }

    const headerBorder = { borderBottomColor: colors.tabIconDefault + '30' };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Thread' }} />

            <FlatList
                data={replyTree}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <View>
                        <NeedCard
                            need={need}
                            currentUserId={user?.id}
                            initialLiked={likedIds.has(need.id)}
                            initialBroadcasted={broadcastedIds.has(need.id)}
                            initialBookmarked={bookmarkedIds.has(need.id)}
                            disablePress={true}
                            hideViewThread={true}
                            onBookmarkChange={(needId, isBookmarked) => {
                                setBookmarkedIds(prev => {
                                    const next = new Set(prev);
                                    isBookmarked ? next.add(needId) : next.delete(needId);
                                    return next;
                                });
                            }}
                        />
                        {/* Inline Reply Composer */}
                        {user && (
                            <View style={[styles.replyComposer, { borderBottomColor: colors.tabIconDefault + '30' }]}>
                                {activeParentReply && (
                                    <View style={styles.replyingToLabel}>
                                        <ThemedText style={{ fontSize: 12, color: colors.tint }}>
                                            Replying to @{activeParentReply.profiles?.username || 'user'}
                                        </ThemedText>
                                        <TouchableOpacity onPress={() => setActiveParentReply(null)}>
                                            <ThemedText style={{ fontSize: 12, color: colors.icon }}>Cancel</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <TextInput
                                    style={[styles.replyInput, { color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                                    placeholder="Write a reply..."
                                    placeholderTextColor={colors.icon}
                                    multiline
                                    value={replyText}
                                    onChangeText={setReplyText}
                                    editable={!submittingReply}
                                />
                                <View style={styles.composerActions}>
                                    <TouchableOpacity
                                        style={[styles.privacyBtn, isPrivateReply && { borderColor: '#6366f1', backgroundColor: '#6366f120' }]}
                                        onPress={() => setIsPrivateReply(!isPrivateReply)}
                                    >
                                        {isPrivateReply ? <Lock size={14} color="#6366f1" /> : <Globe size={14} color={colors.icon} />}
                                        <ThemedText style={{ fontSize: 12, color: isPrivateReply ? '#6366f1' : colors.icon }}>
                                            {isPrivateReply ? 'Private' : 'Public'}
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.sendBtn, (!replyText.trim() || submittingReply) && { opacity: 0.5 }]}
                                        onPress={submitReply}
                                        disabled={!replyText.trim() || submittingReply}
                                    >
                                        {submittingReply ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <Send size={14} color="#fff" />
                                                <Text style={styles.sendBtnText}>Reply</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <ReplyItem reply={item} colors={colors} onReplyPress={(reply: any) => handleReplyPress(reply)} />
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60, // approximate status bar
        borderBottomWidth: 1,
    },
    replyComposer: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: 16,
        paddingHorizontal: 0,
    },
    replyingToLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    replyInput: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        padding: 16,
        minHeight: 80,
        textAlignVertical: 'top',
        fontSize: 15,
        marginBottom: 12,
        width: '100%',
    },
    composerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    privacyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    sendBtn: {
        backgroundColor: '#0d9488', // using primary color
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    sendBtnText: { color: '#fff', fontWeight: 'bold' },
    replyItemContainer: {
        padding: 16,
        borderBottomWidth: 1,
    },
    replyInner: {
        flexDirection: 'row',
    },
    replyLeftColumn: {
        marginRight: 10,
        alignItems: 'center',
    },
    replyRightColumn: {
        flex: 1,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    replyAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    replyAvatarFallback: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    replyAvatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    replyAuthorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    replyAuthor: { fontWeight: 'bold' },
    replyUsername: { fontSize: 12, opacity: 0.6 },
    privateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#6366f120',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    privateBadgeText: { fontSize: 10, color: '#6366f1', fontWeight: 'bold' },
    replyContent: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
    replyAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    replyActionText: { fontSize: 12, fontWeight: '500' },
});
