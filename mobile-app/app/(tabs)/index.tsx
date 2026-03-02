import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Image,
  ScrollView
} from 'react-native';
import { Plus, HelpCircle, Layers, Users } from 'lucide-react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H1, BodyBold, Muted } from '@/src/components/ui/Typography';
import { NeedCard } from '@/src/components/feed/NeedCard';
import { EndorsementCard } from '@/src/components/profile/EndorsementCard';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchMixedFeed, fetchFollowingFeed } from '@/src/services/feedService';
import { useAuth } from '@/src/context/AuthContext'; // Assume we have this for Following feed
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

type FeedItem = any;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const scrollY = useRef(new Animated.Value(0)).current;

  const loadFeed = async (isRefreshing = false) => {
    if (!isRefreshing) setIsLoading(true);
    try {
      let data: FeedItem[] = [];
      if (activeTab === 'foryou') {
        data = await fetchMixedFeed(0, 15);
      } else if (user) {
        data = await fetchFollowingFeed(user.id, 0, 15);
      }
      setItems(data);
    } catch (err) {
      console.error('Error loading feed:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed(true);
  };

  // Branding Animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [140, 100],
    extrapolate: 'clamp',
  });

  const brandingOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderItem = ({ item }: { item: FeedItem }) => {
    if (item.type === 'need' || item.type === 'broadcast') {
      return <NeedCard need={item} broadcastedBy={item.broadcasted_by} onPress={(id) => router.push(`/need/${id}` as any)} />;
    }
    if (item.type === 'endorsement' || item.type === 'broadcast_endorsement') {
      return <EndorsementCard endorsement={item} broadcastedBy={item.broadcasted_by} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Branding Header & Tabs */}
      <Animated.View style={[
        styles.brandingHeader,
        { height: headerHeight }
      ]}>
        <Animated.View style={[styles.headerTop, { opacity: brandingOpacity }]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
            />
            <H1 style={styles.logoText}>Ineedam</H1>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/categories')}>
              <Layers size={20} color={Colors.dark.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/who-to-follow')}>
              <Users size={20} color={Colors.dark.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          {['foryou', 'following'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={styles.tabItem}
            >
              <BodyBold style={{
                ...styles.tabText,
                ...(activeTab === tab ? { color: Colors.dark.textPrimary } : {})
              } as any}>
                {tab === 'foryou' ? 'For You' : 'Following'}
              </BodyBold>
              {activeTab === tab && (
                <View style={styles.tabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <LinearGradient
          colors={Colors.gradients.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoLine}
        />
      </Animated.View>

      <Animated.FlatList
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: 140 } // Initial header space
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
            colors={[Colors.dark.primary]}
            progressViewOffset={140}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Muted>{activeTab === 'following' ? 'Not following anyone yet or they haven\'t posted.' : 'No posts found.'}</Muted>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator size="small" color={Colors.dark.primary} style={{ padding: 20 }} />
          ) : null
        }
      />

      {/* Mobile FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/post-need' as any)}
      >
        <LinearGradient
          colors={Colors.gradients.primary as [string, string, ...string[]]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={32} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bgBase,
  },
  brandingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.dark.bgBase,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.dark.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.bgSurfaceGlass,
    borderWidth: 1,
    borderColor: Colors.dark.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 50,
    borderBottomWidth: 1,
    borderColor: Colors.dark.borderGlass,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabText: {
    fontSize: 15,
    color: Colors.dark.textMuted,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '40%',
    height: 4,
    backgroundColor: Colors.dark.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  logoLine: {
    height: 2,
    width: '100%',
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

