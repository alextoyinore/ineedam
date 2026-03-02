import React, { useRef, useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Animated,
    TouchableOpacity,
    Dimensions,
    Platform,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
    ArrowLeft, MapPin, Calendar, Users,
    Settings, Mail, MoreVertical, ShieldCheck
} from 'lucide-react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H1, H2, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { NeedCard } from '@/src/components/feed/NeedCard';
import { EndorsementCard } from '@/src/components/profile/EndorsementCard';
import { ReplyItem } from '@/src/components/profile/ReplyItem';
import { UserListItem } from '@/src/components/profile/UserListItem';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/src/lib/supabase';
import { fetchNeedsByUser, fetchMetCounts, ShapedNeed } from '@/src/services/needsService';
import { getFollowStats, getFollowers, getFollowing } from '@/src/services/socialService';
import { fetchRepliesByUser } from '@/src/services/replyService';
import { fetchBroadcastedNeeds } from '@/src/services/broadcastService';
import { fetchEndorsementsForUser } from '@/src/services/endorsementService';

const { width } = Dimensions.get('window');

const TABS = ['Posts', 'Broadcasts', 'Endorsements', 'Replies', 'Following', 'Followers'];

export default function ProfileScreen() {
    const { username: routeUsername } = useLocalSearchParams();
    const router = useRouter();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [activeTab, setActiveTab] = useState('Posts');
    const [profile, setProfile] = useState<any>(null);
    const [needs, setNeeds] = useState<ShapedNeed[]>([]);
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [endorsements, setEndorsements] = useState<any[]>([]);
    const [replies, setReplies] = useState<any[]>([]);
    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [stats, setStats] = useState({
        needsMet: 0,
        fulfilledRequests: 0,
        followersCount: 0,
        followingCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadProfileData = async () => {
        try {
            // 1. Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', routeUsername || 'alextoyin') // Default for demo if no param
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            // 2. Fetch All Tab Data & Stats
            if (profileData) {
                const [
                    userNeeds,
                    userStats,
                    followStats,
                    userReplies,
                    userBroadcasts,
                    userEndorsements,
                    userFollowers,
                    userFollowing
                ] = await Promise.all([
                    fetchNeedsByUser(profileData.id),
                    fetchMetCounts(profileData.id),
                    getFollowStats(profileData.id),
                    fetchRepliesByUser(profileData.id),
                    fetchBroadcastedNeeds(profileData.id),
                    fetchEndorsementsForUser(profileData.id),
                    getFollowers(profileData.id),
                    getFollowing(profileData.id)
                ]);

                setNeeds(userNeeds);
                setStats({ ...userStats, ...followStats });
                setReplies(userReplies);
                setBroadcasts(userBroadcasts);
                setEndorsements(userEndorsements);
                setFollowers(userFollowers);
                setFollowing(userFollowing);
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadProfileData();
    }, [routeUsername]);

    const onRefresh = () => {
        setRefreshing(true);
        loadProfileData();
    };

    // Header Animations
    const headerOpacity = scrollY.interpolate({
        inputRange: [150, 200],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const bannerScale = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: [1.5, 1],
        extrapolateRight: 'clamp',
    });

    if (isLoading && !refreshing) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.container, styles.center]}>
                <Muted>User not found</Muted>
            </View>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Posts':
                return needs.map(need => <NeedCard key={need.id} need={need} />);
            case 'Broadcasts':
                return broadcasts.map(b => (
                    b.type === 'broadcast' ?
                        <NeedCard key={b.broadcast_id} need={b} broadcastedBy={b.broadcasted_by} /> :
                        <EndorsementCard key={b.broadcast_id} endorsement={b} broadcastedBy={b.broadcasted_by} />
                ));
            case 'Endorsements':
                return endorsements.map(e => <EndorsementCard key={e.id} endorsement={e} />);
            case 'Replies':
                return replies.map(r => <ReplyItem key={r.id} reply={r} profile={profile} />);
            case 'Following':
                return following.map(u => <UserListItem key={u.id} user={u} />);
            case 'Followers':
                return followers.map(u => <UserListItem key={u.id} user={u} />);
            default:
                return null;
        }
    };

    const getEmptyMessage = () => {
        switch (activeTab) {
            case 'Posts': return 'No posts yet';
            case 'Broadcasts': return 'No broadcasts yet';
            case 'Endorsements': return 'No endorsements yet';
            case 'Replies': return 'No replies yet';
            case 'Following': return 'Not following anyone';
            case 'Followers': return 'No followers yet';
            default: return 'No data available';
        }
    };

    const currentTabData = activeTab === 'Posts' ? needs :
        activeTab === 'Broadcasts' ? broadcasts :
            activeTab === 'Endorsements' ? endorsements :
                activeTab === 'Replies' ? replies :
                    activeTab === 'Following' ? following : followers;

    return (
        <View style={styles.container}>
            {/* Sticky Top Header (Transparent initially) */}
            <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
                <GlassPanel intensity={40} borderRadius={0} style={styles.headerGlass}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <ArrowLeft size={20} color={Colors.dark.textPrimary} />
                        </TouchableOpacity>
                        <View>
                            <BodyBold>{profile.display_name}</BodyBold>
                            <Muted style={{ fontSize: 11 }}>{needs.length} posts</Muted>
                        </View>
                    </View>
                </GlassPanel>
            </Animated.View>

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
            >
                {/* Banner */}
                <Animated.View style={[
                    styles.bannerContainer,
                    { transform: [{ scale: bannerScale }] }
                ]}>
                    <Image
                        source={{ uri: profile.banner_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' }}
                        style={styles.banner}
                        contentFit="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>

                {/* Profile Info Overlay */}
                <View style={styles.profileInfo}>
                    <View style={styles.avatarRow}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop' }} style={styles.avatar} />
                        </View>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => router.push('/settings')}
                        >
                            <Settings size={20} color={Colors.dark.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.nameSection}>
                        <View style={styles.displayNameRow}>
                            <H2>{profile.display_name}</H2>
                            {profile.id === '31080433-1e29-4eee-9b6f-673b1e159802' && <ShieldCheck size={18} color={Colors.dark.primary} />}
                        </View>
                        <Muted style={styles.username}>@{profile.username}</Muted>
                    </View>

                    <Body style={styles.bio}>{profile.bio}</Body>

                    <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                            <MapPin size={14} color={Colors.dark.textMuted} />
                            <Muted>{profile.location || 'Unknown'}</Muted>
                        </View>
                        <View style={styles.metaItem}>
                            <Calendar size={14} color={Colors.dark.textMuted} />
                            <Muted>Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</Muted>
                        </View>
                    </View>

                    {/* Stats Bar (Web Mirror) */}
                    <View style={styles.statsBar}>
                        <View style={styles.stat}>
                            <BodyBold>{stats.followingCount}</BodyBold>
                            <Muted style={styles.statLabel}>Following</Muted>
                        </View>
                        <View style={styles.stat}>
                            <BodyBold>{stats.followersCount}</BodyBold>
                            <Muted style={styles.statLabel}>Followers</Muted>
                        </View>
                        <View style={styles.stat}>
                            <BodyBold>{stats.needsMet}</BodyBold>
                            <Muted style={styles.statLabel}>Given</Muted>
                        </View>
                        <View style={styles.stat}>
                            <BodyBold>{stats.fulfilledRequests}</BodyBold>
                            <Muted style={styles.statLabel}>Received</Muted>
                        </View>
                    </View>
                </View>

                {/* Coordinated Sticky Tabs */}
                <View style={styles.tabsContainer}>
                    <GlassPanel intensity={20} borderRadius={0} style={styles.tabsGlass}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                            {TABS.map(tab => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={[styles.tab, { minWidth: width / 3.5 }]}
                                >
                                    <BodyBold style={{
                                        ...styles.tabText,
                                        ...(activeTab === tab ? { color: Colors.dark.primary } : {})
                                    } as any}>
                                        {tab}
                                    </BodyBold>
                                    {activeTab === tab && <View style={styles.tabIndicator} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </GlassPanel>
                </View>

                {/* Tab Content */}
                <View style={styles.tabContent}>
                    {renderTabContent()}
                    {currentTabData.length === 0 && (
                        <View style={{ padding: 60, alignItems: 'center' }}>
                            <Muted>{getEmptyMessage()}</Muted>
                        </View>
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.bgBase,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: Platform.OS === 'ios' ? 90 : 60,
    },
    headerGlass: {
        flex: 1,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 40 : 0,
        gap: Spacing.md,
    },
    backBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: Colors.dark.bgSurfaceGlass,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    bannerContainer: {
        height: 150,
        width: '100%',
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    profileInfo: {
        paddingHorizontal: Spacing.lg,
        marginTop: -40, // Pull up over banner
    },
    avatarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: Spacing.sm,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: Colors.dark.bgBase,
        backgroundColor: Colors.dark.bgSurface,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    editBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    editBtnText: {
        fontSize: 14,
    },
    nameSection: {
        marginBottom: Spacing.md,
    },
    displayNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    username: {
        fontSize: 15,
    },
    bio: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: Spacing.md,
    },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        marginTop: 2,
    },
    tabsContainer: {
        marginTop: Spacing.md,
        height: 50,
    },
    tabsGlass: {
        flex: 1,
    },
    tabs: {
        flexDirection: 'row',
        height: '100%',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontSize: 14,
        color: Colors.dark.textMuted,
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '40%',
        height: 3,
        backgroundColor: Colors.dark.primary,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    tabContent: {
        marginTop: 1,
    }
});
