import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/context/AuthContext';
import { fetchBookmarkedItems } from '@/src/lib/bookmarkService';
import { fetchUserLikes } from '@/src/lib/likesService';
import { fetchUserBroadcasts } from '@/src/lib/broadcastService';
import { NeedCard } from '@/components/ui/need-card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function BookmarksScreen() {
    const { user, profile } = useAuth();
    const theme = useColorScheme() ?? 'light';
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [broadcastedIds, setBroadcastedIds] = useState<Set<string>>(new Set());

    const loadData = useCallback(async () => {
        if (!user) {
            setItems([]);
            setLoading(false);
            return;
        }

        try {
            const [bookmarks, likes, broadcasts] = await Promise.all([
                fetchBookmarkedItems(user.id),
                fetchUserLikes(user.id),
                fetchUserBroadcasts(user.id),
            ]);
            setItems(bookmarks || []);
            setLikedIds(new Set(likes));
            setBroadcastedIds(new Set(broadcasts));
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleBookmarkChange = (needId: string, isBookmarked: boolean) => {
        if (!isBookmarked) {
            // Remove from list when unbookmarked
            setItems(prev => prev.filter(item => item.id !== needId));
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={items}
                renderItem={({ item }) => (
                    <NeedCard
                        need={item}
                        currentUserId={user?.id}
                        initialLiked={likedIds.has(item.id)}
                        initialBroadcasted={broadcastedIds.has(item.id)}
                        initialBookmarked={true} // everything here is bookmarked
                        onBookmarkChange={handleBookmarkChange}
                    />
                )}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors[theme].tint}
                    />
                }
                ListHeaderComponent={
                    items.length > 0 ? (
                        <View style={styles.header}>
                            <ThemedText style={styles.username}>
                                @{profile?.username || user?.email?.split('@')[0] || 'user'}
                            </ThemedText>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <IconSymbol name="bookmark.outline" size={48} color={Colors[theme].tabIconDefault} />
                        </View>
                        <ThemedText type="subtitle" style={styles.emptyTitle}>Save items for later</ThemedText>
                        <ThemedText style={styles.emptyText}>
                            Don't let the good ones get away! Bookmark a need or endorsement to easily find it again.
                        </ThemedText>
                    </View>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#35363620' },
    username: { fontSize: 14, opacity: 0.6 },
    emptyContainer: { padding: 40, alignItems: 'center', marginTop: 60 },
    emptyIconContainer: { padding: 24, borderRadius: 50, backgroundColor: '#35363610', marginBottom: 20 },
    emptyTitle: { marginBottom: 8 },
    emptyText: { textAlign: 'center', lineHeight: 20, opacity: 0.6 },
});
