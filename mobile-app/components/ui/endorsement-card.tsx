import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getLikeCount, toggleLike } from '@/src/lib/likesService';
import { getBroadcastCount, toggleBroadcast } from '@/src/lib/broadcastService';
import { getReplyCount } from '@/src/lib/replyService';
import { toggleBookmarkInDb } from '@/src/lib/bookmarkService';
import { ReplySheet } from '@/components/ui/reply-sheet';
import { Award, ArrowRight, Heart, Repeat2, Bookmark, MessageSquare, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface EndorsementCardProps {
    endorsement: any;
    currentUserId?: string;
    initialLiked?: boolean;
    initialBroadcasted?: boolean;
    initialBookmarked?: boolean;
    onPress?: () => void;
    onBookmarkChange?: (endorsementId: string, bookmarked: boolean) => void;
    onNeedPress?: (needId: string) => void;
    onUserPress?: (username: string) => void;
    disablePress?: boolean;
    hideViewThread?: boolean;
}

export function EndorsementCard({
    endorsement,
    currentUserId,
    initialLiked = false,
    initialBroadcasted = false,
    initialBookmarked = false,
    onPress,
    onBookmarkChange,
    onNeedPress,
    onUserPress,
    disablePress = false,
    hideViewThread = false,
}: EndorsementCardProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const router = useRouter();

    const endorsedUser = endorsement.endorsed || {};
    const endorser = endorsement.endorser || {};
    const need = endorsement.needs || null;
    const hasNeed = !!need;

    // Counts
    const [likeCount, setLikeCount] = useState(0);
    const [replyCount, setReplyCount] = useState(0);
    const [broadcastCount, setBroadcastCount] = useState(0);

    // States
    const [liked, setLiked] = useState(initialLiked);
    const [broadcasted, setBroadcasted] = useState(initialBroadcasted);
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [replySheetOpen, setReplySheetOpen] = useState(false);

    useEffect(() => {
        setLiked(initialLiked);
    }, [initialLiked]);

    useEffect(() => {
        setBroadcasted(initialBroadcasted);
    }, [initialBroadcasted]);

    useEffect(() => {
        setBookmarked(initialBookmarked);
    }, [initialBookmarked]);

    // Load counts on mount for the underlying need
    useEffect(() => {
        if (!hasNeed || !need.id) return;
        const loadCounts = async () => {
            try {
                const [likes, replies, broadcasts] = await Promise.all([
                    getLikeCount(need.id),
                    getReplyCount(need.id),
                    getBroadcastCount(need.id),
                ]);
                setLikeCount(likes);
                setReplyCount(replies);
                setBroadcastCount(broadcasts);
            } catch (err) {
                // Ignore silent failure
            }
        };
        loadCounts();
    }, [hasNeed, need?.id]);

    const handleLike = useCallback(async () => {
        if (!currentUserId || !hasNeed) return;
        const prevLiked = liked;
        setLiked(!prevLiked);
        setLikeCount(c => prevLiked ? c - 1 : c + 1);
        try {
            await toggleLike(currentUserId, need.id, prevLiked);
        } catch {
            setLiked(prevLiked);
            setLikeCount(c => prevLiked ? c + 1 : c - 1);
        }
    }, [liked, currentUserId, hasNeed, need?.id]);

    const handleBroadcast = useCallback(async () => {
        if (!currentUserId || !hasNeed) return;
        const prevBroadcasted = broadcasted;
        setBroadcasted(!prevBroadcasted);
        setBroadcastCount(c => prevBroadcasted ? c - 1 : c + 1);
        try {
            await toggleBroadcast(currentUserId, need.id, prevBroadcasted);
        } catch {
            setBroadcasted(prevBroadcasted);
            setBroadcastCount(c => prevBroadcasted ? c + 1 : c - 1);
        }
    }, [broadcasted, currentUserId, hasNeed, need?.id]);

    const handleBookmark = useCallback(async () => {
        if (!currentUserId) return;
        const prevBookmarked = bookmarked;
        setBookmarked(!prevBookmarked);
        try {
            // Bookmark is attached to the endorsement itself
            await toggleBookmarkInDb(currentUserId, endorsement.id, prevBookmarked, 'endorsement');
            onBookmarkChange?.(endorsement.id, !prevBookmarked);
        } catch {
            setBookmarked(prevBookmarked);
        }
    }, [bookmarked, currentUserId, endorsement.id]);

    const handleReplyPress = () => {
        if (!currentUserId || !hasNeed) return;
        setReplySheetOpen(true);
    };

    const handleThreadPress = () => {
        if (hasNeed) {
            if (onNeedPress) onNeedPress(need.id);
            else router.push(`/need/${need.id}` as any);
        }
    };

    const handleCardPress = () => {
        if (disablePress) return;
        if (onPress) onPress();
        else handleThreadPress();
    };

    const cardBorder = { borderBottomColor: colors.tabIconDefault + '20' };

    return (
        <TouchableOpacity
            activeOpacity={disablePress ? 1 : 0.7}
            onPress={disablePress ? undefined : handleCardPress}
            style={[styles.container, cardBorder]}
        >
            <View style={styles.cardInner}>
                {/* Left Column (Avatar) */}
                <View style={styles.leftColumn}>
                    <TouchableOpacity
                        onPress={() => endorsedUser.username && onUserPress?.(endorsedUser.username)}
                        style={styles.avatarContainer}
                    >
                        {endorsedUser.avatar_url ? (
                            <Image source={{ uri: endorsedUser.avatar_url }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarFallback, { backgroundColor: colors.tint }]}>
                                <Text style={styles.avatarText}>
                                    {(endorsedUser.display_name || '?')[0].toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Right Column (Content) */}
                <View style={styles.rightColumn}>
                    <View style={styles.headerLabelRow}>
                        <Award size={16} color={colors.tint} />
                        <ThemedText style={[styles.headerLabelText, { color: colors.tint }]}>
                            Endorsement Received
                        </ThemedText>
                    </View>

                    {/* Endorsed User Meta */}
                    <View style={styles.userSection}>


                        <View style={styles.userMeta}>
                            <TouchableOpacity onPress={() => endorsedUser.username && onUserPress?.(endorsedUser.username)}>
                                <ThemedText type="defaultSemiBold" style={styles.authorName}>
                                    {endorsedUser.display_name}
                                </ThemedText>
                            </TouchableOpacity>
                            <View style={styles.userMetaRow}>
                                {endorsedUser.username && (
                                    <ThemedText style={styles.mutedText}>@{endorsedUser.username}</ThemedText>
                                )}
                                <ThemedText style={styles.mutedText}>• {endorsement.postedAt}</ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Message Box */}
                    <View style={[styles.messageBox, { backgroundColor: colors.background, borderColor: colors.tabIconDefault + '30' }]}>
                        {/* Decorative Quote Mark */}
                        <Text style={[styles.quoteMark, { color: colors.tint }]}>"</Text>

                        <ThemedText style={styles.messageText}>"{endorsement.message}"</ThemedText>

                        <View style={[styles.writtenBySection, { borderTopColor: colors.tabIconDefault + '30' }]}>
                            {endorser.avatar_url ? (
                                <Image source={{ uri: endorser.avatar_url }} style={styles.smallAvatar} />
                            ) : (
                                <View style={[styles.smallAvatarFallback, { backgroundColor: colors.tint }]}>
                                    <Text style={styles.smallAvatarText}>
                                        {(endorser.display_name || '?')[0].toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <ThemedText style={styles.writtenByText}>
                                Written by <Text onPress={() => endorser.username && onUserPress?.(endorser.username)} style={{ color: colors.text, fontWeight: 'bold' }}>{endorser.display_name}</Text>
                                {' '}for helping with <Text onPress={() => need?.id && onNeedPress?.(need.id)} style={{ color: colors.tint, fontWeight: 'bold' }}>{need?.title}</Text>
                            </ThemedText>
                        </View>
                    </View>

                    {/* Interaction Bar (Matches Web) */}
                    {hasNeed && (
                        <View style={styles.actionsContainer}>
                            <View style={styles.actionsLeft}>
                                {/* Reply */}
                                <TouchableOpacity style={styles.actionBtn} onPress={handleReplyPress}>
                                    <MessageSquare size={16} color={colors.icon} />
                                    {replyCount > 0 && (
                                        <ThemedText style={[styles.actionLabel, { color: colors.icon }]}>
                                            {replyCount}
                                        </ThemedText>
                                    )}
                                </TouchableOpacity>

                                {/* View Thread */}
                                {!hideViewThread && (
                                    <TouchableOpacity style={styles.actionBtn} onPress={handleThreadPress}>
                                        <MessageCircle size={16} color={colors.icon} />
                                        {/* Action without count */}
                                    </TouchableOpacity>
                                )}

                                {/* Broadcast */}
                                <TouchableOpacity style={styles.actionBtn} onPress={handleBroadcast}>
                                    <Repeat2 size={16} color={broadcasted ? colors.accent : colors.icon} />
                                    {broadcastCount > 0 && (
                                        <ThemedText style={[styles.actionLabel, { color: broadcasted ? colors.accent : colors.icon }]}>
                                            {broadcastCount}
                                        </ThemedText>
                                    )}
                                </TouchableOpacity>

                                {/* Like */}
                                <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                                    <Heart
                                        size={16}
                                        color={liked ? '#ef4444' : colors.icon}
                                        fill={liked ? '#ef4444' : 'transparent'}
                                    />
                                    {likeCount > 0 && (
                                        <ThemedText style={[styles.actionLabel, { color: liked ? '#ef4444' : colors.icon }]}>
                                            {likeCount}
                                        </ThemedText>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Bookmark */}
                            <TouchableOpacity style={[styles.actionBtn, { paddingHorizontal: 4 }]} onPress={handleBookmark}>
                                <Bookmark
                                    size={18}
                                    color={bookmarked ? colors.tint : colors.icon}
                                    fill={bookmarked ? colors.tint : 'transparent'}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* Reply Sheet */}
            {currentUserId && hasNeed && (
                <ReplySheet
                    visible={replySheetOpen}
                    onClose={() => setReplySheetOpen(false)}
                    need={{ id: need.id, title: need.title }}
                    userId={currentUserId}
                    onReplyPosted={() => setReplyCount(c => c + 1)}
                />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderBottomWidth: 1,
    },
    cardInner: {
        flexDirection: 'row',
    },
    leftColumn: {
        marginRight: 12,
        alignItems: 'center',
    },
    rightColumn: {
        flex: 1,
    },
    headerLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    headerLabelText: {
        fontSize: 13,
        fontWeight: '600',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarContainer: {
        // padding logic
    },
    avatarFallback: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    userMeta: {
        flex: 1,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    mutedText: {
        fontSize: 13,
        opacity: 0.6,
    },
    messageBox: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        position: 'relative',
        marginTop: 4,
    },
    quoteMark: {
        position: 'absolute',
        top: 0,
        left: 8,
        fontSize: 60,
        opacity: 0.1,
        fontFamily: 'serif',
        lineHeight: 60,
    },
    messageText: {
        fontSize: 16,
        fontStyle: 'italic',
        lineHeight: 24,
        marginBottom: 16,
        zIndex: 1,
    },
    writtenBySection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopWidth: 1,
        paddingTop: 12,
    },
    smallAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    smallAvatarFallback: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallAvatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
    },
    writtenByText: {
        fontSize: 13,
        flex: 1,
        opacity: 0.8,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
});
