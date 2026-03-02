import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { MessagePinOverlay } from '@/src/components/messages/MessagePinOverlay';
import { MessageSquare, Plus, Search } from 'lucide-react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H1, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { Image } from 'expo-image';
import { supabase } from '@/src/lib/supabase';
import { fetchUserThreads, Thread } from '@/src/services/messageService';

const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
};

export default function MessagesScreen() {
    const router = useRouter();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadThreads = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const data = await fetchUserThreads(user.id);
                setThreads(data);
            }
        } catch (err) {
            console.error('Error loading threads:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadThreads();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadThreads();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <H1>Messages</H1>
                    <TouchableOpacity style={styles.newChatBtn}>
                        <Plus size={24} color={Colors.dark.primary} />
                    </TouchableOpacity>
                </View>
                <GlassPanel intensity={10} style={styles.searchBar}>
                    <Search size={18} color={Colors.dark.textMuted} />
                    <Muted>Search messages...</Muted>
                </GlassPanel>
            </View>

            <FlatList
                data={threads}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.messageItem}
                        onPress={() => router.push(`/chat/${item.id}`)}
                    >
                        <Image
                            source={{ uri: item.withUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
                            style={styles.avatar}
                        />
                        <View style={styles.messageContent}>
                            <View style={styles.messageHeader}>
                                <BodyBold>{item.withUser}</BodyBold>
                                <Muted style={[
                                    styles.activeTime,
                                    !item.unread && { color: Colors.dark.textMuted, fontWeight: '400' }
                                ] as any}>{timeAgo(item.timestamp)}</Muted>
                            </View>
                            <Body
                                numberOfLines={1}
                                style={[
                                    styles.lastMessage,
                                    item.unread && styles.unreadText
                                ] as any}
                            >
                                {item.lastMessage}
                            </Body>
                        </View>
                        {item.unread && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListEmptyComponent={
                    isLoading ? (
                        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 50 }} />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MessageSquare size={48} color={Colors.dark.textMuted} strokeWidth={1} />
                            <Muted style={{ marginTop: Spacing.md }}>No messages yet</Muted>
                        </View>
                    )
                }
            />
            <MessagePinOverlay />
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
        gap: Spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    newChatBtn: {
        padding: 8,
        backgroundColor: Colors.dark.bgSurfaceGlass,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        height: 44,
        gap: 10,
    },
    listContent: {
        paddingBottom: 100,
    },
    messageItem: {
        flexDirection: 'row',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
        gap: Spacing.md,
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    messageContent: {
        flex: 1,
        gap: 4,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.dark.textMuted,
    },
    unreadText: {
        color: '#fff',
        fontWeight: '600',
    },
    activeTime: {
        color: Colors.dark.primary,
        fontWeight: '700',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.dark.primary,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    }
});
