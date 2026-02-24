import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, View, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { fetchMixedFeed } from '../../src/lib/feedService';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NeedCard } from '@/components/ui/need-card';
import { EndorsementCard } from '@/components/ui/endorsement-card';
import { useAuth } from '@/src/context/AuthContext';
import { fetchUserLikes } from '@/src/lib/likesService';
import { fetchUserBroadcasts } from '@/src/lib/broadcastService';
import { fetchBookmarks } from '@/src/lib/bookmarkService';

type FeedType = 'global' | 'following';

export default function HomeScreen() {
  const theme = useColorScheme() ?? 'light';
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedType>('global');

  // User social state sets
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [broadcastedIds, setBroadcastedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const loadUserState = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [likes, broadcasts, bookmarks] = await Promise.all([
        fetchUserLikes(user.id),
        fetchUserBroadcasts(user.id),
        fetchBookmarks(user.id),
      ]);
      setLikedIds(new Set(likes));
      setBroadcastedIds(new Set(broadcasts));
      setBookmarkedIds(new Set(bookmarks.map((b: any) => b.id)));
    } catch (err) {
      console.error('Error loading user social state:', err);
    }
  }, [user?.id]);

  const loadFeed = useCallback(async (isRefresh = false, type: FeedType = activeTab) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await fetchMixedFeed(0, 19, type, user?.id);
      setItems(data);
    } catch (error) {
      console.error('Error loading mobile feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    loadFeed(false, activeTab);
    loadUserState();
  }, [activeTab, user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed(true, activeTab);
    loadUserState();
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'endorsement') {
      return (
        <EndorsementCard
          endorsement={item}
          currentUserId={user?.id}
          initialLiked={item.needs ? likedIds.has(item.needs.id) : false}
          initialBroadcasted={item.needs ? broadcastedIds.has(item.needs.id) : false}
          initialBookmarked={bookmarkedIds.has(item.id)}
          onBookmarkChange={(id, isBookmarked) => {
            setBookmarkedIds(prev => {
              const next = new Set(prev);
              isBookmarked ? next.add(id) : next.delete(id);
              return next;
            });
          }}
        />
      );
    }

    return (
      <NeedCard
        need={item}
        currentUserId={user?.id}
        initialLiked={likedIds.has(item.id)}
        initialBroadcasted={broadcastedIds.has(item.id)}
        initialBookmarked={bookmarkedIds.has(item.id)}
        onBookmarkChange={(needId, isBookmarked) => {
          setBookmarkedIds(prev => {
            const next = new Set(prev);
            isBookmarked ? next.add(needId) : next.delete(needId);
            return next;
          });
        }}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Tab Header */}
      <View style={[styles.tabContainer, { borderBottomColor: Colors[theme].tabIconDefault + '30' }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'global' && styles.activeTab]}
          onPress={() => setActiveTab('global')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'global' && { color: Colors[theme].tint, fontWeight: '600' } as any]}>
            For You
          </ThemedText>
          {activeTab === 'global' && <View style={[styles.activeIndicator, { backgroundColor: Colors[theme].tint }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'following' && { color: Colors[theme].tint, fontWeight: '600' } as any]}>
            Following
          </ThemedText>
          {activeTab === 'following' && <View style={[styles.activeIndicator, { backgroundColor: Colors[theme].tint }]} />}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
        </ThemedView>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors[theme].tint}
            />
          }
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              {activeTab === 'following' ? "You aren't following anyone with activity yet." : 'No items found in the feed.'}
            </ThemedText>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', position: 'relative' },
  activeTab: {},
  tabText: { fontSize: 16, color: '#71717a', fontWeight: '500' },
  activeIndicator: {
    position: 'absolute', bottom: -1, height: 3, width: '40%',
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#71717a', paddingHorizontal: 20 },
});
