import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Award, Repeat2, MessageSquare, Heart, Bookmark, MessageCircle } from 'lucide-react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { useRouter } from 'expo-router';

interface EndorsementCardProps {
    endorsement: any;
    broadcastedBy?: any;
}

export const EndorsementCard: React.FC<EndorsementCardProps> = ({ endorsement, broadcastedBy }) => {
    const router = useRouter();
    const endorsedUser = endorsement.endorsed || endorsement.profiles; // Fallback if data structure varies
    const endorser = endorsement.endorser || { display_name: 'Someone', username: 'user' };
    const need = endorsement.needs;

    return (
        <View style={styles.container}>
            {broadcastedBy && (
                <View style={styles.broadcastHeader}>
                    <Repeat2 size={14} color={Colors.dark.primary} />
                    <Muted style={styles.broadcastText}>{broadcastedBy.display_name} broadcasted</Muted>
                </View>
            )}

            <View style={styles.badgeRow}>
                <Award size={16} color={Colors.dark.primary} />
                <BodyBold style={styles.badgeText}>Endorsement Received</BodyBold>
            </View>

            <View style={styles.header}>
                <Image
                    source={{ uri: endorsedUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }}
                    style={styles.avatar}
                />
                <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                        <BodyBold>{endorsedUser?.display_name || 'Anonymous'}</BodyBold>
                        <Muted style={styles.username}>@{endorsedUser?.username}</Muted>
                    </View>
                    <Muted style={styles.verifiedText}>Verified Match Helper</Muted>
                </View>
            </View>

            <GlassPanel intensity={10} style={styles.messageBox}>
                <Body style={styles.messageText}>"{endorsement.message}"</Body>

                <View style={styles.attribution}>
                    <Image
                        source={{ uri: endorser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }}
                        style={styles.smallAvatar}
                    />
                    <Muted style={styles.attributionText}>
                        Written by <BodyBold style={styles.inlineName}>{endorser.display_name}</BodyBold> for helping with <BodyBold style={styles.inlineNeed}>{need?.title || 'a need'}</BodyBold>
                    </Muted>
                </View>

                {/* Decorative Quote */}
                <Body style={styles.quoteMark}>"</Body>
            </GlassPanel>

            <View style={styles.actions}>
                <View style={styles.mainActions}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <MessageSquare size={18} color={Colors.dark.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Repeat2 size={18} color={Colors.dark.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Heart size={18} color={Colors.dark.textMuted} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                    <Bookmark size={18} color={Colors.dark.textMuted} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    broadcastHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        marginLeft: 40,
    },
    broadcastText: {
        fontSize: 12,
        fontWeight: '600',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 12,
        color: Colors.dark.primary,
        textTransform: 'uppercase',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.dark.bgSurface,
    },
    headerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    username: {
        fontSize: 13,
    },
    verifiedText: {
        fontSize: 12,
    },
    messageBox: {
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    messageText: {
        fontSize: 15,
        fontStyle: 'italic',
        lineHeight: 22,
        marginBottom: 12,
        zIndex: 1,
    },
    attribution: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: 10,
    },
    smallAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    attributionText: {
        fontSize: 12,
        flex: 1,
    },
    inlineName: {
        fontSize: 12,
        color: Colors.dark.textPrimary,
    },
    inlineNeed: {
        fontSize: 12,
        color: Colors.dark.primary,
    },
    quoteMark: {
        position: 'absolute',
        top: -10,
        left: 10,
        fontSize: 60,
        opacity: 0.1,
        color: Colors.dark.primary,
        fontFamily: 'serif',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    mainActions: {
        flexDirection: 'row',
        gap: 20,
    },
    actionBtn: {
        padding: 4,
    }
});
