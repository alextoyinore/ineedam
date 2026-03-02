import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    SafeAreaView,
    Platform
} from 'react-native';
import { ArrowLeft, Users, Loader } from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import { getSuggestedProfiles } from '@/src/services/profileService';
import { toggleFollow, isFollowing } from '@/src/services/socialService';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H2, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function WhoToFollowScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

    const loadSuggestedUsers = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const users = await getSuggestedProfiles(user.id, 20);
            setSuggestedUsers(users);

            // Initialize following states
            const states: Record<string, boolean> = {};
            for (const u of users) {
                const following = await isFollowing(user.id, u.id);
                states[u.id] = following;
            }
            setFollowingStates(states);
        } catch (err) {
            console.error("Failed to load suggested users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuggestedUsers();
    }, [user]);

    const handleFollowToggle = async (targetUserId: string) => {
        if (!user) return;

        // Optimistic update
        const currentState = followingStates[targetUserId];
        setFollowingStates(prev => ({ ...prev, [targetUserId]: !currentState }));

        try {
            await toggleFollow(user.id, targetUserId);
        } catch (err) {
            console.error("Failed to toggle follow", err);
            // Revert on error
            setFollowingStates(prev => ({ ...prev, [targetUserId]: currentState }));
        }
    };

    const renderUser = ({ item: profile }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(tabs)/profile?username=${profile.username}`)}
            style={styles.userCard}
        >
            <View style={styles.avatarContainer}>
                {profile.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                ) : (
                    <LinearGradient
                        colors={Colors.gradients.primary as [string, string, ...string[]]}
                        style={styles.avatarPlaceholder}
                    >
                        <BodyBold style={styles.avatarInitial}>
                            {profile.display_name?.charAt(0).toUpperCase()}
                        </BodyBold>
                    </LinearGradient>
                )}
            </View>
            <View style={styles.userInfo}>
                <BodyBold numberOfLines={1} style={styles.displayName}>{profile.display_name}</BodyBold>
                <Muted numberOfLines={1}>@{profile.username}</Muted>
                {profile.bio && (
                    <Body numberOfLines={1} style={styles.bio}>{profile.bio}</Body>
                )}
            </View>
            <TouchableOpacity
                onPress={() => handleFollowToggle(profile.id)}
                style={[
                    styles.followBtn,
                    followingStates[profile.id] ? styles.followingBtn : styles.followBtnPrimary
                ]}
            >
                <BodyBold style={[
                    styles.followBtnText,
                    followingStates[profile.id] ? styles.followingBtnText : styles.followBtnTextPrimary
                ] as any}>
                    {followingStates[profile.id] ? 'Following' : 'Follow'}
                </BodyBold>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={Colors.dark.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Users size={20} color={Colors.dark.primary} />
                    <H2 style={styles.headerTitle}>Who to follow</H2>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.dark.primary} />
                </View>
            ) : suggestedUsers.length > 0 ? (
                <FlatList
                    data={suggestedUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUser}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Users size={48} color={Colors.dark.textMuted} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <H2 style={{ textAlign: 'center', marginBottom: 8 }}>No suggestions</H2>
                    <Muted style={{ textAlign: 'center' }}>Check back later for more people to follow.</Muted>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.bgBase,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
        gap: 16,
    },
    backBtn: {
        padding: 4,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        marginVertical: 0,
    },
    listContent: {
        paddingBottom: 40,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
        gap: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        color: '#fff',
        fontSize: 18,
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
    },
    displayName: {
        fontSize: 16,
    },
    bio: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    followBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 100,
        alignItems: 'center',
    },
    followBtnPrimary: {
        backgroundColor: Colors.dark.primary,
    },
    followingBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    followBtnText: {
        fontSize: 14,
    },
    followBtnTextPrimary: {
        color: '#fff',
    },
    followingBtnText: {
        color: Colors.dark.textPrimary,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    }
});
