import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotifications } from '@/src/context/NotificationsContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
    const { notifications, loading, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const theme = useColorScheme() ?? 'light';
    const router = useRouter();

    const getIcon = (type: string) => {
        switch (type) {
            case 'follow': return { name: 'person.outline', color: '#3b82f6' };
            case 'reply': return { name: 'message.outline', color: '#10b981' };
            case 'like': return { name: 'heart.outline', color: '#ef4444' };
            default: return { name: 'bell.outline', color: Colors[theme].tabIconDefault };
        }
    };

    const handleNotificationPress = (notif: any) => {
        markAsRead(notif.id);
        if (notif.type === 'follow' && notif.actorProfile?.username) {
            // router.push(`/(tabs)/profile?username=${notif.actorProfile.username}`);
            console.log('Navigate to profile:', notif.actorProfile.username);
        } else if ((notif.type === 'reply' || notif.type === 'like') && notif.reference_id) {
            console.log('Navigate to need:', notif.reference_id);
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
            <View style={styles.header}>
                <ThemedText type="subtitle">Notifications</ThemedText>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
                        <IconSymbol name="chevron.right" size={20} color={Colors[theme].tint} />
                        {/* Using chevron as placeholder for "Check" if not mapped, wait I added mappings */}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearNotifications} style={[styles.headerButton, { marginLeft: 10 }]}>
                        <IconSymbol name="tag.outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => {
                    const icon = getIcon(item.type);
                    return (
                        <TouchableOpacity
                            onPress={() => handleNotificationPress(item)}
                            style={[
                                styles.notificationItem,
                                !item.read && { backgroundColor: Colors[theme].tint + '08' },
                                { borderBottomColor: Colors[theme].tabIconDefault + '20' }
                            ]}
                        >
                            {!item.read && <View style={styles.unreadDot} />}
                            <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
                                <IconSymbol name={icon.name as any} size={20} color={icon.color} />
                            </View>
                            <View style={styles.notifContent}>
                                <ThemedText style={styles.notifMessage}>
                                    <ThemedText type="defaultSemiBold">{item.actorProfile?.display_name || 'System'}</ThemedText> {item.message}
                                </ThemedText>
                                <ThemedText style={styles.notifTime}>
                                    {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="bell.outline" size={64} color={Colors[theme].tabIconDefault} style={{ opacity: 0.2 }} />
                        <ThemedText type="subtitle" style={styles.emptyTitle}>No notifications yet</ThemedText>
                        <ThemedText style={styles.emptyText}>
                            When people follow you or reply to your needs, you'll see them here.
                        </ThemedText>
                    </View>
                }
            />
        </ThemedView>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#35363620',
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerButton: {
        padding: 8,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    unreadDot: {
        position: 'absolute',
        left: 6,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#3b82f6',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notifContent: {
        flex: 1,
    },
    notifMessage: {
        fontSize: 15,
        lineHeight: 20,
    },
    notifTime: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 4,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        marginTop: 60,
    },
    emptyTitle: {
        marginTop: 20,
        marginBottom: 8,
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.6,
        lineHeight: 20,
    },
});
