import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMessages } from '@/src/context/MessagesContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MessagesScreen() {
    const { threads, loadingThreads, markThreadAsRead } = useMessages();
    const theme = useColorScheme() ?? 'light';
    const [searchQuery, setSearchQuery] = useState('');

    const filteredThreads = useMemo(() => {
        if (!searchQuery.trim()) return threads;
        const q = searchQuery.toLowerCase();
        return threads.filter(t =>
            t.withUser?.toLowerCase().includes(q) ||
            t.withUserUsername?.toLowerCase().includes(q)
        );
    }, [threads, searchQuery]);

    const handleThreadPress = (thread: any) => {
        markThreadAsRead(thread.id);
        // router.push(`/(tabs)/messages/${thread.id}`);
        console.log('Navigate to thread:', thread.id);
    };

    if (loadingThreads && threads.length === 0) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <ThemedText type="subtitle" style={styles.title}>Messages</ThemedText>
                    <TouchableOpacity style={styles.composeButton}>
                        <IconSymbol name="mail.outline" size={20} color={Colors[theme].tint} />
                    </TouchableOpacity>
                </View>
                <View style={[styles.searchContainer, { backgroundColor: '#35363615' }]}>
                    <IconSymbol name="chevron.right" size={16} color={Colors[theme].tabIconDefault} />
                    <TextInput
                        placeholder="Search messages"
                        placeholderTextColor={Colors[theme].tabIconDefault}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[styles.searchInput, { color: Colors[theme].text }]}
                    />
                </View>
            </View>

            <FlatList
                data={filteredThreads}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleThreadPress(item)}
                        style={[styles.threadItem, { borderBottomColor: Colors[theme].tabIconDefault + '20' }]}
                    >
                        {item.unread && <View style={styles.unreadDot} />}
                        <View style={[styles.avatar, { backgroundColor: Colors[theme].tint }]}>
                            {item.withUserAvatar ? (
                                <Image source={{ uri: item.withUserAvatar }} style={styles.avatarImage} />
                            ) : (
                                <ThemedText style={styles.avatarText}>{item.withUser[0].toUpperCase()}</ThemedText>
                            )}
                        </View>
                        <View style={styles.threadInfo}>
                            <View style={styles.threadHeader}>
                                <ThemedText type="defaultSemiBold" style={styles.withUser}>{item.withUser}</ThemedText>
                                <ThemedText style={styles.timestamp}>
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </ThemedText>
                            </View>
                            <ThemedText
                                numberOfLines={1}
                                style={[styles.lastMessage, item.unread && { color: Colors[theme].text, fontWeight: '600' }]}
                            >
                                {item.lastMessage}
                            </ThemedText>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>
                            {searchQuery ? `No conversations found for "${searchQuery}"` : "No messages yet."}
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#35363620',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
    },
    composeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#35363610',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 20,
        height: 40,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
    },
    threadItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    unreadDot: {
        position: 'absolute',
        left: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3b82f6',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    threadInfo: {
        flex: 1,
    },
    threadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    withUser: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        opacity: 0.5,
    },
    lastMessage: {
        fontSize: 14,
        opacity: 0.6,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        opacity: 0.5,
    },
});
