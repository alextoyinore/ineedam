import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { Body, BodyBold, Muted } from '@/src/components/ui/Typography';

interface ReplyItemProps {
    reply: any;
    profile: any;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({ reply, profile }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }}
                    style={styles.avatar}
                />
                <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                        <BodyBold>{profile.display_name}</BodyBold>
                        <Muted style={styles.username}>@{profile.username}</Muted>
                    </View>
                    <Muted style={styles.replyingTo}>
                        Replying to need <BodyBold style={styles.needTitle}>"{reply.needs?.title}"</BodyBold>
                    </Muted>
                </View>
            </View>
            <Body style={styles.content}>{reply.content}</Body>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.dark.bgSurface,
    },
    headerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    username: {
        fontSize: 13,
    },
    replyingTo: {
        fontSize: 12,
        marginTop: 2,
    },
    needTitle: {
        fontSize: 12,
        color: Colors.dark.primary,
    },
    content: {
        fontSize: 15,
        lineHeight: 22,
        marginLeft: 52,
    }
});
