import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, TextInput, Text, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getEndorsementById } from '@/src/lib/endorsementService';
import { EndorsementCard } from '@/components/ui/endorsement-card';
import { fetchRepliesForNeed, createReply } from '@/src/lib/replyService';
import { useAuth } from '@/src/context/AuthContext';
import { ArrowLeft, Send, Lock, Globe, MessageSquare } from 'lucide-react-native';

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

export default function EndorsementDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const { user } = useAuth();
    const currentUserId = user?.id;

    const [endorsement, setEndorsement] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [replyText, setReplyText] = useState('');
    const [isPrivateReply, setIsPrivateReply] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);
    const [activeParentReply, setActiveParentReply] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setLoading(true);
            try {
                const data = await getEndorsementById(id as string);
                setEndorsement(data);
                // Fetch replies specifically for this endorsement (endorsement_id = id)
                const repliesData = await fetchRepliesForNeed(null, id as string);
                setReplies(repliesData || []);
            } catch (err) {
                console.error("Failed to load endorsement or replies:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const replyTree = React.useMemo(() => {
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
    };

    const submitReply = async () => {
        if (!replyText.trim() || !user || !endorsement?.need_id) return;
        setSubmittingReply(true);
        try {
            // Pass endorsement.id as the endorsement context
            await createReply(endorsement.need_id, user.id, replyText, isPrivateReply, activeParentReply?.id, endorsement.id);
            const repliesData = await fetchRepliesForNeed(null, endorsement.id);
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

    if (!endorsement) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText style={styles.mutedText}>Endorsement not found or unavailable.</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: "Endorsement",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
                            <ArrowLeft size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <FlatList
                data={replyTree}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <View>
                        <EndorsementCard
                            endorsement={endorsement}
                            currentUserId={currentUserId}
                            disablePress={true}
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
                ListFooterComponent={
                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>
                            This endorsement was given for helping with a specific need.
                        </ThemedText>
                        <TouchableOpacity
                            onPress={() => router.push(`/need/${endorsement.need_id}` as any)}
                            style={[styles.button, { backgroundColor: colors.tabIconDefault + '20' }]}
                        >
                            <ThemedText style={styles.buttonText}>View Associated Need</ThemedText>
                        </TouchableOpacity>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mutedText: {
        fontSize: 16,
        opacity: 0.6,
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
        backgroundColor: '#0d9488',
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
    footer: {
        padding: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.6,
        marginBottom: 20,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
