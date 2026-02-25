import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, Share, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getLikeCount, toggleLike } from '@/src/lib/likesService';
import { getBroadcastCount, toggleBroadcast } from '@/src/lib/broadcastService';
import { getReplyCount } from '@/src/lib/replyService';
import { toggleBookmarkInDb } from '@/src/lib/bookmarkService';
import { ReplySheet } from '@/components/ui/reply-sheet';
import { useRouter } from 'expo-router';
import { Banknote, MapPin, Clock, MessageSquare, Bookmark, Heart, Repeat2, MessageCircle, Share2, Edit2 } from 'lucide-react-native';

interface NeedCardProps {
    need: {
        id: string;
        title: string;
        description: string;
        author: string;
        authorId?: string;
        authorUsername?: string;
        authorAvatar?: string;
        postedAt: string;
        category: string;
        budget?: string;
        location?: string;
        flexibility?: string;
        status?: string;
        type: 'need' | 'endorsement';
    };
    currentUserId?: string;
    initialLiked?: boolean;
    initialBroadcasted?: boolean;
    initialBookmarked?: boolean;
    onPress?: () => void;
    onBookmarkChange?: (needId: string, bookmarked: boolean) => void;
    disablePress?: boolean;
    hideViewThread?: boolean;
}

export function NeedCard({
    need,
    currentUserId,
    initialLiked = false,
    initialBroadcasted = false,
    initialBookmarked = false,
    onPress,
    onBookmarkChange,
    disablePress = false,
    hideViewThread = false,
}: NeedCardProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const router = useRouter();

    const isEndorsement = need.type === 'endorsement';
    const isOwner = currentUserId === need.authorId;

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

    // Load counts on mount for needs only
    useEffect(() => {
        if (isEndorsement || !need.id) return;
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
                // Counts are non-critical, fail silently
            }
        };
        loadCounts();
    }, [need.id, isEndorsement]);

    const handleLike = useCallback(async () => {
        if (!currentUserId) return;
        const prevLiked = liked;
        setLiked(!prevLiked);
        setLikeCount(c => prevLiked ? c - 1 : c + 1);
        try {
            await toggleLike(currentUserId, need.id, prevLiked);
        } catch {
            // Revert on error
            setLiked(prevLiked);
            setLikeCount(c => prevLiked ? c + 1 : c - 1);
        }
    }, [liked, currentUserId, need.id]);

    const handleBroadcast = useCallback(async () => {
        if (!currentUserId) return;
        const prevBroadcasted = broadcasted;
        setBroadcasted(!prevBroadcasted);
        setBroadcastCount(c => prevBroadcasted ? c - 1 : c + 1);
        try {
            await toggleBroadcast(currentUserId, need.id, prevBroadcasted);
        } catch {
            setBroadcasted(prevBroadcasted);
            setBroadcastCount(c => prevBroadcasted ? c + 1 : c - 1);
        }
    }, [broadcasted, currentUserId, need.id]);

    const handleBookmark = useCallback(async () => {
        if (!currentUserId) return;
        const prevBookmarked = bookmarked;
        setBookmarked(!prevBookmarked);
        try {
            await toggleBookmarkInDb(currentUserId, need.id, prevBookmarked, 'need');
            onBookmarkChange?.(need.id, !prevBookmarked);
        } catch {
            setBookmarked(prevBookmarked);
        }
    }, [bookmarked, currentUserId, need.id]);

    const handleShare = useCallback(async () => {
        try {
            const result = await Share.share({
                message: `Check out this need: ${need.title}\n${need.description}\n\nhttps://your-app-url.com/need/${need.id}`,
                url: `https://your-app-url.com/need/${need.id}`, // For iOS
                title: need.title, // For Android
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error: any) {
            Alert.alert(error.message);
        }
    }, [need.id, need.title, need.description]);

    const handleCardPress = () => {
        if (disablePress) return;
        if (onPress) onPress();
        else if (need.id) router.push(`/need/${need.id}` as any);
    };

    const handleThreadPress = () => {
        if (need.id) router.push(`/need/${need.id}` as any);
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
                    <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                        {need.authorAvatar ? (
                            <Image source={{ uri: need.authorAvatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{(need.author ?? '?')[0].toUpperCase()}</Text>
                        )}
                    </View>
                </View>

                {/* Right Column (Content) */}
                <View style={styles.rightColumn}>
                    {/* Header Details */}
                    <View style={styles.meta}>
                        <View style={styles.authorRow}>
                            <ThemedText type="defaultSemiBold" style={styles.authorName}>{need.author}</ThemedText>
                            {need.authorUsername && (
                                <ThemedText style={styles.muted}>@{need.authorUsername}</ThemedText>
                            )}
                            <ThemedText style={styles.muted}>• {need.postedAt}</ThemedText>
                        </View>
                        <View style={styles.categoryRow}>
                            <Text style={[styles.categoryText, { color: colors.tint }]}>
                                {need.category} {isEndorsement ? 'Endorsement' : 'Need'}
                            </Text>
                            {need.status && need.status !== 'open' && (
                                <View style={[styles.statusBadge, { backgroundColor: need.status === 'met' ? colors.tint : 'transparent', borderColor: colors.tabIconDefault + '60' }]}>
                                    <Text style={[styles.statusText, { color: need.status === 'met' ? '#fff' : colors.icon }]}>
                                        {need.status.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>


                    {/* Content */}
                    <View style={styles.content}>
                        <ThemedText type="subtitle" style={styles.title}>{need.title}</ThemedText>
                        <ThemedText numberOfLines={3} style={styles.description}>{need.description}</ThemedText>
                    </View>

                    {/* Constraints */}
                    {!isEndorsement && (
                        <View style={styles.constraints}>
                            <View style={styles.constraintItem}>
                                <Banknote size={14} color={colors.accent} />
                                <ThemedText style={styles.constraintText}>{need.budget || 'N/A'}</ThemedText>
                            </View>
                            <View style={styles.constraintItem}>
                                <MapPin size={14} color={colors.icon} />
                                <ThemedText style={styles.constraintText}>{need.location || 'Remote'}</ThemedText>
                            </View>
                            <View style={styles.constraintItem}>
                                <Clock size={14} color={colors.icon} />
                                <ThemedText style={styles.constraintText}>{need.flexibility || 'Flexible'}</ThemedText>
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <View style={styles.actionsLeft}>
                            {/* Reply */}
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => currentUserId && setReplySheetOpen(true)}
                            >
                                <MessageSquare size={16} color={colors.icon} />
                                {replyCount > 0 && (
                                    <Text style={[styles.actionLabel, { color: colors.icon }]}>
                                        {replyCount}
                                    </Text>
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
                                    <Text style={[styles.actionLabel, { color: broadcasted ? colors.accent : colors.icon }]}>
                                        {broadcastCount}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Like */}
                            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                                <Heart size={16} color={liked ? '#ef4444' : colors.icon} fill={liked ? '#ef4444' : 'transparent'} />
                                {likeCount > 0 && (
                                    <Text style={[styles.actionLabel, { color: liked ? '#ef4444' : colors.icon }]}>
                                        {likeCount}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Bookmark */}
                        <TouchableOpacity style={[styles.actionBtn, { paddingHorizontal: 4 }]} onPress={handleBookmark}>
                            <Bookmark size={18} color={bookmarked ? colors.tint : colors.icon} fill={bookmarked ? colors.tint : 'transparent'} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Reply Sheet */}
            {currentUserId && (
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
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    avatarImage: { width: 40, height: 40, borderRadius: 20 },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    meta: { flex: 1 },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: 4,
    },
    authorName: { fontSize: 15 },
    muted: { fontSize: 13, opacity: 0.55 },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    categoryText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
    },
    statusText: { fontSize: 10, fontWeight: '700' },
    content: { marginBottom: 12 },
    title: { fontSize: 17, marginBottom: 4 },
    description: { fontSize: 14, lineHeight: 21, opacity: 0.8 },
    constraints: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 12,
    },
    constraintItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    constraintIcon: { fontSize: 13 },
    constraintText: { fontSize: 13, fontWeight: '500' },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionsLeft: {
        flexDirection: 'row',
        gap: 4,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    actionIcon: { fontSize: 15 },
    actionLabel: { fontSize: 13, fontWeight: '500' },
});
