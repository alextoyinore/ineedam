import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { useRouter } from 'expo-router';

interface UserListItemProps {
    user: any;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push({ pathname: '/(tabs)/profile', params: { username: user.username } })}
        >
            <Image
                source={{ uri: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <BodyBold>{user.display_name}</BodyBold>
                    <Muted style={styles.username}>@{user.username}</Muted>
                </View>
                {user.bio && (
                    <Body style={styles.bio} numberOfLines={1}>{user.bio}</Body>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.dark.bgSurface,
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    username: {
        fontSize: 13,
    },
    bio: {
        fontSize: 13,
        marginTop: 2,
        color: Colors.dark.textMuted,
    }
});
