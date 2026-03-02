import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { Heart, MessageSquare, Repeat2, UserPlus, Bell, Zap } from 'lucide-react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H1, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { Image } from 'expo-image';
import { supabase } from '@/src/lib/supabase';
import { fetchNotifications, markNotificationAsRead, Notification } from '@/src/services/notificationService';

const getIconForType = (type: string) => {
    switch (type) {
        case 'like': return { icon: Heart, color: '#ef4444' };
        case 'reply': return { icon: MessageSquare, color: Colors.dark.primary };
        case 'follow': return { icon: UserPlus, color: Colors.dark.secondary };
        case 'broadcast': return { icon: Zap, color: '#f59e0b' };
        default: return { icon: Bell, color: Colors.dark.textMuted };
    }
};

const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
};

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const data = await fetchNotifications(user.id);
                setNotifications(data);
            }
        } catch (err) {
            console.error('Error loading notifications:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const handlePress = async (id: string, read: boolean) => {
        if (!read) {
            try {
                await markNotificationAsRead(id);
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, read: true } : n)
                );
            } catch (err) {
                console.error('Error marking as read:', err);
            }
        }
        // Navigate to post/profile logic here
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <H1>Notifications</H1>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    const { icon: Icon, color } = getIconForType(item.type);
                    return (
                        <TouchableOpacity
                            style={[
                                styles.notificationItem,
                                !item.read && styles.unreadItem
                            ]}
                            onPress={() => handlePress(item.id, item.read)}
                        >
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: item.actorProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
                                    style={styles.avatar}
                                />
                                <View style={[styles.iconBadge, { backgroundColor: color }]}>
                                    <Icon size={10} color="#fff" />
                                </View>
                            </View>
                            <View style={styles.content}>
                                <Body>
                                    <BodyBold>{item.actorProfile?.display_name || 'Someone'}</BodyBold> {item.message}
                                </Body>
                                <Muted>{timeAgo(item.created_at)}</Muted>
                            </View>
                            {!item.read && <View style={styles.unreadDot} />}
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListEmptyComponent={
                    isLoading ? (
                        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 50 }} />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Bell size={48} color={Colors.dark.textMuted} strokeWidth={1} />
                            <Muted style={{ marginTop: Spacing.md }}>No notifications yet</Muted>
                        </View>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.bgBase,
    },
    header: {
        padding: Spacing.lg,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    listContent: {
        paddingBottom: 100,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
        gap: Spacing.md,
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    iconBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.dark.bgBase,
    },
    content: {
        flex: 1,
        gap: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.dark.primary,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    }
});
