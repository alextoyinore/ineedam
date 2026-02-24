import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/context/AuthContext';
import { fetchMetCounts } from '@/src/lib/needsService';
import { getFollowStats } from '@/src/lib/socialService';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
    const { user, profile, signOut } = useAuth();
    const theme = useColorScheme() ?? 'light';
    const [stats, setStats] = useState({
        needsMet: 0,
        fulfilledRequests: 0,
        followersCount: 0,
        followingCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;
            try {
                const [metStats, followStats] = await Promise.all([
                    fetchMetCounts(user.id),
                    getFollowStats(user.id)
                ]);
                setStats({ ...metStats, ...followStats });
            } catch (error) {
                console.error('Error loading profile stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user]);

    if (loading && !profile) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
            </ThemedView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Banner */}
            <View style={[styles.banner, { backgroundColor: Colors[theme].tint }]}>
                {profile?.banner_url && (
                    <Image source={{ uri: profile.banner_url }} style={styles.bannerImage} />
                )}
            </View>

            {/* Profile Info Section */}
            <View style={styles.content}>
                <View style={styles.avatarRow}>
                    <View style={[styles.avatar, { borderColor: Colors[theme].background, backgroundColor: Colors[theme].tint }]}>
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                        ) : (
                            <ThemedText style={styles.avatarText}>{profile?.display_name?.[0].toUpperCase() || 'U'}</ThemedText>
                        )}
                    </View>
                    <TouchableOpacity style={[styles.editButton, { borderColor: Colors[theme].tabIconDefault + '40' }]}>
                        <ThemedText type="defaultSemiBold">Edit Profile</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.nameSection}>
                    <ThemedText type="title" style={styles.displayName}>{profile?.display_name}</ThemedText>
                    <ThemedText style={styles.username}>@{profile?.username}</ThemedText>
                </View>

                {profile?.bio && (
                    <ThemedText style={styles.bio}>{profile.bio}</ThemedText>
                )}

                <View style={styles.metaRow}>
                    {profile?.location && (
                        <View style={styles.metaItem}>
                            <IconSymbol name="map.outline" size={16} color={Colors[theme].tabIconDefault} />
                            <ThemedText style={styles.metaText}>{profile.location}</ThemedText>
                        </View>
                    )}
                    <View style={styles.metaItem}>
                        <IconSymbol name="clock.outline" size={16} color={Colors[theme].tabIconDefault} />
                        <ThemedText style={styles.metaText}>
                            Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </ThemedText>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{stats.followingCount}</ThemedText>
                        <ThemedText style={styles.statLabel}>Following</ThemedText>
                    </View>
                    <View style={styles.statItem}>
                        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{stats.followersCount}</ThemedText>
                        <ThemedText style={styles.statLabel}>Followers</ThemedText>
                    </View>
                    <View style={styles.statItem}>
                        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{stats.needsMet}</ThemedText>
                        <ThemedText style={styles.statLabel}>Given</ThemedText>
                    </View>
                    <View style={styles.statItem}>
                        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{stats.fulfilledRequests}</ThemedText>
                        <ThemedText style={styles.statLabel}>Received</ThemedText>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menu}>
                    <TouchableOpacity style={styles.menuItem}>
                        <IconSymbol name="person.outline" size={24} color={Colors[theme].text} />
                        <ThemedText style={styles.menuItemText}>Account Information</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <IconSymbol name="bell.outline" size={24} color={Colors[theme].text} />
                        <ThemedText style={styles.menuItemText}>Notification Settings</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <IconSymbol name="house.outline" size={24} color={Colors[theme].text} />
                        <ThemedText style={styles.menuItemText}>Privacy & Security</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={signOut}
                        style={[styles.menuItem, { marginTop: 20, borderTopWidth: 1, borderTopColor: '#35363620' }]}
                    >
                        <IconSymbol name="paperplane.outline" size={24} color="#ef4444" />
                        <ThemedText style={[styles.menuItemText, { color: '#ef4444' }]}>Sign Out</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
    banner: {
        height: 120,
        width: '100%',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 16,
    },
    avatarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: -40,
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    editButton: {
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 4,
    },
    nameSection: {
        marginBottom: 12,
    },
    displayName: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 15,
        opacity: 0.6,
    },
    bio: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 14,
        opacity: 0.6,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#35363620',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 16,
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 2,
    },
    menu: {
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
