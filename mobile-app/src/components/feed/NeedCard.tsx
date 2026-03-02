import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Image } from 'expo-image';
import {
    Tag, MapPin, Banknote, Clock, MessageSquare,
    Bookmark, Heart, Repeat2,
    MoreVertical, Share2
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../../theme/Theme';
import { GlassPanel } from '../ui/GlassPanel';
import { H3, Body, Muted, BodyBold } from '../ui/Typography';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { toggleBookmark, isBookmarked } from '@/src/services/bookmarkService';

interface NeedCardProps {
    need: any;
    onPress?: (id: string) => void;
    isFullDetail?: boolean;
    broadcastedBy?: any;
}

export const NeedCard: React.FC<NeedCardProps> = ({
    need,
    onPress,
    isFullDetail = false,
    broadcastedBy
}) => {
    const router = useRouter();
    const { user } = useAuth();
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        if (user) {
            isBookmarked(user.id, need.id, 'need').then(setBookmarked).catch(() => { });
        }
    }, [user, need.id]);

    const handleBookmark = async () => {
        if (!user) return;
        const newState = !bookmarked;
        setBookmarked(newState); // optimistic
        try {
            await toggleBookmark(user.id, need.id, 'need');
        } catch {
            setBookmarked(!newState); // revert
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: need.title,
                message: need.description,
                url: `https://ineedam.com/need/${need.id}`
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleReplyPress = () => {
        router.push(`/need/${need.id}` as any);
    };

    return (
        <TouchableOpacity
            onPress={() => onPress ? onPress(need.id) : handleReplyPress()}
            activeOpacity={isFullDetail ? 1 : 0.7}
            style={[
                styles.container,
                !isFullDetail && styles.borderBottom
            ]}
        >
            {broadcastedBy && (
                <View style={styles.broadcastHeader}>
                    <Repeat2 size={14} color={Colors.dark.textMuted} />
                    <Muted style={styles.broadcastText}>
                        {broadcastedBy.display_name} broadcasted
                    </Muted>
                </View>
            )}
            {/* Header Info */}
            <View style={styles.header}>
                <View style={styles.authorSection}>
                    <View style={styles.avatar}>
                        {need.authorAvatar ? (
                            <Image
                                source={{ uri: need.authorAvatar }}
                                style={styles.avatarImage}
                                contentFit="cover"
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Body style={styles.avatarInitial}>
                                    {(need.author || '?').charAt(0).toUpperCase()}
                                </Body>
                            </View>
                        )}
                    </View>
                    <View style={styles.metaInfo}>
                        <View style={styles.nameRow}>
                            <BodyBold numberOfLines={1}>{need.author}</BodyBold>
                            <Muted style={styles.username}>@{need.authorUsername}</Muted>
                            <Muted>• {need.postedAt}</Muted>
                        </View>
                        <View style={styles.categoryRow}>
                            <Muted style={{
                                ...styles.category,
                                color: Colors.dark.primary
                            } as any}>
                                {need.category} Need
                            </Muted>
                            {need.status && need.status !== 'open' && (
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: need.status === 'met' ? Colors.dark.primary : Colors.dark.bgSurface }
                                ]}>
                                    <Muted style={styles.statusText}>
                                        {need.status === 'met' ? 'MET' : need.status.toUpperCase()}
                                    </Muted>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <MoreVertical size={20} color={Colors.dark.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentWrapper}>
                <H3 style={styles.title}>{need.title}</H3>
                <Body
                    style={styles.description}
                    numberOfLines={isFullDetail ? undefined : 3}
                >
                    {need.description}
                </Body>

                {need.imageUrl && (
                    <Image
                        source={{ uri: need.imageUrl }}
                        style={styles.postImage}
                        contentFit="cover"
                        transition={300}
                    />
                )}

                {/* Constraint Tags */}
                <View style={styles.tagsContainer}>
                    <View style={styles.tag}>
                        <Banknote size={14} color={Colors.dark.accent} />
                        <BodyBold style={styles.tagText}>{need.budget}</BodyBold>
                    </View>
                    <View style={styles.tag}>
                        <MapPin size={14} color={Colors.dark.textMuted} />
                        <Muted style={styles.tagText}>{need.location}</Muted>
                    </View>
                    <View style={styles.tag}>
                        <Clock size={14} color={Colors.dark.textMuted} />
                        <Muted style={styles.tagText}>{need.flexibility}</Muted>
                    </View>
                </View>

                {/* Footer Actions */}
                <View style={styles.footer}>
                    <View style={styles.actionGroup}>
                        <TouchableOpacity style={styles.action} onPress={handleReplyPress}>
                            <MessageSquare size={18} color={Colors.dark.textMuted} />
                            {need.replyCount > 0 && <Muted>{need.replyCount}</Muted>}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.action}>
                            <Repeat2 size={18} color={Colors.dark.textMuted} />
                            {need.broadcastCount > 0 && <Muted>{need.broadcastCount}</Muted>}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.action}>
                            <Heart size={18} color={need.liked ? '#ef4444' : Colors.dark.textMuted} />
                            {need.likeCount > 0 && <Muted>{need.likeCount}</Muted>}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.actionGroup}>
                        <TouchableOpacity onPress={handleBookmark}>
                            <Bookmark
                                size={18}
                                color={bookmarked ? Colors.dark.primary : Colors.dark.textMuted}
                                fill={bookmarked ? Colors.dark.primary : 'transparent'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare}>
                            <Share2 size={18} color={Colors.dark.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    authorSection: {
        flexDirection: 'row',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: Colors.dark.bgSurface,
        marginRight: Spacing.sm,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.dark.primary,
    },
    avatarInitial: {
        color: '#fff',
        fontWeight: '700',
    },
    metaInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    username: {
        marginLeft: 2,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#fff',
    },
    moreBtn: {
        padding: 4,
    },
    contentWrapper: {
        paddingLeft: 48, // Align with text after avatar
    },
    title: {
        fontSize: 16,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: Spacing.sm,
        color: Colors.dark.textPrimary,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    tagText: {
        fontSize: 13,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionGroup: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    broadcastHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        marginLeft: 4,
    },
    broadcastText: {
        fontSize: 13,
        fontWeight: '600',
    }
});
